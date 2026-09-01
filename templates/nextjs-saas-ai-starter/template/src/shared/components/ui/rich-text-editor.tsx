'use client';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, ImagePlus, Italic, Link2, Paperclip } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

/** Normalize value to HTML (wrap plain text in <p>) */
function toHtml(value: string): string {
  const t = value?.trim() ?? '';
  if (!t) return '';
  if (t.startsWith('<') && t.includes('>')) return t;
  return `<p>${t.replace(/\n/g, '</p><p>')}</p>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export interface RichTextEditorProps {
  /** Current value (HTML or plain text) */
  value: string;
  /** Called when content changes (HTML) */
  onChange: (html: string) => void;
  /** Placeholder when empty */
  placeholder?: string;
  /** Tenant slug for upload API (required for image/file upload) */
  tenantSlug: string;
  /** Optional key to remount editor when value source changes (e.g. assessment id) */
  editorKey?: string;
  /** Min height in pixels */
  minHeight?: number;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write notes…',
  tenantSlug,
  editorKey = 'default',
  minHeight = 100,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const initialContent = toHtml(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ heading: { levels: [2, 3] } }),
        Image.configure({ inline: false }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
        }),
        Placeholder.configure({ placeholder }),
      ],
      content: initialContent,
      editable: !disabled,
      editorProps: {
        attributes: {
          class: 'prose prose-sm dark:prose-invert max-w-none min-h-[var(--min-height)] px-3 py-2 focus:outline-none',
          style: `--min-height: ${minHeight}px`,
        },
      },
      onUpdate: ({ editor }: { editor: Editor }) => {
        onChangeRef.current(editor.getHTML());
      },
    },
    [editorKey, placeholder, disabled, minHeight],
  );

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = toHtml(value);
    if (next !== current && next !== initialContent) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value, initialContent]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const uploadFile = useCallback(
    async (file: File, asImage: boolean) => {
      try {
        const res = await fetch(`/api/tenants/${tenantSlug}/assessment-attachments/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? 'Upload failed');
        }
        const data = (await res.json()) as {
          presignedUrl: string;
          fileId: string;
          embedUrl: string;
        };
        const putRes = await fetch(data.presignedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!putRes.ok) throw new Error('Upload to storage failed');

        if (asImage && file.type.startsWith('image/')) {
          editor?.commands.setImage({ src: data.embedUrl, alt: file.name });
        } else {
          editor
            ?.chain()
            .focus()
            .insertContent(
              `<a href="${data.embedUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(file.name)}</a>`,
            )
            .run();
        }
      } catch (e) {
        console.error('Upload error', e);
        throw e;
      }
    },
    [tenantSlug, editor],
  );

  const handleImageClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) uploadFile(file, true).catch(() => {});
    };
    input.click();
  }, [uploadFile]);

  const handleFileClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) uploadFile(file, false).catch(() => {});
    };
    input.click();
  }, [uploadFile]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-background overflow-hidden',
        disabled && 'opacity-60 pointer-events-none',
        className,
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-border p-1 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleLink({ href: '' }).run()}
          aria-label="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleImageClick}
          aria-label="Insert image"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleFileClick}
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
