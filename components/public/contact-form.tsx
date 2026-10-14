'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending — in production this would call an edge function
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    toast.success('Message sent. We will get back to you soon.');
  };

  if (sent) {
    return (
      <div className="p-8 bg-card border border-border rounded-sm text-center">
        <h3 className="font-serif text-xl font-bold mb-2">Message Sent</h3>
        <p className="text-muted-foreground font-sans">
          Thank you for reaching out. We will respond as soon as possible.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
          }}
          className="mt-6 text-sm font-sans text-gold hover:text-gold/80 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full px-4 py-3 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder="What is this about?"
        />
      </div>
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          className="w-full px-4 py-3 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold resize-y"
          placeholder="Your message…"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
