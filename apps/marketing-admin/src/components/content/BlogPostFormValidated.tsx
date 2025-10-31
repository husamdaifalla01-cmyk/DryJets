/**
 * BLOG POST FORM WITH VALIDATION
 *
 * Fully validated blog post form using react-hook-form + Zod + Tiptap.
 * Features rich text editing, SEO optimization, and media management.
 *
 * @module components/content/BlogPostFormValidated
 */

'use client';

import React, { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCreateBlogPost, useUpdateBlogPost } from '@/lib/hooks/useContent';
import { BlogPost } from '@/lib/api/content';
import {
  createBlogPostSchema,
  CreateBlogPostFormData,
} from '@/lib/validations';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandInput, CommandTextarea } from '@/components/command/CommandInput';
import { DataPanel } from '@/components/command/CommandPanel';
import { RichTextEditor } from './RichTextEditor';
import { Loader2, Save, X, Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BlogPostFormValidatedProps {
  mode: 'create' | 'update';
  blogPost?: BlogPost;
  profileId: string;
  onSuccess?: (blogPostId: string) => void;
  onCancel?: () => void;
}

export const BlogPostFormValidated: React.FC<BlogPostFormValidatedProps> = ({
  mode,
  blogPost,
  profileId,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const createBlogPost = useCreateBlogPost();
  const updateBlogPost = useUpdateBlogPost();

  const isCreate = mode === 'create';

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateBlogPostFormData>({
    mode: 'onBlur',
    resolver: zodResolver(createBlogPostSchema),
    defaultValues: isCreate
      ? {
          profileId,
          title: '',
          content: '',
          excerpt: '',
          slug: '',
          seoTitle: '',
          seoDescription: '',
          keywords: [],
          tags: [],
          categories: [],
          featuredImage: '',
          author: '',
          publishAt: undefined,
          platform: undefined,
        }
      : {
          profileId,
          title: blogPost?.title || '',
          content: blogPost?.body || '',
          excerpt: blogPost?.excerpt || '',
          slug: blogPost?.slug || '',
          seoTitle: blogPost?.seoTitle || '',
          seoDescription: blogPost?.seoDescription || '',
          keywords: blogPost?.keywords || [],
          tags: blogPost?.tags || [],
          categories: blogPost?.categories || [],
          featuredImage: blogPost?.featuredImage || '',
          author: blogPost?.author || '',
          publishAt: undefined,
          platform: undefined,
        },
  });

  const title = watch('title');
  const keywords = watch('keywords') || [];
  const tags = watch('tags') || [];
  const categories = watch('categories') || [];

  // Auto-generate slug from title
  const generateSlug = useCallback(() => {
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [title, setValue]);

  const onSubmit = async (data: CreateBlogPostFormData) => {
    try {
      if (isCreate) {
        createBlogPost.mutate(data, {
          onSuccess: (newBlog) => {
            if (onSuccess) {
              onSuccess(newBlog.id);
            } else {
              router.push(`/blogs/${newBlog.id}`);
            }
          },
        });
      } else {
        updateBlogPost.mutate(
          { id: blogPost!.id, data },
          {
            onSuccess: (updatedBlog) => {
              if (onSuccess) {
                onSuccess(updatedBlog.id);
              } else {
                router.push(`/blogs/${updatedBlog.id}`);
              }
            },
          }
        );
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addArrayItem = (field: 'keywords' | 'tags' | 'categories', value: string) => {
    if (!value.trim()) return;
    const current = watch(field) as string[];
    setValue(field, [...(current || []), value.trim()], { shouldValidate: true });
  };

  const removeArrayItem = (
    field: 'keywords' | 'tags' | 'categories',
    index: number
  ) => {
    const current = watch(field) as string[];
    setValue(
      field,
      current.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Title & Slug */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              TITLE & URL
            </h3>
          </div>

          {/* Blog Title */}
          <div>
            <label htmlFor="title" className="block text-sm text-text-tertiary uppercase mb-2">
              Blog Title *
            </label>
            <CommandInput
              {...register('title')}
              id="title"
              placeholder="e.g., 10 Ways to Boost Your Marketing ROI"
              className={errors.title ? 'border-status-error' : ''}
            />
            {errors.title && (
              <p className="text-status-error text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              URL Slug *
            </label>
            <div className="flex gap-2">
              <CommandInput
                {...register('slug')}
              id="slug"
                placeholder="10-ways-boost-marketing-roi"
                className={cn('flex-1', errors.slug && 'border-status-error')}
              />
              <CommandButton
                type="button"
                variant="secondary"
                onClick={generateSlug}
                disabled={!title}
              >
                <Sparkles className="w-4 h-4" />
                GENERATE
              </CommandButton>
            </div>
            {errors.slug && (
              <p className="text-status-error text-xs mt-1">{errors.slug.message}</p>
            )}
            <p className="text-text-tertiary text-xs mt-1">
              URL: /blog/{watch('slug') || 'your-slug-here'}
            </p>
          </div>
        </div>
      </DataPanel>

      {/* Content Editor */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">CONTENT</h3>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              Blog Content *
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Start writing your blog post..."
                  className={errors.content ? 'border-status-error' : ''}
                />
              )}
            />
            {errors.content && (
              <p className="text-status-error text-xs mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              Excerpt (Optional)
            </label>
            <CommandTextarea
              {...register('excerpt')}
              id="excerpt"
              placeholder="A brief summary of your blog post..."
              rows={3}
              className={errors.excerpt ? 'border-status-error' : ''}
            />
            {errors.excerpt && (
              <p className="text-status-error text-xs mt-1">
                {errors.excerpt.message}
              </p>
            )}
            <p className="text-text-tertiary text-xs mt-1">
              Used in previews and social media sharing
            </p>
          </div>
        </div>
      </DataPanel>

      {/* SEO Optimization */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              SEO OPTIMIZATION
            </h3>
          </div>

          {/* SEO Title */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              SEO Title (Optional)
            </label>
            <CommandInput
              {...register('seoTitle')}
              id="seoTitle"
              placeholder="Optimized title for search engines"
              className={errors.seoTitle ? 'border-status-error' : ''}
            />
            {errors.seoTitle && (
              <p className="text-status-error text-xs mt-1">
                {errors.seoTitle.message}
              </p>
            )}
            <p className="text-text-tertiary text-xs mt-1">
              {watch('seoTitle')?.length || 0}/70 characters (optimal: 50-60)
            </p>
          </div>

          {/* SEO Description */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              SEO Description (Optional)
            </label>
            <CommandTextarea
              {...register('seoDescription')}
              id="seoDescription"
              placeholder="Meta description for search results"
              rows={2}
              className={errors.seoDescription ? 'border-status-error' : ''}
            />
            {errors.seoDescription && (
              <p className="text-status-error text-xs mt-1">
                {errors.seoDescription.message}
              </p>
            )}
            <p className="text-text-tertiary text-xs mt-1">
              {watch('seoDescription')?.length || 0}/160 characters (optimal:
              150-160)
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              SEO Keywords (Optional, min 3)
            </label>
            <div className="flex gap-2 mb-2">
              <CommandInput
                id="keyword-input"
                placeholder="Add a keyword..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addArrayItem('keywords', input.value);
                    input.value = '';
                  }
                }}
              />
              <CommandButton
                type="button"
                size="sm"
                onClick={() => {
                  const input = document.getElementById(
                    'keyword-input'
                  ) as HTMLInputElement;
                  if (input) {
                    addArrayItem('keywords', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </CommandButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="gap-2">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('keywords', idx)}
                    className="hover:text-status-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.keywords && (
              <p className="text-status-error text-xs mt-1">
                {errors.keywords.message}
              </p>
            )}
          </div>
        </div>
      </DataPanel>

      {/* Media & Categorization */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              MEDIA & CATEGORIZATION
            </h3>
          </div>

          {/* Featured Image */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              Featured Image URL (Optional)
            </label>
            <CommandInput
              {...register('featuredImage')}
              id="featuredImage"
              type="url"
              placeholder="https://example.com/image.jpg"
              className={errors.featuredImage ? 'border-status-error' : ''}
            />
            {errors.featuredImage && (
              <p className="text-status-error text-xs mt-1">
                {errors.featuredImage.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <CommandInput
                id="tag-input"
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addArrayItem('tags', input.value);
                    input.value = '';
                  }
                }}
              />
              <CommandButton
                type="button"
                size="sm"
                onClick={() => {
                  const input = document.getElementById('tag-input') as HTMLInputElement;
                  if (input) {
                    addArrayItem('tags', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </CommandButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="gap-2">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', idx)}
                    className="hover:text-status-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              Categories (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <CommandInput
                id="category-input"
                placeholder="Add a category..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    addArrayItem('categories', input.value);
                    input.value = '';
                  }
                }}
              />
              <CommandButton
                type="button"
                size="sm"
                onClick={() => {
                  const input = document.getElementById(
                    'category-input'
                  ) as HTMLInputElement;
                  if (input) {
                    addArrayItem('categories', input.value);
                    input.value = '';
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </CommandButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, idx) => (
                <Badge key={idx} variant="outline" className="gap-2">
                  {category}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('categories', idx)}
                    className="hover:text-status-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Author */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              Author (Optional)
            </label>
            <CommandInput
              {...register('author')}
              id="author"
              placeholder="Author name"
              className={errors.author ? 'border-status-error' : ''}
            />
          </div>
        </div>
      </DataPanel>

      {/* Publishing Options */}
      <DataPanel>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient-cyan">
              PUBLISHING OPTIONS
            </h3>
          </div>

          {/* Platform */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              Target Platform (Optional)
            </label>
            <select {...register('platform')} id="platform" className="input-command w-full">
              <option value="">Select platform...</option>
              <option value="medium">Medium</option>
              <option value="substack">Substack</option>
            </select>
          </div>

          {/* Publish Date */}
          <div>
            <label htmlFor="slug" className="block text-sm text-text-tertiary uppercase mb-2">
              Schedule Publish (Optional)
            </label>
            <CommandInput
              {...register('publishAt')}
              id="publishAt"
              type="datetime-local"
              className={errors.publishAt ? 'border-status-error' : ''}
            />
            <p className="text-text-tertiary text-xs mt-1">
              Leave empty to save as draft
            </p>
          </div>
        </div>
      </DataPanel>

      {/* Form Actions */}
      <div className="flex justify-between items-center">
        {onCancel && (
          <CommandButton type="button" variant="ghost" onClick={onCancel}>
            <X className="w-4 h-4" />
            CANCEL
          </CommandButton>
        )}
        <div className="flex gap-3 ml-auto">
          {!isCreate && (
            <CommandButton
              type="button"
              variant="secondary"
              disabled={!isDirty}
              onClick={() => router.back()}
            >
              DISCARD CHANGES
            </CommandButton>
          )}
          <CommandButton
            type="submit"
            disabled={
              isSubmitting || createBlogPost.isPending || updateBlogPost.isPending
            }
            loading={
              isSubmitting || createBlogPost.isPending || updateBlogPost.isPending
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isCreate ? 'CREATING...' : 'SAVING...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isCreate ? 'CREATE BLOG POST' : 'SAVE CHANGES'}
              </>
            )}
          </CommandButton>
        </div>
      </div>
    </form>
  );
};

export default BlogPostFormValidated;
