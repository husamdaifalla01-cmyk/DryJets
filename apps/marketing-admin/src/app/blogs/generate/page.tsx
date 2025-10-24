'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api-client'
import { AlertCircle, CheckCircle, Loader, ArrowRight } from 'lucide-react'

interface GenerateRequest {
  title?: string
  theme: string
  city?: string
  focus?: string
  keywords?: string[]
}

export default function GenerateBlogPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    theme: 'local_seo',
    city: 'Ottawa',
    focus: 'Help customers find quality dry cleaning services',
  })
  const [generatedBlog, setGeneratedBlog] = useState<any>(null)

  const generateMutation = useMutation({
    mutationFn: (data: GenerateRequest) => apiClient.generateBlog(data),
    onSuccess: (response) => {
      setGeneratedBlog(response.data?.result || response.data)
    },
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    generateMutation.mutate({
      theme: formData.theme,
      city: formData.city,
      focus: formData.focus,
    })
  }

  const handlePublishDraft = async () => {
    if (!generatedBlog?.id) {
      // Blog was just generated, user needs to create it first
      router.push('/blogs')
    } else {
      router.push(`/blogs/${generatedBlog.id}/edit`)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Generate Blog Post"
        description="Use Mira AI to create SEO-optimized blog content"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-8">
            <h2 className="text-lg font-bold text-foreground mb-6">Configure Blog</h2>

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Content Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="local_seo">Local SEO Guide</option>
                  <option value="service_tips">Service Tips & Tricks</option>
                  <option value="how_to">How-To Guide</option>
                  <option value="trends">Industry Trends</option>
                  <option value="seasonal">Seasonal Content</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Ottawa, Toronto"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Focus */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Blog Focus
                </label>
                <textarea
                  value={formData.focus}
                  onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                  placeholder="What should the blog focus on?"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Generate Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Generating with Mira...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Generate Blog Post
                  </>
                )}
              </Button>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Mira AI</strong> will generate a 2000+ word SEO-optimized article with keywords, meta tags, and internal linking suggestions.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {generateMutation.isPending ? (
            <div className="bg-card border border-border rounded-lg p-12 flex flex-col items-center justify-center h-96">
              <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">Generating your blog post...</p>
              <p className="text-sm text-muted-foreground text-center">
                Mira is creating a high-quality, SEO-optimized article. This typically takes 15-30 seconds.
              </p>
            </div>
          ) : generatedBlog ? (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">
                    Blog post generated successfully!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Review the content below and publish or edit as needed.
                  </p>
                </div>
              </div>

              {/* Blog Preview */}
              <div className="bg-card border border-border rounded-lg p-8">
                <div className="prose dark:prose-invert max-w-none mb-8">
                  <h1 className="text-3xl font-bold text-foreground">
                    {generatedBlog.title}
                  </h1>
                  <p className="text-muted-foreground italic mt-4">
                    {generatedBlog.excerpt || generatedBlog.metaDescription}
                  </p>

                  {/* Meta Info */}
                  <div className="my-6 p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-foreground">Meta Title</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {generatedBlog.metaTitle}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Meta Description</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {generatedBlog.metaDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="my-6">
                    <p className="font-semibold text-foreground mb-3">SEO Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedBlog.keywords?.map((keyword: string) => (
                        <span
                          key={keyword}
                          className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="my-8 p-6 bg-muted rounded-lg max-h-96 overflow-y-auto">
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {generatedBlog.content?.substring(0, 500)}...
                    </div>
                  </div>
                </div>

                {/* Internal Links */}
                {generatedBlog.internalLinks && generatedBlog.internalLinks.length > 0 && (
                  <div className="my-6 pt-6 border-t border-border">
                    <p className="font-semibold text-foreground mb-3">Suggested Internal Links</p>
                    <ul className="space-y-2">
                      {generatedBlog.internalLinks.map((link: any, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • <span className="text-foreground font-medium">{link.text}</span> - {link.context}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handlePublishDraft} className="flex-1">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Review & Publish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedBlog(null)
                    setFormData({
                      theme: 'local_seo',
                      city: 'Ottawa',
                      focus: 'Help customers find quality dry cleaning services',
                    })
                  }}
                >
                  Generate Another
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center h-96 flex flex-col items-center justify-center">
              <div className="text-5xl mb-4">✨</div>
              <p className="text-lg font-semibold text-foreground mb-2">
                Ready to generate your first blog?
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Configure your preferences and click "Generate Blog Post" to let Mira create a high-quality, SEO-optimized article for you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
