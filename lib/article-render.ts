import type { ArticleBlock, ArticleInline } from './types';

export function blocksToPlainText(blocks: ArticleBlock[]): string {
  return blocks
    .map((block) => blockToText(block))
    .join('\n\n')
    .trim();
}

function blockToText(block: ArticleBlock): string {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
      return inlinesToText(block.content);
    case 'blockquote':
      if (block.content) {
        return (block.content as ArticleBlock[])
          .map((b) => blockToText(b))
          .join(' ');
      }
      return '';
    case 'bulletList':
    case 'orderedList':
      if (block.content) {
        return (block.content as unknown as { content: { type: string; content?: ArticleInline[] }[] }[])
          .map((item) =>
            (item.content || [])
              .map((p) => inlinesToText(p.content))
              .join(' ')
          )
          .join(' ');
      }
      return '';
    case 'image':
      return block.attrs.alt || '';
    default:
      return '';
  }
}

function inlinesToText(inlines?: ArticleInline[]): string {
  if (!inlines) return '';
  return inlines
    .map((inline) => (inline.type === 'text' ? inline.text : ''))
    .join('');
}
