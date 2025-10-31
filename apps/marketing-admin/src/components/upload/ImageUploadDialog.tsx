/**
 * IMAGE UPLOAD DIALOG
 *
 * Dialog for uploading images to content/blog posts.
 * Integrates with FileUpload component and provides URL insertion.
 */

'use client'

import { useState } from 'react'
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
import { DataPanel } from '@/components/command/CommandPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Image, Link as LinkIcon } from 'lucide-react'

interface ImageUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (url: string, alt?: string) => void
  maxSize?: number
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  onInsert,
  maxSize = 10,
}: ImageUploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')

  const handleUpload = async (files: File[]): Promise<string[]> => {
    // TODO: Implement actual upload to storage
    // For now, return blob URLs
    return files.map((file) => URL.createObjectURL(file))
  }

  const handleInsertUploadedImage = () => {
    const successfulFile = uploadedFiles.find((f) => f.status === 'success')
    if (successfulFile) {
      onInsert(successfulFile.url, altText || successfulFile.file.name)
      handleClose()
    }
  }

  const handleInsertUrlImage = () => {
    if (imageUrl) {
      onInsert(imageUrl, altText)
      handleClose()
    }
  }

  const handleClose = () => {
    setUploadedFiles([])
    setImageUrl('')
    setAltText('')
    setActiveTab('upload')
    onClose()
  }

  const canInsert =
    activeTab === 'upload'
      ? uploadedFiles.some((f) => f.status === 'success')
      : imageUrl.trim() !== ''

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Upload an image or provide a URL to insert into your content
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'upload' | 'url')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Image className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <FileUpload
              accept="image/*"
              maxSize={maxSize}
              maxFiles={1}
              multiple={false}
              onUpload={handleUpload}
              onChange={setUploadedFiles}
            />

            {uploadedFiles.some((f) => f.status === 'success') && (
              <DataPanel className="p-4">
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Alt Text (Optional)
                </label>
                <CommandInput
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility..."
                />
                <p className="text-xs text-text-tertiary mt-2">
                  Alt text helps screen readers and improves SEO
                </p>
              </DataPanel>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <DataPanel className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Image URL *
                </label>
                <CommandInput
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>

              <div>
                <label className="block text-sm text-text-tertiary uppercase mb-2">
                  Alt Text (Optional)
                </label>
                <CommandInput
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility..."
                />
              </div>
            </DataPanel>

            {imageUrl && (
              <DataPanel className="p-4">
                <p className="text-sm text-text-tertiary mb-2">Preview:</p>
                <img
                  src={imageUrl}
                  alt={altText || 'Preview'}
                  className="max-w-full max-h-48 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </DataPanel>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <CommandButton variant="secondary" onClick={handleClose}>
            CANCEL
          </CommandButton>
          <CommandButton
            onClick={activeTab === 'upload' ? handleInsertUploadedImage : handleInsertUrlImage}
            disabled={!canInsert}
          >
            INSERT IMAGE
          </CommandButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
