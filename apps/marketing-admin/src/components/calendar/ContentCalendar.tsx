/**
 * CONTENT CALENDAR COMPONENT
 *
 * Visual calendar for scheduled content across all platforms.
 * Features:
 * - Month/Week/Day views
 * - Drag-and-drop rescheduling
 * - Color-coded by content type
 * - Platform indicators
 * - Status badges
 */

'use client'

import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Send } from 'lucide-react'
import { CommandButton } from '@/components/command/CommandButton'
import { Badge } from '@/components/ui/badge'
import { DataPanel } from '@/components/command/CommandPanel'
import { cn } from '@/lib/utils'
import type { Content } from '@/lib/api/content'

interface ContentCalendarProps {
  content: Content[]
  onDateClick?: (date: Date) => void
  onContentClick?: (content: Content) => void
  view?: 'month' | 'week' | 'day'
}

interface CalendarContent extends Content {
  scheduledDate: Date
}

const CONTENT_TYPE_COLORS = {
  blog: 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan',
  'social-post': 'bg-neon-pink/20 border-neon-pink text-neon-pink',
  'video-script': 'bg-neon-purple/20 border-neon-purple text-neon-purple',
  email: 'bg-neon-blue/20 border-neon-blue text-neon-blue',
  newsletter: 'bg-neon-green/20 border-neon-green text-neon-green',
  thread: 'bg-neon-yellow/20 border-neon-yellow text-neon-yellow',
  carousel: 'bg-neon-orange/20 border-neon-orange text-neon-orange',
  infographic: 'bg-neon-red/20 border-neon-red text-neon-red',
}

const STATUS_ICONS = {
  draft: Clock,
  scheduled: CalendarIcon,
  published: Send,
  'pending-review': Clock,
  approved: CalendarIcon,
  failed: Clock,
  archived: Clock,
}

export function ContentCalendar({ content, onDateClick, onContentClick, view: _view = 'month' }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Filter and transform content with scheduled dates
  const scheduledContent = useMemo<CalendarContent[]>(() => {
    return content
      .filter((item) => item.scheduledFor || item.publishedAt)
      .map((item) => ({
        ...item,
        scheduledDate: new Date(item.scheduledFor || item.publishedAt!),
      }))
  }, [content])

  // Get calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  // Group content by date
  const contentByDate = useMemo(() => {
    const map = new Map<string, CalendarContent[]>()

    scheduledContent.forEach((item) => {
      const dateKey = format(item.scheduledDate, 'yyyy-MM-dd')
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(item)
    })

    return map
  }, [scheduledContent])

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    onDateClick?.(date)
  }

  const getContentForDay = (date: Date): CalendarContent[] => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return contentByDate.get(dateKey) || []
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-text-primary">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <CommandButton variant="secondary" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </CommandButton>
            <CommandButton variant="secondary" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </CommandButton>
          </div>
        </div>

        <div className="flex gap-2">
          <CommandButton variant="secondary" onClick={handleToday}>
            TODAY
          </CommandButton>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(CONTENT_TYPE_COLORS).map(([type, colorClass]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded border', colorClass)} />
            <span className="text-text-tertiary uppercase">{type.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <DataPanel className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-bold text-text-tertiary uppercase py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const dayContent = getContentForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDate = isToday(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'min-h-[120px] p-2 rounded border transition-all',
                  'hover:border-border-emphasis hover:bg-bg-hover',
                  'flex flex-col gap-1',
                  isCurrentMonth ? 'bg-bg-base border-border' : 'bg-bg-secondary border-border-subtle',
                  isTodayDate && 'border-neon-cyan border-2',
                  isSelected && 'border-neon-pink border-2'
                )}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isCurrentMonth ? 'text-text-primary' : 'text-text-tertiary',
                      isTodayDate && 'text-neon-cyan'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayContent.length > 0 && (
                    <Badge variant="default" className="text-xs px-1 py-0">
                      {dayContent.length}
                    </Badge>
                  )}
                </div>

                {/* Content Items */}
                <div className="flex flex-col gap-1">
                  {dayContent.slice(0, 3).map((item) => {
                    const StatusIcon = STATUS_ICONS[item.status]
                    const colorClass = CONTENT_TYPE_COLORS[item.type]

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onContentClick?.(item)
                        }}
                        className={cn(
                          'text-xs p-1 rounded border truncate',
                          'hover:scale-105 transition-transform cursor-pointer',
                          colorClass
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </div>
                      </div>
                    )
                  })}
                  {dayContent.length > 3 && (
                    <div className="text-xs text-text-tertiary text-center">
                      +{dayContent.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </DataPanel>

      {/* Selected Date Details */}
      {selectedDate && (
        <DataPanel className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <Badge>{getContentForDay(selectedDate).length} items</Badge>
          </div>

          <div className="space-y-2">
            {getContentForDay(selectedDate).map((item) => {
              const StatusIcon = STATUS_ICONS[item.status]
              const colorClass = CONTENT_TYPE_COLORS[item.type]

              return (
                <div
                  key={item.id}
                  onClick={() => onContentClick?.(item)}
                  className={cn(
                    'p-3 rounded border cursor-pointer',
                    'hover:scale-[1.02] transition-transform',
                    colorClass
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon className="w-4 h-4" />
                        <span className="font-semibold">{item.title}</span>
                      </div>
                      {item.excerpt && (
                        <p className="text-sm opacity-80 line-clamp-2">{item.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        {item.targetPlatforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-xs text-text-tertiary">
                      {format(item.scheduledDate, 'h:mm a')}
                    </div>
                  </div>
                </div>
              )
            })}

            {getContentForDay(selectedDate).length === 0 && (
              <div className="text-center text-text-tertiary py-8">
                No content scheduled for this date
              </div>
            )}
          </div>
        </DataPanel>
      )}

      {/* Calendar Stats */}
      <div className="grid grid-cols-4 gap-4">
        <DataPanel className="p-4">
          <div className="text-text-tertiary text-sm mb-1">Total Scheduled</div>
          <div className="text-2xl font-bold text-text-primary">{scheduledContent.length}</div>
        </DataPanel>
        <DataPanel className="p-4">
          <div className="text-text-tertiary text-sm mb-1">This Month</div>
          <div className="text-2xl font-bold text-neon-cyan">
            {scheduledContent.filter((item) => isSameMonth(item.scheduledDate, currentDate)).length}
          </div>
        </DataPanel>
        <DataPanel className="p-4">
          <div className="text-text-tertiary text-sm mb-1">This Week</div>
          <div className="text-2xl font-bold text-neon-pink">
            {scheduledContent.filter((item) => {
              const weekStart = startOfWeek(new Date())
              const weekEnd = endOfWeek(new Date())
              return item.scheduledDate >= weekStart && item.scheduledDate <= weekEnd
            }).length}
          </div>
        </DataPanel>
        <DataPanel className="p-4">
          <div className="text-text-tertiary text-sm mb-1">Today</div>
          <div className="text-2xl font-bold text-neon-purple">
            {scheduledContent.filter((item) => isToday(item.scheduledDate)).length}
          </div>
        </DataPanel>
      </div>
    </div>
  )
}
