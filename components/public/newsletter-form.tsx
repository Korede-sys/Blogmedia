'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Check, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from '@/lib/queries';

interface NewsletterFormProps {
  variant?: 'full' | 'compact';
}

export function NewsletterForm({ variant = 'full' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await subscribeToNewsletter(email.trim());
    setLoading(false);

    if (error) {
      if (error.includes('duplicate') || error.includes('unique')) {
        toast.success('You are already subscribed to Bliss Media.');
        setSuccess(true);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } else {
      toast.success('Welcome! You are now subscribed to Bliss Media.');
      setSuccess(true);
      setEmail('');
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-3 text-foreground">
        <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
          <Check className="w-5 h-5 text-gold" />
        </div>
        <div>
          <p className="font-sans font-semibold">You are subscribed!</p>
          <p className="text-sm text-muted-foreground font-sans">
            Watch your inbox for the next issue.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="flex-1 px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md flex flex-col sm:flex-row gap-3"
    >
      <div className="flex-1 relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-sm text-foreground font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3.5 bg-gold text-foreground font-sans font-semibold rounded-sm hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Subscribe'
        )}
      </button>
    </form>
  );
}
