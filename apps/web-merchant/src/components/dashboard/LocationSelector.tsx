'use client';

/**
 * Location Selector Component
 * Phase 3: Enterprise Dashboard Architecture
 *
 * Dropdown selector for multi-location merchants
 * Inspired by GitHub organization switcher
 *
 * Features:
 * - "All Locations" option for aggregated view
 * - Search/filter locations
 * - Badge showing active location
 * - Persists selection in localStorage
 * - Keyboard navigation
 * - Mobile-responsive
 * - Recent locations
 */

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, MapPin, Search, X, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  isMain?: boolean;
}

export interface LocationSelectorProps {
  locations: Location[];
  selectedLocationId: string | null; // null = "All Locations"
  onLocationChange: (locationId: string | null) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
  storageKey?: string;
  maxRecentLocations?: number;
  className?: string;
}

export function LocationSelector({
  locations,
  selectedLocationId,
  onLocationChange,
  showAllOption = true,
  allOptionLabel = 'All Locations',
  storageKey = 'dryjets_selected_location',
  maxRecentLocations = 3,
  className,
}: LocationSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recentLocations, setRecentLocations] = React.useState<string[]>([]);

  // Load recent locations from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${storageKey}_recent`);
      if (stored) {
        try {
          setRecentLocations(JSON.parse(stored));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [storageKey]);

  // Save selection to localStorage
  const handleLocationChange = (locationId: string | null) => {
    onLocationChange(locationId);

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, locationId || 'all');

      // Update recent locations
      if (locationId) {
        const newRecent = [
          locationId,
          ...recentLocations.filter((id) => id !== locationId),
        ].slice(0, maxRecentLocations);
        setRecentLocations(newRecent);
        localStorage.setItem(`${storageKey}_recent`, JSON.stringify(newRecent));
      }
    }

    setOpen(false);
    setSearchQuery('');
  };

  // Filter locations based on search
  const filteredLocations = React.useMemo(() => {
    if (!searchQuery.trim()) return locations;

    const query = searchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.city?.toLowerCase().includes(query) ||
        loc.address?.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  // Get selected location details
  const selectedLocation = selectedLocationId
    ? locations.find((loc) => loc.id === selectedLocationId)
    : null;

  // Recent locations (filtered)
  const recentLocationsList = recentLocations
    .map((id) => locations.find((loc) => loc.id === id))
    .filter(Boolean) as Location[];

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'border border-[#E5E7EB] dark:border-[#2A2A2D]',
            'bg-white dark:bg-[#0A0A0B]',
            'text-[#111827] dark:text-[#FAFAFA]',
            'hover:bg-[#F9FAFB] dark:hover:bg-[#161618]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2',
            className,
          )}
        >
          <MapPin className="h-4 w-4 text-[#6B7280] dark:text-[#A1A1A6]" />
          <span className="text-sm font-medium truncate max-w-[200px]">
            {selectedLocation ? selectedLocation.name : allOptionLabel}
          </span>
          {locations.length > 1 && (
            <ChevronDown
              className={cn(
                'h-4 w-4 text-[#6B7280] dark:text-[#A1A1A6] transition-transform',
                open && 'rotate-180',
              )}
            />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className={cn(
            'w-80 rounded-lg',
            'border border-[#E5E7EB] dark:border-[#2A2A2D]',
            'bg-white dark:bg-[#0A0A0B]',
            'shadow-lg',
            'z-[1100]',
            'data-[state=open]:animate-fade-in',
            'data-[state=closed]:animate-fade-out',
          )}
        >
          {/* Search */}
          {locations.length > 5 && (
            <div className="p-3 border-b border-[#F3F4F6] dark:border-[#1A1A1D]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] dark:text-[#636366]" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full pl-9 pr-9 py-2 text-sm',
                    'border border-[#E5E7EB] dark:border-[#2A2A2D] rounded-md',
                    'bg-white dark:bg-[#0A0A0B]',
                    'text-[#111827] dark:text-[#FAFAFA]',
                    'placeholder:text-[#9CA3AF] dark:placeholder:text-[#636366]',
                    'focus:outline-none focus:ring-2 focus:ring-[#0066FF]',
                  )}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Location List */}
          <div className="max-h-80 overflow-y-auto py-2">
            {/* All Locations Option */}
            {showAllOption && !searchQuery && (
              <>
                <button
                  onClick={() => handleLocationChange(null)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2',
                    'text-left text-sm',
                    'hover:bg-[#F9FAFB] dark:hover:bg-[#161618]',
                    'transition-colors duration-150',
                  )}
                >
                  <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[#0066FF]/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-[#0066FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111827] dark:text-[#FAFAFA]">
                      {allOptionLabel}
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                      View all locations
                    </p>
                  </div>
                  {!selectedLocationId && (
                    <Check className="h-4 w-4 text-[#0066FF] flex-shrink-0" />
                  )}
                </button>
                <div className="my-2 h-px bg-[#F3F4F6] dark:bg-[#1A1A1D]" />
              </>
            )}

            {/* Recent Locations */}
            {!searchQuery && recentLocationsList.length > 0 && (
              <>
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-[#6B7280] dark:text-[#A1A1A6] uppercase tracking-wider">
                    Recent
                  </p>
                </div>
                {recentLocationsList.map((location) => (
                  <LocationItem
                    key={location.id}
                    location={location}
                    isSelected={selectedLocationId === location.id}
                    onClick={() => handleLocationChange(location.id)}
                  />
                ))}
                <div className="my-2 h-px bg-[#F3F4F6] dark:bg-[#1A1A1D]" />
              </>
            )}

            {/* All Locations List */}
            {filteredLocations.length > 0 ? (
              <>
                {!searchQuery && recentLocationsList.length > 0 && (
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-[#6B7280] dark:text-[#A1A1A6] uppercase tracking-wider">
                      All Locations
                    </p>
                  </div>
                )}
                {filteredLocations.map((location) => (
                  <LocationItem
                    key={location.id}
                    location={location}
                    isSelected={selectedLocationId === location.id}
                    onClick={() => handleLocationChange(location.id)}
                  />
                ))}
              </>
            ) : (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                  No locations found
                </p>
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * Location Item - Individual location in the list
 */
interface LocationItemProps {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
}

function LocationItem({ location, isSelected, onClick }: LocationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2',
        'text-left text-sm',
        'hover:bg-[#F9FAFB] dark:hover:bg-[#161618]',
        'transition-colors duration-150',
      )}
    >
      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[#F3F4F6] dark:bg-[#1A1A1D] flex items-center justify-center">
        <MapPin className="h-4 w-4 text-[#6B7280] dark:text-[#A1A1A6]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[#111827] dark:text-[#FAFAFA] truncate">
            {location.name}
          </p>
          {location.isMain && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-[#0066FF]/10 text-[#0066FF] rounded">
              Main
            </span>
          )}
        </div>
        {(location.city || location.address) && (
          <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6] truncate">
            {location.city && location.state
              ? `${location.city}, ${location.state}`
              : location.address}
          </p>
        )}
      </div>
      {isSelected && <Check className="h-4 w-4 text-[#0066FF] flex-shrink-0" />}
    </button>
  );
}

/**
 * Location Badge - Display selected location in compact form
 */
export interface LocationBadgeProps {
  location: Location | null;
  allLocationLabel?: string;
  onClick?: () => void;
  className?: string;
}

export function LocationBadge({
  location,
  allLocationLabel = 'All Locations',
  onClick,
  className,
}: LocationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md',
        'bg-[#F3F4F6] dark:bg-[#1A1A1D]',
        'text-xs font-medium text-[#6B7280] dark:text-[#A1A1A6]',
        'hover:bg-[#E5E7EB] dark:hover:bg-[#2A2A2D]',
        'transition-colors duration-150',
        className,
      )}
    >
      <MapPin className="h-3 w-3" />
      <span className="truncate max-w-[120px]">
        {location ? location.name : allLocationLabel}
      </span>
    </button>
  );
}

/**
 * Hook to manage location selection state with localStorage persistence
 */
export function useLocationSelection(
  locations: Location[],
  storageKey: string = 'dryjets_selected_location'
) {
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(null);

  // Load from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && stored !== 'all') {
        // Verify location still exists
        if (locations.find((loc) => loc.id === stored)) {
          setSelectedLocationId(stored);
        }
      }
    }
  }, [locations, storageKey]);

  // Save to localStorage on change
  const handleLocationChange = (locationId: string | null) => {
    setSelectedLocationId(locationId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, locationId || 'all');
    }
  };

  const selectedLocation = selectedLocationId
    ? locations.find((loc) => loc.id === selectedLocationId) || null
    : null;

  return {
    selectedLocationId,
    selectedLocation,
    setSelectedLocationId: handleLocationChange,
  };
}
