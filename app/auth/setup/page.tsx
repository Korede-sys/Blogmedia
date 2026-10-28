'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { supabase } from '@/lib/supabase-client';

export default function AdminSetupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/setup-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({ email, password, fullName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Setup failed');
        setLoading(false);
        return;
      }

      toast.success('Administrator account created. Please sign in.');
      router.push('/auth/sign-in');
    } catch {
      toast.error('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <section className="container-article py-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-gold" />
            <span className="category-label">Initial Setup</span>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Create Administrator
          </h1>
          <p className="mt-3 text-muted-foreground font-sans leading-relaxed">
            This page creates the first administrator account for Bliss Media.
            It can only be used once. After setup, additional users must be
            invited from the admin dashboard.
          </p>

          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-sm">
            <p className="text-xs font-sans text-muted-foreground">
              This is a one-time setup process. If an administrator already
              exists, this page will refuse to create another.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="Admin Name"
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
                placeholder="admin@blissmedia.example"
              />
            </div>
            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-background border border-border rounded-sm text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-foreground text-sm font-sans font-semibold rounded-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Administrator
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground font-sans">
            Already set up?{' '}
            <Link
              href="/auth/sign-in"
              className="text-gold hover:text-gold/80 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
