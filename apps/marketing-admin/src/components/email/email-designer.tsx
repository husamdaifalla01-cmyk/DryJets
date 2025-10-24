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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Mail,
  FileText,
  Settings,
  Eye,
  Send,
  Calendar,
  Users,
  AlertCircle,
} from 'lucide-react'

const EMAIL_TEMPLATES = [
  { id: 'welcome', name: 'Welcome Series', icon: '👋' },
  { id: 'newsletter', name: 'Newsletter', icon: '📰' },
  { id: 'promotion', name: 'Promotional', icon: '🎉' },
  { id: 'transactional', name: 'Transactional', icon: '✓' },
]

const EMAIL_SEGMENTS = [
  { id: 'all', name: 'All Subscribers', count: 10000 },
  { id: 'active', name: 'Active Users', count: 7500 },
  { id: 'high_value', name: 'High Value Customers', count: 2000 },
  { id: 'new', name: 'New Subscribers', count: 500 },
]

export function EmailDesigner({ campaignId }: { campaignId: string }) {
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [abTestEnabled, setAbTestEnabled] = useState(false)
  const [variantB, setVariantB] = useState('')

  const handleSendDraft = async () => {
    try {
      setLoading(true)
      // Call API to save as draft
      alert('Email campaign saved as draft')
    } catch (error) {
      console.error('Failed to save draft:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleSend = async () => {
    try {
      setLoading(true)
      // Call API to schedule send
      alert('Email campaign scheduled')
    } catch (error) {
      console.error('Failed to schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    // Load template content
    const templates: Record<string, string> = {
      welcome: '<h1>Welcome!</h1><p>We\'re excited to have you.</p>',
      newsletter: '<h1>Monthly Update</h1><p>Here\'s what\'s new...</p>',
      promotion: '<h1>Special Offer!</h1><p>Limited time only.</p>',
      transactional: '<h1>Confirmation</h1><p>Thank you for your order.</p>',
    }
    setHtmlContent(templates[templateId] || '')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="designer" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="designer">
            <FileText className="h-4 w-4 mr-2" />
            Designer
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="designer" className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {EMAIL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`p-3 rounded-lg border-2 text-center transition ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{template.icon}</div>
                    <p className="text-sm font-medium">{template.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Subject & Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject line..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {subject.length}/50 characters
                </p>
              </div>
              <div>
                <Label htmlFor="preview">Preview Text</Label>
                <Input
                  id="preview"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Preview text (shown in inbox)"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
              <CardDescription>
                Edit HTML content or use the drag-and-drop builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<h1>Hello</h1><p>Your content here...</p>"
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-white p-4">
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-sm font-medium text-gray-600">
                    Subject: {subject || '(No subject)'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Preview: {previewText || '(No preview text)'}
                  </p>
                </div>

                <div
                  className="border rounded bg-white p-4"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Preview Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✓ Test links and buttons work correctly</p>
              <p>✓ Images load properly in preview</p>
              <p>✓ Mobile rendering looks good</p>
              <p>✓ No broken HTML tags</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Segment Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Segment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select segment..." />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_SEGMENTS.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name} ({segment.count.toLocaleString()} subscribers)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* A/B Testing */}
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={abTestEnabled}
                  onChange={(e) => setAbTestEnabled(e.target.checked)}
                  id="ab-test"
                  className="rounded"
                />
                <Label htmlFor="ab-test" className="font-normal cursor-pointer">
                  Enable A/B Testing
                </Label>
              </div>

              {abTestEnabled && (
                <div className="space-y-3 border-t pt-3">
                  <div>
                    <Label htmlFor="variant-a">Variant A (Current)</Label>
                    <Input
                      id="variant-a"
                      value={subject}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="variant-b">Variant B (Alternative)</Label>
                    <Input
                      id="variant-b"
                      value={variantB}
                      onChange={(e) => setVariantB(e.target.value)}
                      placeholder="Alternative subject line..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Winner Criteria</Label>
                    <Select defaultValue="open-rate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open-rate">Open Rate</SelectItem>
                        <SelectItem value="click-rate">Click Rate</SelectItem>
                        <SelectItem value="conversion">Conversion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Send Options */}
          <Card>
            <CardHeader>
              <CardTitle>Send Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSendDraft} variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>

              <Button onClick={handleScheduleSend} className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule & Send
              </Button>

              {!subject || !htmlContent ? (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Fill in subject and content before sending
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
