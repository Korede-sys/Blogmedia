'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Send } from 'lucide-react';
import type { Comment } from '@/lib/types';
import { submitComment } from '@/lib/queries';
import { formatRelativeTime } from '@/lib/utils';

interface CommentSectionProps {
  articleId: string;
  comments: Comment[];
}

export function CommentSection({ articleId, comments }: CommentSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !body.trim()) return;

    startTransition(async () => {
      const { error } = await submitComment(
        articleId,
        name.trim(),
        email.trim(),
        body.trim()
      );
      if (error) {
        toast.error('Failed to submit comment. Please try again.');
      } else {
        toast.success(
          'Comment submitted. It will appear after moderation.'
        );
        setBody('');
        // Optimistically show the comment as pending
        const optimistic: Comment = {
          id: 'temp-' + Date.now(),
          article_id: articleId,
          author_name: name.trim(),
          author_email: email.trim(),
          user_id: null,
          body: body.trim(),
          status: 'pending',
          parent_id: null,
          created_at: new Date().toISOString(),
        };
        setLocalComments((prev) => [optimistic, ...prev]);
      }
    });
  };

  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-5 h-5 text-gold" />
        <h2 className="font-serif text-2xl font-bold">
          Discussion ({localComments.length})
        </h2>
      </div>

      {/* Comment form */}
      <form
        onSubmit={handleSubmit}
        className="mb-10 p-6 bg-card border border-border rounded-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email (not published)"
            required
            className="px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts…"
          required
          rows={4}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold resize-y"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-sans">
            Comments are moderated before appearing.
          </p>
          <button
            type="submit"
            disabled={isPending || !body.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post Comment
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {localComments.length === 0 ? (
        <p className="text-muted-foreground font-sans italic text-center py-8">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-6">
          {localComments.map((comment) => (
            <div
              key={comment.id}
              className="p-5 border-l-2 border-border hover:border-gold transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-sm font-bold text-muted-foreground">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-sans font-semibold text-sm">
                    {comment.author_name}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans">
                    {formatRelativeTime(comment.created_at)}
                    {comment.status === 'pending' && (
                      <span className="ml-2 text-gold">· Pending review</span>
                    )}
                  </p>
                </div>
              </div>
              <p className="font-sans text-foreground/90 leading-relaxed">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
