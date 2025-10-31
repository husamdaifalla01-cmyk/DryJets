/**
 * FILE UPLOAD COMPONENT
 *
 * Universal file upload component with drag-and-drop, preview, and progress tracking.
 * Supports images, videos, and documents.
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileIcon, Image as ImageIcon, Video, File, Check, AlertCircle } from 'lucide-react'
import { DataPanel } from '@/components/command/CommandPanel'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface UploadedFile {
  id: string
  file: File
  url: string
  status: 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  maxFiles?: number
  onUpload?: (files: File[]) => Promise<string[]> // Returns URLs
  onChange?: (files: UploadedFile[]) => void
  multiple?: boolean
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPT = 'image/*,video/*,.pdf,.doc,.docx'
const DEFAULT_MAX_SIZE = 50 // 50MB
const DEFAULT_MAX_FILES = 10

const MIME_TYPE_ICONS = {
  'image/': ImageIcon,
  'video/': Video,
  'application/pdf': FileIcon,
  'application/msword': FileIcon,
  'application/vnd.openxmlformats-officedocument': FileIcon,
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileIcon = (mimeType: string) => {
  for (const [prefix, Icon] of Object.entries(MIME_TYPE_ICONS)) {
    if (mimeType.startsWith(prefix)) {
      return Icon
    }
  }
  return File
}

export function FileUpload({
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
  onUpload,
  onChange,
  multiple = true,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB`
    }

    // Check file type
    const acceptedTypes = accept.split(',').map((t) => t.trim())
    const isAccepted = acceptedTypes.some((type) => {
      if (type === '*') return true
      if (type.endsWith('/*')) {
        const prefix = type.slice(0, -2)
        return file.type.startsWith(prefix)
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type)
      }
      return file.type === type
    })

    if (!isAccepted) {
      return 'File type not accepted'
    }

    return null
  }

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)

      // Check max files
      if (files.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate and create UploadedFile objects
      const validatedFiles: UploadedFile[] = fileArray
        .map((file) => {
          const error = validateFile(file)
          return {
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            url: URL.createObjectURL(file),
            status: error ? ('error' as const) : ('uploading' as const),
            progress: 0,
            error: error || undefined,
          }
        })
        .filter((f) => !f.error) // Only keep valid files

      if (validatedFiles.length === 0) return

      const updatedFiles = multiple ? [...files, ...validatedFiles] : validatedFiles
      setFiles(updatedFiles)
      onChange?.(updatedFiles)

      // Upload files if handler provided
      if (onUpload) {
        try {
          // Simulate progress for demo
          validatedFiles.forEach((file) => {
            let progress = 0
            const interval = setInterval(() => {
              progress += 10
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === file.id ? { ...f, progress: Math.min(progress, 90) } : f
                )
              )
              if (progress >= 90) clearInterval(interval)
            }, 200)
          })

          // Actual upload
          const uploadedUrls = await onUpload(validatedFiles.map((f) => f.file))

          // Update with final URLs
          setFiles((prev) =>
            prev.map((f) => {
              const index = validatedFiles.findIndex((vf) => vf.id === f.id)
              if (index !== -1) {
                return {
                  ...f,
                  url: uploadedUrls[index],
                  status: 'success' as const,
                  progress: 100,
                }
              }
              return f
            })
          )
        } catch (error) {
          // Mark as error
          setFiles((prev) =>
            prev.map((f) =>
              validatedFiles.some((vf) => vf.id === f.id)
                ? { ...f, status: 'error' as const, error: 'Upload failed' }
                : f
            )
          )
        }
      } else {
        // No upload handler, just mark as success
        setFiles((prev) =>
          prev.map((f) =>
            validatedFiles.some((vf) => vf.id === f.id)
              ? { ...f, status: 'success' as const, progress: 100 }
              : f
          )
        )
      }
    },
    [files, maxFiles, multiple, onChange, onUpload, validateFile]
  )

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id)
      onChange?.(updated)
      return updated
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer',
          'flex flex-col items-center justify-center gap-4',
          'hover:border-border-emphasis hover:bg-bg-hover',
          isDragging && 'border-neon-cyan bg-neon-cyan/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !isDragging && 'border-border'
        )}
      >
        <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center">
          <Upload className="w-8 h-8 text-text-tertiary" />
        </div>

        <div className="text-center">
          <p className="text-text-primary font-semibold mb-1">
            {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-text-tertiary text-sm">
            {accept === DEFAULT_ACCEPT
              ? 'Images, videos, or documents'
              : accept.split(',').join(', ')}
          </p>
          <p className="text-text-tertiary text-xs mt-1">
            Max {maxSize}MB per file • Up to {maxFiles} files
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.file.type)
            const isImage = file.file.type.startsWith('image/')
            const isVideo = file.file.type.startsWith('video/')

            return (
              <DataPanel key={file.id} className="p-3">
                <div className="flex items-start gap-3">
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {isImage ? (
                      <div className="w-12 h-12 rounded overflow-hidden bg-bg-secondary">
                        <img
                          src={file.url}
                          alt={file.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : isVideo ? (
                      <div className="w-12 h-12 rounded overflow-hidden bg-bg-secondary flex items-center justify-center">
                        <Video className="w-6 h-6 text-text-tertiary" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-bg-secondary flex items-center justify-center">
                        <FileIcon className="w-6 h-6 text-text-tertiary" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary font-medium truncate">
                          {file.file.name}
                        </p>
                        <p className="text-text-tertiary text-xs">
                          {formatFileSize(file.file.size)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {file.status === 'uploading' && (
                        <Badge variant="default" className="flex-shrink-0">
                          {file.progress}%
                        </Badge>
                      )}
                      {file.status === 'success' && (
                        <Badge variant="default" className="bg-status-success flex-shrink-0">
                          <Check className="w-3 h-3 mr-1" />
                          UPLOADED
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="default" className="bg-status-error flex-shrink-0">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          ERROR
                        </Badge>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="flex-shrink-0 p-1 hover:bg-bg-hover rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-text-tertiary" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="mt-2 h-1 bg-bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neon-cyan transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {file.error && (
                      <p className="text-status-error text-xs mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
              </DataPanel>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm text-text-tertiary">
          <span>
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </span>
          <span>
            {files.filter((f) => f.status === 'success').length} uploaded •{' '}
            {files.filter((f) => f.status === 'uploading').length} uploading •{' '}
            {files.filter((f) => f.status === 'error').length} failed
          </span>
        </div>
      )}
    </div>
  )
}
