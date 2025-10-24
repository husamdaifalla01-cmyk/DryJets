'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import {
  Plus,
  Search,
  Zap,
  Eye,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED'
  createdBy: string
  publishedAt?: string
  viewCount: number
  keywords: string[]
  createdAt: string
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ARCHIVED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export default function BlogsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: blogs, isLoading, error } = useQuery({
    queryKey: ['blogs', statusFilter],
    queryFn: () => apiClient.listBlogs(statusFilter),
  })

  const filteredBlogs = blogs?.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <DashboardHeader
        title="Blog Posts"
        description="Manage your SEO-optimized blog content"
        action={
          <Link href="/blogs/generate">
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Blog List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error loading blogs</p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-2">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      ) : filteredBlogs && filteredBlogs.length > 0 ? (
        <div className="grid gap-4">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {blog.title}
                    </h3>
                    <Badge className={statusColors[blog.status]}>
                      {blog.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {blog.excerpt || 'No description provided'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {blog.keywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-block px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                    {blog.keywords.length > 3 && (
                      <span className="inline-block px-2 py-1 text-muted-foreground text-xs">
                        +{blog.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {blog.viewCount} views
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {blog.createdBy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(blog.createdAt)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/blogs/${blog.slug}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/blogs/${blog.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">No blog posts yet</p>
          <Link href="/blogs/generate">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Blog
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Footer */}
      {filteredBlogs && filteredBlogs.length > 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          Showing {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
