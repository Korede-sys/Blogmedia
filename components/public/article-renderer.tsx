import Image from 'next/image';
import type { ArticleBlock, ArticleInline } from '@/lib/types';

function renderInline(inline: ArticleInline, key: number): React.ReactNode {
  if (inline.type !== 'text') return null;
  let content: React.ReactNode = inline.text;
  if (inline.marks) {
    for (const mark of inline.marks) {
      if (mark.type === 'bold') {
        content = <strong key={key}>{content}</strong>;
      } else if (mark.type === 'italic') {
        content = <em key={key}>{content}</em>;
      } else if (mark.type === 'link' && mark.attrs?.href) {
        content = (
          <a key={key} href={mark.attrs.href} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        );
      }
    }
  }
  return <span key={key}>{content}</span>;
}

function renderInlines(inlines: ArticleInline[] | undefined): React.ReactNode {
  if (!inlines) return null;
  return inlines.map((inline, i) => renderInline(inline, i));
}

function renderBlock(block: ArticleBlock, key: number): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const level = block.attrs?.level ?? 2;
      const content = renderInlines(block.content);
      if (level === 2) return <h2 key={key}>{content}</h2>;
      if (level === 3) return <h3 key={key}>{content}</h3>;
      if (level === 1) return <h1 key={key}>{content}</h1>;
      return <h2 key={key}>{content}</h2>;
    }
    case 'paragraph':
      return <p key={key}>{renderInlines(block.content)}</p>;
    case 'blockquote':
      return (
        <blockquote key={key}>
          {(block.content || []).map((b, i) => renderBlock(b, i))}
        </blockquote>
      );
    case 'bulletList':
      return (
        <ul key={key}>
          {(block.content || []).map((item, i) => (
            <li key={i}>
              {(item.content || []).map((p, j) => (
                <span key={j}>{renderInlines(p.content)}</span>
              ))}
            </li>
          ))}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key}>
          {(block.content || []).map((item, i) => (
            <li key={i}>
              {(item.content || []).map((p, j) => (
                <span key={j}>{renderInlines(p.content)}</span>
              ))}
            </li>
          ))}
        </ol>
      );
    case 'image':
      return (
        <figure key={key}>
          <Image
            src={block.attrs.src}
            alt={block.attrs.alt || ''}
            width={800}
            height={500}
            className="w-full h-auto rounded-sm"
          />
          {block.attrs.caption && (
            <figcaption>{block.attrs.caption}</figcaption>
          )}
        </figure>
      );
    case 'horizontalRule':
      return <hr key={key} className="my-8 border-border" />;
    default:
      return null;
  }
}

export function ArticleRenderer({ blocks }: { blocks: ArticleBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return (
      <p className="text-muted-foreground italic">
        This article has no content yet.
      </p>
    );
  }
  return (
    <div className="article-body">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
