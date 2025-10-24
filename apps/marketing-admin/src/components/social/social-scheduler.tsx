'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  AlertCircle,
  Calendar,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  CheckCircle,
  Trash2,
  Play,
  Edit2,
} from 'lucide-react'

interface SocialPost {
  id: string
  platform: string
  content: string
  scheduledTime: Date
  status: 'QUEUED' | 'PUBLISHED' | 'FAILED'
}

export function SocialScheduler() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [platform, setPlatform] = useState<string>('facebook')
  const [content, setContent] = useState<string>('')
  const [scheduledTime, setScheduledTime] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const platformIcons: Record<string, React.ReactNode> = {
    facebook: <Facebook className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
  }

  const platformColors: Record<string, string> = {
    facebook: 'bg-blue-100 text-blue-800',
    instagram: 'bg-pink-100 text-pink-800',
    linkedin: 'bg-blue-600 text-white',
    twitter: 'bg-sky-100 text-sky-800',
  }

  const handleSchedule = async () => {
    if (!content || !scheduledTime) {
      alert('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      const newPost: SocialPost = {
        id: `post_${Date.now()}`,
        platform,
        content,
        scheduledTime: new Date(scheduledTime),
        status: 'QUEUED',
      }

      setPosts([...posts, newPost])
      setContent('')
      setScheduledTime('')
    } catch (error) {
      console.error('Failed to schedule post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishNow = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id
          ? { ...p, status: 'PUBLISHED' as const }
          : p,
      ),
    )
  }

  const handleDelete = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-yellow-100 text-yellow-800'
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Social Post</CardTitle>
          <CardDescription>
            Schedule posts across multiple social platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your post content..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {content.length} characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Scheduled Time</Label>
            <Input
              id="scheduledTime"
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <Button onClick={handleSchedule} disabled={loading} className="w-full">
            {loading ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
          <CardDescription>
            {posts.length} posts scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No scheduled posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${platformColors[post.platform] || 'bg-gray-100'}`}>
                        {platformIcons[post.platform]}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {post.platform}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.scheduledTime)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground">
                    {post.content}
                  </p>

                  <div className="flex gap-2 pt-2">
                    {post.status === 'QUEUED' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePublishNow(post.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Publish Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {}}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Platform Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                platform: 'Facebook',
                bestTime: '1:00 PM - 7:00 PM',
                bestDay: 'Tuesday - Wednesday',
                reach: '50K',
              },
              {
                platform: 'Instagram',
                bestTime: '11:00 AM - 8:00 PM',
                bestDay: 'Monday - Friday',
                reach: '35K',
              },
              {
                platform: 'LinkedIn',
                bestTime: '8:00 AM - 5:00 PM',
                bestDay: 'Tuesday - Thursday',
                reach: '20K',
              },
              {
                platform: 'Twitter',
                bestTime: '10:00 AM - 2:00 PM',
                bestDay: 'Weekdays',
                reach: '15K',
              },
            ].map((rec) => (
              <div key={rec.platform} className="border rounded-lg p-3">
                <p className="font-medium">{rec.platform}</p>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  <p>📅 Best: {rec.bestDay}</p>
                  <p>🕐 Time: {rec.bestTime}</p>
                  <p>👥 Est. Reach: {rec.reach}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
