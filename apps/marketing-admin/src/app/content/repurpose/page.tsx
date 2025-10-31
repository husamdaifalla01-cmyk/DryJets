/**
 * CONTENT REPURPOSING PAGE
 *
 * AI-powered content repurposing tool.
 * Converts blog posts into social media content, threads, carousels, etc.
 */

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { DataPanel } from '@/components/command/CommandPanel'
import { CommandButton } from '@/components/command/CommandButton'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Copy, Check, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RepurposeOption {
  id: string
  type: 'tweet' | 'thread' | 'linkedin' | 'instagram' | 'carousel' | 'video-script'
  icon: React.ElementType
  title: string
  description: string
  platforms: string[]
  estimatedTime: string
}

const REPURPOSE_OPTIONS: RepurposeOption[] = [
  {
    id: 'tweet',
    type: 'tweet',
    icon: Twitter,
    title: 'Tweet',
    description: 'Single tweet with key takeaway',
    platforms: ['Twitter/X'],
    estimatedTime: '30s',
  },
  {
    id: 'thread',
    type: 'thread',
    icon: Twitter,
    title: 'Tweet Thread',
    description: '5-10 tweet thread breaking down the blog',
    platforms: ['Twitter/X'],
    estimatedTime: '1 min',
  },
  {
    id: 'linkedin',
    type: 'linkedin',
    icon: Linkedin,
    title: 'LinkedIn Post',
    description: 'Professional post with formatting',
    platforms: ['LinkedIn'],
    estimatedTime: '45s',
  },
  {
    id: 'instagram',
    type: 'instagram',
    icon: Instagram,
    title: 'Instagram Caption',
    description: 'Engaging caption with hashtags',
    platforms: ['Instagram'],
    estimatedTime: '45s',
  },
  {
    id: 'carousel',
    type: 'carousel',
    icon: Instagram,
    title: 'Carousel Slides',
    description: '5-10 slides for Instagram/LinkedIn',
    platforms: ['Instagram', 'LinkedIn'],
    estimatedTime: '2 min',
  },
  {
    id: 'video-script',
    type: 'video-script',
    icon: Youtube,
    title: 'Video Script',
    description: 'Script for short-form video (TikTok, Reels)',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedTime: '2 min',
  },
]

