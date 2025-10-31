/**
 * CONTENT CALENDAR PAGE
 *
 * Visual calendar view of all scheduled content.
 * Shows content across all platforms with scheduling details.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { ContentCalendar } from '@/components/calendar/ContentCalendar'
import { CommandButton } from '@/components/command/CommandButton'
import { useContent } from '@/lib/hooks/useContent'
import { Plus, Download, Filter } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import type { Content } from '@/lib/api/content'

export default function ContentCalendarPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('')

  // TODO: Get actual profileId from auth context
  const profileId = 'default-profile-id'

  const { data: contentData, isLoading } = useContent({
    profileId,
    status: (statusFilter as any) || undefined,
  })

  const content = contentData?.data || []

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date)
    // Could open a dialog to create content for this date
  }

  const handleContentClick = (content: Content) => {
    // Navigate to content detail/edit based on type
    if (content.type === 'blog') {
      router.push(`/blogs/${content.id}`)
    } else {
      router.push(`/content/${content.id}`)
    }
  }

  const handleCreateContent = () => {
    router.push('/blogs/new')
  }

  const handleExportCalendar = () => {
    const { exportContentCalendar } = require('@/lib/utils/ical-export')
    exportContentCalendar(content, {
      calendarName: 'DryJets Content Calendar',
      filterByStatus: statusFilter ? [statusFilter as any] : undefined,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <DashboardHeader
        title="Content Calendar"
        description="Visual overview of scheduled content across all platforms"
        action={
          <div className="flex gap-2">
            <CommandButton variant="secondary" onClick={handleExportCalendar}>
              <Download className="w-4 h-4 mr-2" />
              EXPORT
            </CommandButton>
            <CommandButton onClick={handleCreateContent}>
              <Plus className="w-4 h-4 mr-2" />
              NEW CONTENT
            </CommandButton>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-tertiary" />
          <span className="text-sm text-text-tertiary uppercase">Filter by Status:</span>
        </div>
        <div className="flex gap-2">
          {['all', 'scheduled', 'published', 'draft'].map((status) => (
            <CommandButton
              key={status}
              variant={statusFilter === (status === 'all' ? '' : status) ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(status === 'all' ? '' : status)}
            >
              {status.toUpperCase()}
            </CommandButton>
          ))}
        </div>
      </div>

      {/* Calendar */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <ContentCalendar
          content={content}
          onDateClick={handleDateClick}
          onContentClick={handleContentClick}
        />
      )}
    </div>
  )
}
