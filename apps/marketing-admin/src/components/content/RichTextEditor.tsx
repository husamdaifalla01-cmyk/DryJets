/**
 * RICH TEXT EDITOR
 *
 * Tiptap-based rich text editor for blog content.
 * Features: Bold, italic, headings, lists, links, images.
 *
 * @module components/content/RichTextEditor
 */

'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing your content...',
  className,
  editable = true,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-neon-cyan hover:underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-invert max-w-none min-h-[400px] p-4',
          'focus:outline-none',
          'prose-headings:text-text-primary prose-headings:font-bold',
          'prose-p:text-text-secondary prose-p:leading-7',
          'prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:underline',
          'prose-strong:text-text-primary prose-strong:font-bold',
          'prose-code:text-neon-purple prose-code:bg-bg-elevated prose-code:px-1 prose-code:rounded',
          'prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-border-emphasis',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-li:text-text-secondary',
          'prose-blockquote:border-l-4 prose-blockquote:border-neon-cyan prose-blockquote:pl-4 prose-blockquote:italic'
        ),
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const MenuButton = ({
    onClick,
    active,
    disabled,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-2 rounded transition-colors',
        active
          ? 'bg-neon-cyan/20 text-neon-cyan'
          : 'hover:bg-bg-elevated text-text-tertiary hover:text-text-primary',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );

  return (
    <div className={cn('border border-border-emphasis rounded', className)}>
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-border-emphasis bg-bg-elevated">
          {/* Text Formatting */}
          <div className="flex gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
            >
              <Bold className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
            >
              <Italic className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
            >
              <Code className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-border-emphasis" />

          {/* Headings */}
          <div className="flex gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-border-emphasis" />

          {/* Lists */}
          <div className="flex gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
            >
              <List className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
            >
              <ListOrdered className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
            >
              <Quote className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-border-emphasis" />

          {/* Media */}
          <div className="flex gap-1">
            <MenuButton onClick={addLink} active={editor.isActive('link')}>
              <LinkIcon className="w-4 h-4" />
            </MenuButton>
            <MenuButton onClick={addImage}>
              <ImageIcon className="w-4 h-4" />
            </MenuButton>
          </div>

          <div className="w-px h-6 bg-border-emphasis" />

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="w-4 h-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="w-4 h-4" />
            </MenuButton>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
