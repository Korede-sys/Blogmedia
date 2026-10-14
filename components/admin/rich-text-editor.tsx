'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  Pencil,
} from 'lucide-react';
import type { ArticleBlock, ArticleInline } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}

interface HistoryState {
  blocks: ArticleBlock[];
  selection: number | null;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [focusedBlock, setFocusedBlock] = useState<number | null>(null);
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const textareaRefs = useRef<Map<number, HTMLTextAreaElement>>(new Map());

  // Push to history
  const pushHistory = useCallback(
    (blocks: ArticleBlock[]) => {
      const history = historyRef.current;
      const idx = historyIndexRef.current;
      // Truncate forward history
      history.splice(idx + 1);
      history.push({ blocks: JSON.parse(JSON.stringify(blocks)), selection: focusedBlock });
      // Cap history at 50
      if (history.length > 50) history.shift();
      historyIndexRef.current = history.length - 1;
    },
    [focusedBlock]
  );

  const update = useCallback(
    (blocks: ArticleBlock[], addToHistory = true) => {
      if (addToHistory) pushHistory(blocks);
      onChange(blocks);
    },
    [onChange, pushHistory]
  );

  const undo = () => {
    const history = historyRef.current;
    const idx = historyIndexRef.current;
    if (idx > 0) {
      historyIndexRef.current = idx - 1;
      onChange(JSON.parse(JSON.stringify(history[idx - 1].blocks)));
    }
  };

  const redo = () => {
    const history = historyRef.current;
    const idx = historyIndexRef.current;
    if (idx < history.length - 1) {
      historyIndexRef.current = idx + 1;
      onChange(JSON.parse(JSON.stringify(history[idx + 1].blocks)));
    }
  };

