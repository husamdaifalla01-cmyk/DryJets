/**
 * ICAL EXPORT UTILITY
 *
 * Generates iCalendar (.ics) files for content calendar export.
 * Allows users to import scheduled content into Google Calendar, Outlook, etc.
 */

import type { Content } from '@/lib/api/content'
import { format } from 'date-fns'

interface ICalEvent {
  uid: string
  summary: string
  description?: string
  start: Date
  end: Date
  location?: string
  url?: string
  status: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED'
  categories?: string[]
}

/**
 * Format date for iCalendar format (YYYYMMDDTHHMMSSZ)
 */
const formatICalDate = (date: Date): string => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'")
}

/**
 * Escape special characters for iCalendar text fields
 */
const escapeICalText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Get event status from content status
 */
const getEventStatus = (contentStatus: Content['status']): ICalEvent['status'] => {
  switch (contentStatus) {
    case 'scheduled':
      return 'CONFIRMED'
    case 'draft':
    case 'pending-review':
      return 'TENTATIVE'
    case 'failed':
    case 'archived':
      return 'CANCELLED'
    default:
      return 'CONFIRMED'
  }
}

/**
 * Convert Content to ICalEvent
 */
const contentToICalEvent = (content: Content): ICalEvent | null => {
  const scheduledDate = content.scheduledFor || content.publishedAt
  if (!scheduledDate) return null

  const start = new Date(scheduledDate)
  const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour duration

  return {
    uid: `content-${content.id}@dryjets.com`,
    summary: `[${content.type.toUpperCase()}] ${content.title}`,
    description: content.excerpt || content.body.substring(0, 500),
    start,
    end,
    location: content.targetPlatforms.join(', '),
    status: getEventStatus(content.status),
    categories: [content.type, ...content.targetPlatforms],
  }
}

/**
 * Generate iCalendar event component
 */
const generateICalEventComponent = (event: ICalEvent): string => {
  const lines: string[] = []

  lines.push('BEGIN:VEVENT')
  lines.push(`UID:${event.uid}`)
  lines.push(`DTSTAMP:${formatICalDate(new Date())}`)
  lines.push(`DTSTART:${formatICalDate(event.start)}`)
  lines.push(`DTEND:${formatICalDate(event.end)}`)
  lines.push(`SUMMARY:${escapeICalText(event.summary)}`)

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`)
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`)
  }

  if (event.url) {
    lines.push(`URL:${event.url}`)
  }

  lines.push(`STATUS:${event.status}`)

  if (event.categories && event.categories.length > 0) {
    lines.push(`CATEGORIES:${event.categories.map(escapeICalText).join(',')}`)
  }

  lines.push('END:VEVENT')

  return lines.join('\r\n')
}

/**
 * Generate complete iCalendar file
 */
export const generateICalFile = (
  content: Content[],
  calendarName: string = 'DryJets Content Calendar'
): string => {
  const events = content
    .map(contentToICalEvent)
    .filter((event): event is ICalEvent => event !== null)

  const lines: string[] = []

  // Calendar header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//DryJets//Marketing Calendar//EN')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push(`X-WR-CALNAME:${escapeICalText(calendarName)}`)
  lines.push('X-WR-TIMEZONE:UTC')
  lines.push('X-WR-CALDESC:Scheduled marketing content from DryJets')

  // Add events
  events.forEach((event) => {
    lines.push(generateICalEventComponent(event))
  })

  // Calendar footer
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Download iCalendar file
 */
export const downloadICalFile = (
  content: Content[],
  filename: string = 'dryjets-content-calendar.ics'
): void => {
  const icalContent = generateICalFile(content)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export content calendar to iCal format
 */
export const exportContentCalendar = (
  content: Content[],
  options?: {
    filename?: string
    calendarName?: string
    filterByStatus?: Content['status'][]
    filterByPlatform?: string[]
  }
): void => {
  let filteredContent = content

  // Filter by status
  if (options?.filterByStatus && options.filterByStatus.length > 0) {
    filteredContent = filteredContent.filter((c) =>
      options.filterByStatus!.includes(c.status)
    )
  }

  // Filter by platform
  if (options?.filterByPlatform && options.filterByPlatform.length > 0) {
    filteredContent = filteredContent.filter((c) =>
      c.targetPlatforms.some((p) => options.filterByPlatform!.includes(p))
    )
  }

  const filename =
    options?.filename || `dryjets-content-${format(new Date(), 'yyyy-MM-dd')}.ics`
  downloadICalFile(filteredContent, filename)
}