export default function ContentRepurposePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const blogId = searchParams.get('blogId')

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Mock blog data - replace with actual API call
  const blogTitle = 'How to Build a Marketing Automation System'
  const blogExcerpt = 'Learn the essential steps to create an automated marketing workflow that saves time and increases conversions.'

  const handleGenerate = async (optionId: string) => {
    setSelectedOption(optionId)
    setIsGenerating(true)
    setGeneratedContent(null)

    try {
      const option = REPURPOSE_OPTIONS.find((o) => o.id === optionId)
      if (!option) return

      // Use real AI service
      const { generateContent } = await import('@/lib/services/ai-content-generation.service')
      const result = await generateContent({
        sourceText: blogExcerpt,
        sourceTitle: blogTitle,
        format: option.type,
        tone: 'professional',
      })

      setGeneratedContent(result.content)
    } catch (error) {
      console.error('Generation failed:', error)
      // Fallback to mock
      const option = REPURPOSE_OPTIONS.find((o) => o.id === optionId)
      const mockContent = generateMockContent(option?.type || 'tweet')
      setGeneratedContent(mockContent)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveAndSchedule = () => {
    // TODO: Save to content library and open scheduling dialog
    router.push('/content/calendar')
  }

  const generateMockContent = (type: string): string => {
    const mockContent = {
      tweet: '🚀 Building a marketing automation system doesn\'t have to be complex.\n\nKey steps:\n→ Define your workflow\n→ Choose the right tools\n→ Test and iterate\n\nFull guide: [link]',
      thread: '1/ Marketing automation can 10x your productivity. Here\'s how to build a system that actually works:\n\n2/ Start by mapping your customer journey. Where are the repetitive tasks?\n\n3/ Choose tools that integrate well. No point in automation if you\'re copying data between platforms.\n\n4/ Test with a small segment first. Iron out the bugs before scaling.\n\n5/ Monitor and optimize. Automation isn\'t "set it and forget it".\n\n6/ Full guide with templates in my latest blog 👇',
      linkedin: '💡 The Secret to Marketing Automation Success\n\nAfter helping 50+ companies build their marketing automation systems, I\'ve learned what separates success from failure.\n\nIt\'s not about having the fanciest tools.\nIt\'s not about automating everything.\n\nIt\'s about understanding YOUR specific workflow and automating the RIGHT tasks.\n\nIn my latest blog, I break down:\n→ How to identify automation opportunities\n→ The 5-step implementation framework\n→ Common pitfalls to avoid\n→ ROI metrics that matter\n\nLink in comments 👇\n\n#MarketingAutomation #GrowthHacking #MarketingStrategy',
      instagram: '✨ Want to know the secret to marketing automation that actually works?\n\nIt\'s simpler than you think.\n\nSwipe through this post to see the 5-step framework that helped us save 20+ hours per week 👉\n\n💾 Save this for later!\n📩 DM me "AUTOMATION" for the full guide\n\n#MarketingAutomation #DigitalMarketing #MarketingTips #ContentStrategy #MarketingHacks #SocialMediaMarketing #GrowthHacking',
      carousel: `Slide 1: 🚀 5 Steps to Marketing Automation
(Title slide with bold typography)

Slide 2: Step 1 - Map Your Journey
Visualize every customer touchpoint

Slide 3: Step 2 - Identify Repetitive Tasks
Look for manual, repeatable processes

Slide 4: Step 3 - Choose Your Stack
Tools that play well together

Slide 5: Step 4 - Start Small
Test with one workflow first

Slide 6: Step 5 - Monitor & Optimize
Track KPIs and iterate

Slide 7: Ready to automate?
Link in bio for full guide 🔗`,
      'video-script': `[HOOK - First 3 seconds]
"Stop wasting 20 hours a week on repetitive marketing tasks."

[PROBLEM - 3-8 seconds]
"Most marketers are stuck doing the same manual work over and over."

[SOLUTION - 8-15 seconds]
"But what if you could automate 80% of it? Here's how:"

[STEP 1 - 15-20 seconds]
"First, map out your customer journey and find the repetitive tasks."

[STEP 2 - 20-25 seconds]
"Next, choose tools that integrate seamlessly."

[STEP 3 - 25-30 seconds]
"Start with ONE workflow. Test it. Perfect it."

[CTA - 30-35 seconds]
"Want my complete automation framework? Link in bio!"

[Visual notes: Fast cuts, dynamic text overlays, energetic background music]`,
    }

    return mockContent[type as keyof typeof mockContent] || mockContent.tweet
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <DashboardHeader
        title="Repurpose Content"
        description="Transform your blog post into engaging social media content with AI"
      />

      {/* Source Content */}
      <DataPanel className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">SOURCE BLOG POST</Badge>
            <h2 className="text-xl font-bold text-text-primary mb-2">{blogTitle}</h2>
            <p className="text-text-secondary">{blogExcerpt}</p>
          </div>
          {blogId && (
            <CommandButton variant="secondary" onClick={() => router.push(`/blogs/${blogId}`)}>
              VIEW ORIGINAL
            </CommandButton>
          )}
        </div>
      </DataPanel>

      {/* Repurpose Options Grid */}
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-4">Choose Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPURPOSE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = selectedOption === option.id

            return (
              <button
                key={option.id}
                onClick={() => handleGenerate(option.id)}
                disabled={isGenerating}
                className={cn(
                  'text-left p-6 rounded-lg border-2 transition-all',
                  'hover:border-border-emphasis hover:bg-bg-hover',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isSelected
                    ? 'border-neon-cyan bg-neon-cyan/5'
                    : 'border-border bg-bg-base'
                )}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-text-primary mb-1">{option.title}</h4>
                    <p className="text-sm text-text-secondary">{option.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-1">
                    {option.platforms.map((platform) => (
                      <Badge key={platform} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-text-tertiary">~{option.estimatedTime}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Generated Content */}
      {(isGenerating || generatedContent) && (
        <DataPanel className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-cyan" />
              <h3 className="text-lg font-bold text-text-primary">Generated Content</h3>
            </div>
            {generatedContent && (
              <div className="flex gap-2">
                <CommandButton variant="secondary" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      COPY
                    </>
                  )}
                </CommandButton>
                <CommandButton onClick={handleSaveAndSchedule}>
                  SAVE & SCHEDULE
                </CommandButton>
              </div>
            )}
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-neon-cyan mx-auto mb-4" />
                <p className="text-text-secondary">Generating content with AI...</p>
                <p className="text-text-tertiary text-sm mt-1">This may take a few seconds</p>
              </div>
            </div>
          ) : (
            <div className="bg-bg-base rounded-lg p-6 border border-border">
              <pre className="whitespace-pre-wrap text-text-primary font-mono text-sm">
                {generatedContent}
              </pre>
            </div>
          )}
        </DataPanel>
      )}

      {/* Tips */}
      {!isGenerating && !generatedContent && (
        <DataPanel className="p-4">
          <p className="text-sm text-text-secondary">
            💡 <strong>Tip:</strong> Select a format above to automatically generate optimized content
            for that platform. You can edit and customize the output before publishing.
          </p>
        </DataPanel>
      )}
    </div>
  )
}