  const addBlock = (type: ArticleBlock['type'], index?: number) => {
    const newBlock: ArticleBlock =
      type === 'heading'
        ? { type: 'heading', attrs: { level: 2 }, content: [] }
        : type === 'bulletList'
        ? { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [] }] }] }
        : type === 'orderedList'
        ? { type: 'orderedList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [] }] }] }
        : type === 'blockquote'
        ? { type: 'blockquote', content: [{ type: 'paragraph', content: [] }] }
        : type === 'image'
        ? { type: 'image', attrs: { src: '', alt: '', caption: '' } }
        : type === 'horizontalRule'
        ? { type: 'horizontalRule' }
        : { type: 'paragraph', content: [] };

    const newBlocks = [...value];
    const insertAt = index !== undefined ? index + 1 : newBlocks.length;
    newBlocks.splice(insertAt, 0, newBlock);
    update(newBlocks);
    setFocusedBlock(insertAt);
  };

  const removeBlock = (index: number) => {
    if (value.length <= 1) return;
    const newBlocks = value.filter((_, i) => i !== index);
    update(newBlocks);
  };

  const updateBlockContent = (index: number, text: string) => {
    const newBlocks = [...value];
    const block = newBlocks[index];
    const inline: ArticleInline = { type: 'text', text };
    if (block.type === 'paragraph' || block.type === 'heading') {
      newBlocks[index] = { ...block, content: text ? [inline] : [] };
    }
    onChange(newBlocks);
  };

  const changeBlockType = (index: number, newType: ArticleBlock['type']) => {
    const newBlocks = [...value];
    const block = newBlocks[index];
    const currentText = block.type === 'paragraph' || block.type === 'heading'
      ? (block.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('')
      : '';

    if (newType === 'heading') {
      newBlocks[index] = { type: 'heading', attrs: { level: 2 }, content: currentText ? [{ type: 'text', text: currentText }] : [] };
    } else if (newType === 'paragraph') {
      newBlocks[index] = { type: 'paragraph', content: currentText ? [{ type: 'text', text: currentText }] : [] };
    } else if (newType === 'bulletList') {
      newBlocks[index] = {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [{ type: 'paragraph', content: currentText ? [{ type: 'text', text: currentText }] : [] }] }],
      };
    } else if (newType === 'orderedList') {
      newBlocks[index] = {
        type: 'orderedList',
        content: [{ type: 'listItem', content: [{ type: 'paragraph', content: currentText ? [{ type: 'text', text: currentText }] : [] }] }],
      };
    } else if (newType === 'blockquote') {
      newBlocks[index] = { type: 'blockquote', content: [{ type: 'paragraph', content: currentText ? [{ type: 'text', text: currentText }] : [] }] };
    }
    update(newBlocks);
  };

  const toggleBold = () => {
    if (focusedBlock === null) return;
    const block = value[focusedBlock];
    if (block.type !== 'paragraph' && block.type !== 'heading') return;
    const textarea = textareaRefs.current.get(focusedBlock);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    const text = (block.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('');
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newContent: ArticleInline[] = [];
    if (beforeText) newContent.push({ type: 'text', text: beforeText });
    newContent.push({ type: 'text', text: selectedText, marks: [{ type: 'bold' }] });
    if (afterText) newContent.push({ type: 'text', text: afterText });

    const newBlocks = [...value];
    newBlocks[focusedBlock] = { ...block, content: newContent };
    update(newBlocks);
  };

  const toggleItalic = () => {
    if (focusedBlock === null) return;
    const block = value[focusedBlock];
    if (block.type !== 'paragraph' && block.type !== 'heading') return;
    const textarea = textareaRefs.current.get(focusedBlock);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    const text = (block.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('');
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newContent: ArticleInline[] = [];
    if (beforeText) newContent.push({ type: 'text', text: beforeText });
    newContent.push({ type: 'text', text: selectedText, marks: [{ type: 'italic' }] });
    if (afterText) newContent.push({ type: 'text', text: afterText });

    const newBlocks = [...value];
    newBlocks[focusedBlock] = { ...block, content: newContent };
    update(newBlocks);
  };

  const addLink = () => {
    if (focusedBlock === null) return;
    const block = value[focusedBlock];
    if (block.type !== 'paragraph' && block.type !== 'heading') return;
    const textarea = textareaRefs.current.get(focusedBlock);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    const url = prompt('Enter URL:');
    if (!url) return;
    const text = (block.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('');
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newContent: ArticleInline[] = [];
    if (beforeText) newContent.push({ type: 'text', text: beforeText });
    newContent.push({ type: 'text', text: selectedText, marks: [{ type: 'link', attrs: { href: url } }] });
    if (afterText) newContent.push({ type: 'text', text: afterText });

    const newBlocks = [...value];
    newBlocks[focusedBlock] = { ...block, content: newContent };
    update(newBlocks);
  };

  const addImage = (index: number) => {
    const url = prompt('Enter image URL:');
    if (!url) return;
    const alt = prompt('Enter alt text (for accessibility):') || '';
    const caption = prompt('Enter caption (optional):') || '';
    const newBlocks = [...value];
    const imageBlock: ArticleBlock = { type: 'image', attrs: { src: url, alt, caption } };
    newBlocks.splice(index + 1, 0, imageBlock);
    // Add a paragraph after the image for continued writing
    newBlocks.splice(index + 2, 0, { type: 'paragraph', content: [] });
    update(newBlocks);
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: toggleBold },
    { icon: Italic, label: 'Italic', action: toggleItalic },
    { icon: LinkIcon, label: 'Link', action: addLink },
    { icon: Heading2, label: 'Heading 2', action: () => focusedBlock !== null && changeBlockType(focusedBlock, 'heading') },
    { icon: List, label: 'Bullet List', action: () => focusedBlock !== null && changeBlockType(focusedBlock, 'bulletList') },
    { icon: ListOrdered, label: 'Numbered List', action: () => focusedBlock !== null && changeBlockType(focusedBlock, 'orderedList') },
    { icon: Quote, label: 'Blockquote', action: () => focusedBlock !== null && changeBlockType(focusedBlock, 'blockquote') },
    { icon: Undo, label: 'Undo', action: undo },
    { icon: Redo, label: 'Redo', action: redo },
  ];

  const getBlockText = (block: ArticleBlock): string => {
    if (block.type === 'paragraph' || block.type === 'heading') {
      return (block.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('');
    }
    return '';
  };

  const renderBlock = (block: ArticleBlock, index: number) => {
    if (block.type === 'image') {
      return (
        <div key={index} className="relative group my-4">
          {block.attrs.src ? (
            <img
              src={block.attrs.src}
              alt={block.attrs.alt || ''}
              className="w-full rounded-sm"
            />
          ) : (
            <div className="w-full aspect-video bg-muted rounded-sm flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          {block.attrs.caption && (
            <p className="text-sm text-muted-foreground text-center italic mt-2">
              {block.attrs.caption}
            </p>
          )}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                const url = prompt('Image URL:', block.attrs.src);
                if (url !== null) {
                  const newBlocks = [...value];
                  (newBlocks[index] as { type: 'image'; attrs: { src: string; alt?: string; caption?: string } }).attrs.src = url;
                  update(newBlocks);
                }
              }}
              className="p-1.5 bg-background border border-border rounded-sm shadow-sm hover:bg-muted"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => removeBlock(index)}
              className="p-1.5 bg-background border border-border rounded-sm shadow-sm hover:bg-muted"
            >
              ×
            </button>
          </div>
        </div>
      );
    }

    if (block.type === 'horizontalRule') {
      return <hr key={index} className="my-6 border-border" />;
    }

    if (block.type === 'blockquote') {
      const text = (block.content || []).flatMap((b) =>
        b.type === 'paragraph' ? (b.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('') : ''
      ).join('');
      return (
        <textarea
          key={index}
          ref={(el) => { if (el) textareaRefs.current.set(index, el); }}
          value={text}
          onChange={(e) => {
            const newBlocks = [...value];
            newBlocks[index] = {
              type: 'blockquote',
              content: [{ type: 'paragraph', content: e.target.value ? [{ type: 'text', text: e.target.value }] : [] }],
            };
            onChange(newBlocks);
          }}
          onFocus={() => setFocusedBlock(index)}
          placeholder="Quote text…"
          className="w-full p-4 border-l-4 border-gold bg-muted/30 italic font-serif text-lg resize-y min-h-[80px] focus:outline-none focus:ring-1 focus:ring-gold rounded-r-sm"
          rows={2}
        />
      );
    }

    if (block.type === 'bulletList' || block.type === 'orderedList') {
      const items = (block.content || []).map((item) =>
        (item.content || []).map((p) => (p.content || []).map((c) => (c.type === 'text' ? c.text : '')).join('')).join(' ')
      );
      return (
        <div key={index} className="my-2">
          {items.map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 text-muted-foreground">{block.type === 'bulletList' ? '•' : `${i + 1}.`}</span>
              <textarea
                value={text}
                onChange={(e) => {
                  const newBlocks = [...value];
                  const content = [...(block.content || [])];
                  content[i] = {
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: e.target.value ? [{ type: 'text', text: e.target.value }] : [] }],
                  };
                  newBlocks[index] = { ...block, content };
                  onChange(newBlocks);
                }}
                onFocus={() => setFocusedBlock(index)}
                placeholder="List item…"
                className="flex-1 p-2 resize-y min-h-[40px] focus:outline-none focus:ring-1 focus:ring-gold rounded-sm"
                rows={1}
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newBlocks = [...value];
              const content = [...(block.content || []), { type: 'listItem' as const, content: [{ type: 'paragraph' as const, content: [] }] }];
              newBlocks[index] = { ...block, content } as typeof block;
              update(newBlocks);
            }}
            className="mt-1 text-xs text-gold hover:text-gold/80 font-sans ml-6"
          >
            + Add item
          </button>
        </div>
      );
    }

    // Paragraph or heading
    const isHeading = block.type === 'heading';
    const text = getBlockText(block);
    return (
      <textarea
        key={index}
        ref={(el) => { if (el) textareaRefs.current.set(index, el); }}
        value={text}
        onChange={(e) => updateBlockContent(index, e.target.value)}
        onFocus={() => setFocusedBlock(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addBlock('paragraph', index);
          }
        }}
        placeholder={isHeading ? 'Heading text…' : 'Write something…'}
        className={cn(
          'w-full p-2 resize-y min-h-[48px] focus:outline-none focus:ring-1 focus:ring-gold rounded-sm transition-all',
          isHeading && 'font-serif text-2xl font-bold'
        )}
        rows={1}
      />
    );
  };

  return (
    <div className="border border-border rounded-sm bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
        {toolbarButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              onClick={btn.action}
              title={btn.label}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
        {focusedBlock !== null && (
          <button
            onClick={() => addImage(focusedBlock)}
            title="Add Image"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        )}
        <div className="ml-auto">
          <button
            onClick={() => addBlock('horizontalRule')}
            title="Horizontal Rule"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="p-4 space-y-2 min-h-[400px]">
        {value.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-sans text-sm mb-4">
              Start writing your article…
            </p>
            <button
              onClick={() => addBlock('paragraph')}
              className="text-sm text-gold hover:text-gold/80 font-sans"
            >
              + Add paragraph
            </button>
          </div>
        ) : (
          <>
            {value.map((block, index) => renderBlock(block, index))}
            <button
              onClick={() => addBlock('paragraph')}
              className="block w-full text-center py-3 text-sm text-muted-foreground hover:text-gold font-sans transition-colors"
            >
              + Add paragraph
            </button>
          </>
        )}
      </div>
    </div>
  );
}
