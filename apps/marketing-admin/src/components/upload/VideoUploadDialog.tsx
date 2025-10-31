/**
 * VIDEO UPLOAD DIALOG
 *
 * Dialog for uploading videos for campaigns and content.
 * Supports video preview, thumbnail extraction, and metadata input.
 */

'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { FileUpload, UploadedFile } from './FileUpload'
import { CommandButton } from '@/components/command/CommandButton'
import { CommandInput } from '@/components/command/CommandInput'
import { CommandTextarea } from '@/components/command/CommandInput'
import { DataPanel } from '@/components/command/CommandPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Video, Link as LinkIcon, Play } from 'lucide-react'

interface VideoMetadata {
  url: string
  title?: string
  description?: string
  duration?: number
  thumbnail?: string
}

interface VideoUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (metadata: VideoMetadata) => void
  maxSize?: number
}

export function VideoUploadDialog({
  isOpen,
  onClose,
  onInsert,
  maxSize = 500, // 500MB for videos
}: VideoUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleUpload = async (files: File[]): Promise<string[]> => {
    // TODO: Implement actual upload to storage (S3, Cloudflare, etc.)
    // For now, return blob URLs
    return files.map((file) => URL.createObjectURL(file))
  }

  const extractVideoMetadata = (videoElement: HTMLVideoElement): VideoMetadata => {
    return {
      url: videoElement.src,
      duration: videoElement.duration,
      thumbnail: extractThumbnail(videoElement),
    }
  }

  const extractThumbnail = (videoElement: HTMLVideoElement): string => {
    // Create canvas to capture frame
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
      return canvas.toDataURL('image/jpeg', 0.8)
    }
    return ''
  }

  const handleInsertUploadedVideo = () => {
    const successfulFile = uploadedFiles.find((f) => f.status === 'success')
    if (successfulFile) {
      let metadata: VideoMetadata = {
        url: successfulFile.url,
        title: title || successfulFile.file.name,
        description,
      }

      // Extract metadata from video element if available
      if (videoRef.current) {
        const extractedMetadata = extractVideoMetadata(videoRef.current)
        metadata = { ...metadata, ...extractedMetadata }
      }

      onInsert(metadata)
      handleClose()
    }
  }

  const handleInsertUrlVideo = () => {
    if (videoUrl) {
      onInsert({
        url: videoUrl,
        title,
        description,
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setUploadedFiles([])
    setVideoUrl('')
    setTitle('')
    setDescription('')
    setActiveTab('upload')
    onClose()
  }

  const canInsert =
    activeTab === 'upload'
      ? uploadedFiles.some((f) => f.status === 'success')
      : videoUrl.trim() !== ''

  const successfulFile = uploadedFiles.find((f) => f.status === 'success')

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insert Video</DialogTitle>
          <DialogDescription>
            Upload a video or provide a URL (YouTube, Vimeo, etc.)
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'upload' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Video className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL / Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <FileUpload
              accept="video/*"
              maxSize={maxSize}
              maxFiles={1}
              multiple={false}
              onUpload={handleUpload}
              onChange={setUploadedFiles}
            />

            {successfulFile && (
              <DataPanel className="p-4 space-y-4">
                {/* Video Preview */}
                <div className="bg-bg-secondary rounded overflow-hidden">
                  <video
                    ref={videoRef}
                    src={successfulFile.url}
                    controls
                    className="w-full max-h-64"
                    onLoadedMetadata={() => {
                      // Auto-extract metadata when video loads
                      if (videoRef.current && !title) {
                        setTitle(successfulFile.file.name.replace(/\.[^/.]+$/, ''))
                      }
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Metadata Inputs */}
                <div>
                  <label className="block text-sm text-text-tertiary uppercase mb-2">
                    Video Title *
                  </label>
                  <CommandInput
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-tertiary uppercase mb-2">
                    Description (Optional)
                  </label>
                  <CommandTextarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what the video is about..."
                    rows={3}
                  />
                </div>

                {/* Video Info */}
                {videoRef.current && (
                  <div className="flex gap-4 text-sm text-text-tertiary">
                    <span>
                      Duration:{' '}
                      {videoRef.current.duration
                        ? Math.round(videoRef.current.duration)
                        : 0}
                      s
                    </span>
                    <span>
                      Size: {(successfulFile.file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </DataPanel>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <DataPanel className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Video URL *
                </label>
                <CommandInput
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  type="url"
                />
                <p className="text-xs text-text-tertiary mt-1">
                  Supports YouTube, Vimeo, direct video URLs
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Video Title (Optional)
                </label>
                <CommandInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                />
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Description (Optional)
                </label>
                <CommandTextarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what the video is about..."
                  rows={3}
                />
              </div>
            </DataPanel>

            {videoUrl && (
              <DataPanel className="p-4">
                <p className="text-sm text-text-tertiary mb-2">Preview:</p>
                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                  <div className="aspect-video bg-bg-secondary rounded overflow-hidden flex items-center justify-center">
                    <Play className="w-12 h-12 text-text-tertiary" />
                    <p className="text-text-tertiary ml-2">YouTube video</p>
                  </div>
                ) : videoUrl.includes('vimeo.com') ? (
                  <div className="aspect-video bg-bg-secondary rounded overflow-hidden flex items-center justify-center">
                    <Play className="w-12 h-12 text-text-tertiary" />
                    <p className="text-text-tertiary ml-2">Vimeo video</p>
                  </div>
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full max-h-64 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </DataPanel>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <CommandButton variant="secondary" onClick={handleClose}>
            CANCEL
          </CommandButton>
          <CommandButton
            onClick={activeTab === 'upload' ? handleInsertUploadedVideo : handleInsertUrlVideo}
            disabled={!canInsert}
          >
            INSERT VIDEO
          </CommandButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
