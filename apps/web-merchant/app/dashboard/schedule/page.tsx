'use client';

/**
 * Schedule Page - Calendar & Appointment Management
 *
 * Features:
 * - Weekly/Monthly calendar views
 * - Pickup and delivery scheduling
 * - Equipment maintenance tracking
 * - Driver availability overview
 * - Google Calendar integration placeholder
 */

import * as React from 'react';
import { Calendar, Clock, Truck, Wrench, Plus, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge-v2';
import { Card } from '@/components/ui/card-v2';
import { cn } from '@/lib/utils';

const eventTypes = {
  pickup: { color: 'bg-blue-500', label: 'Pickup' },
  delivery: { color: 'bg-green-500', label: 'Delivery' },
  maintenance: { color: 'bg-orange-500', label: 'Maintenance' },
  appointment: { color: 'bg-purple-500', label: 'Appointment' },
};

const scheduleEvents = [
  { id: 1, type: 'pickup', time: '09:00', customer: 'Alice Johnson', driver: 'Michael Chen', date: '2025-10-20' },
  { id: 2, type: 'delivery', time: '10:30', customer: 'Robert Martinez', driver: 'Sarah Rodriguez', date: '2025-10-20' },
  { id: 3, type: 'maintenance', time: '14:00', equipment: 'Washer #2', technician: 'Service Team', date: '2025-10-20' },
  { id: 4, type: 'pickup', time: '15:30', customer: 'Emily Chen', driver: 'James Wilson', date: '2025-10-20' },
  { id: 5, type: 'appointment', time: '11:00', customer: 'New Customer Consultation', driver: 'N/A', date: '2025-10-21' },
];

export default function SchedulePage() {
  const [viewMode, setViewMode] = React.useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const todayEvents = scheduleEvents.filter(e => e.date === '2025-10-20');

  return (
    <div className="container mx-auto py-6 lg:py-10 px-4 lg:px-6 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage appointments, pickups, and deliveries</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">October 20, 2025</h2>
              <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('day')}>Day</Button>
              <Button variant={viewMode === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('week')}>Week</Button>
            </div>
          </div>

          <div className="space-y-3">
            {todayEvents.map(event => {
              const config = eventTypes[event.type as keyof typeof eventTypes];
              return (
                <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                  <div className="flex flex-col items-center">
                    <Clock className="h-4 w-4 text-gray-400 mb-1" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{event.time}</span>
                  </div>
                  <div className={cn('w-1 h-full rounded-full', config.color)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-white border-0', config.color)}>{config.label}</Badge>
                      <span className="font-semibold text-gray-900 dark:text-white">{event.customer || event.equipment}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.driver || event.technician}</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pickups Today</span>
                <span className="font-bold text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Deliveries Today</span>
                <span className="font-bold text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Drivers</span>
                <span className="font-bold text-gray-900 dark:text-white">4</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Upcoming</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Tomorrow: 6 pickups scheduled
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                Wednesday: Maintenance for 2 machines
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
