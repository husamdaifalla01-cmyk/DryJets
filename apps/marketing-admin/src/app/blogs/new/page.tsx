/**
 * NEW BLOG POST PAGE
 *
 * Manual blog post creation page using BlogPostFormValidated.
 * For AI-generated content, use /blogs/generate instead.
 */

'use client'

import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { BlogPostFormValidated } from '@/components/content/BlogPostFormValidated'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function NewBlogPage() {
  const router = useRouter()

  // TODO: Get actual profileId from auth context
  const profileId = 'default-profile-id'

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation */}
      <Link href="/blogs" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Blogs
      </Link>

      {/* Header */}
      <DashboardHeader
        title="Create New Blog Post"
        description="Write and publish SEO-optimized blog content"
        action={
          <Link href="/blogs/generate">
            <Button variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          </Link>
        }
      />

      {/* Blog Post Form */}
      <BlogPostFormValidated
        mode="create"
        profileId={profileId}
        onSuccess={(blog) => {
          router.push(`/blogs/${blog.id}`)
        }}
        onCancel={() => {
          router.push('/blogs')
        }}
      />
    </div>
  )
}
