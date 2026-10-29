'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/image-upload';
import { Plus, Trash2, Megaphone, Loader2, X } from 'lucide-react';
import type { AdSlot, AdPlacement } from '@/lib/types';
import { cn } from '@/lib/utils';

const PLACEMENTS: { value: AdPlacement; label: string }[] = [
  { value: 'header', label: 'Header (top of homepage)' },
  { value: 'in_article', label: 'In-article (inside article pages)' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'footer', label: 'Footer' },
];

const EMPTY_FORM = {
  placement: 'header' as AdPlacement,
  image_url: '',
  link_url: '',
  alt_text: '',
  is_active: true,
};

export default function AdminAdsPage() {
  const { hasRole } = useAuth();
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadAds = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ad_slots')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load ads');
    } else {
      setAds((data || []) as AdSlot[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasRole('admin')) loadAds();
  }, [hasRole, loadAds]);

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-20">
        <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-sans">
          You need admin access to manage ads.
        </p>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!form.image_url || !form.link_url) {
      toast.error('Image and link URL are required');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('ad_slots').insert({
      placement: form.placement,
      image_url: form.image_url,
      link_url: form.link_url,
      alt_text: form.alt_text,
      is_active: form.is_active,
    });
    if (error) {
      toast.error('Failed to create ad: ' + error.message);
    } else {
      toast.success('Ad created');
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadAds();
    }
    setSaving(false);
  };

  const handleToggleActive = async (ad: AdSlot) => {
    const { error } = await supabase
      .from('ad_slots')
      .update({ is_active: !ad.is_active })
      .eq('id', ad.id);
    if (error) {
      toast.error('Failed to update: ' + error.message);
    } else {
      loadAds();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad? This cannot be undone.')) return;
    const { error } = await supabase.from('ad_slots').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      toast.success('Ad deleted');
      loadAds();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Ad Space</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            {ads.length} total banners
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Ad'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-sm p-6 mb-8 space-y-5 max-w-xl">
          <div>
            <label className="block text-sm font-sans font-medium mb-2">
              Placement
            </label>
            <select
              value={form.placement}
              onChange={(e) =>
                setForm({ ...form, placement: e.target.value as AdPlacement })
              }
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {PLACEMENTS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-sans font-medium mb-2">
              Banner Image
            </label>
            <ImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              aspectRatio="aspect-[21/6]"
              alt={form.alt_text}
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium mb-2">
              Destination Link
            </label>
            <input
              type="url"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={form.alt_text}
              onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
              placeholder="Describe the ad for accessibility"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-sans">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Active (show immediately on the site)
          </label>

          <button
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-foreground text-sm font-sans font-semibold rounded-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Ad
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-sm">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-sans">
            No ads yet. Create your first banner.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-card border border-border rounded-sm overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.image_url}
                alt={ad.alt_text}
                className="w-full aspect-[21/6] object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 text-xs font-sans rounded-sm bg-muted capitalize">
                    {ad.placement.replace('_', ' ')}
                  </span>
                  <span
                    className={cn(
                      'px-2.5 py-1 text-xs font-sans rounded-sm',
                      ad.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {ad.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans truncate mb-3">
                  {ad.link_url}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(ad)}
                    className="flex-1 px-3 py-2 text-xs font-sans font-medium rounded-sm bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {ad.is_active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
