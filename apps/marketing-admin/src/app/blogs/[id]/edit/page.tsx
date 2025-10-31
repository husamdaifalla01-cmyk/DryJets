'use client'

import { useRouter, useParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { BlogPostFormValidated } from '@/components/content/BlogPostFormValidated'
import { useBlogPost } from '@/lib/hooks/useContent'
import { Loader2 } from 'lucide-react'

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const blogId = params.id as string

  const { data: blog, isLoading } = useBlogPost(blogId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardHeader
          title="Blog Not Found"
          description="The requested blog post could not be found"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Unable to load blog post</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Edit Blog Post"
        description="Review and refine your blog content before publishing"
      />

      <BlogPostFormValidated
        mode="update"
        blogPost={blog}
        profileId={blog.profileId}
        onSuccess={() => {
          router.push('/blogs')
        }}
        onCancel={() => {
          router.push('/blogs')
        }}
      />
    </div>
  )
}
