'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import type { SiteSettings } from '@/lib/types';

export default function SettingsPage() {
  const { hasRole } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hasRole('admin')) return;
    loadSettings();
  }, [hasRole]);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) {
      toast.error('Failed to load settings');
    } else {
      setSettings(data as SiteSettings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .update({
        site_name: settings.site_name,
        tagline: settings.tagline,
        description: settings.description,
        primary_email: settings.primary_email,
        social_twitter: settings.social_twitter,
        social_facebook: settings.social_facebook,
        social_instagram: settings.social_instagram,
        social_linkedin: settings.social_linkedin,
        footer_text: settings.footer_text,
      })
      .eq('id', 1);
    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success('Settings saved');
    }
    setSaving(false);
  };

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground font-sans">
          Administrator access required.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground font-sans">Settings not found.</p>
      </div>
    );
  }

  const fields: { key: keyof SiteSettings; label: string; type?: string }[] = [
    { key: 'site_name', label: 'Site Name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'primary_email', label: 'Primary Email' },
    { key: 'social_twitter', label: 'Twitter URL' },
    { key: 'social_facebook', label: 'Facebook URL' },
    { key: 'social_instagram', label: 'Instagram URL' },
    { key: 'social_linkedin', label: 'LinkedIn URL' },
    { key: 'footer_text', label: 'Footer Text', type: 'textarea' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Manage your site configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="space-y-5">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={(settings[field.key] as string) || ''}
                onChange={(e) =>
                  setSettings({ ...settings, [field.key]: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold resize-y"
              />
            ) : (
              <input
                type="text"
                value={(settings[field.key] as string) || ''}
                onChange={(e) =>
                  setSettings({ ...settings, [field.key]: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
