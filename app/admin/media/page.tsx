'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Upload,
  Copy,
  Trash2,
  Search,
  Loader2,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  name: string;
  id: string;
  url: string;
  size: number;
  created_at: string;
  altText: string;
}

const BUCKET_NAME = 'media';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function MediaLibraryPage() {
  const { profile } = useAuth();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MediaFile | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('uploads', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        if (error.message.includes('not found') || error.message.includes('bucket')) {
          setFiles([]);
        } else {
          console.error('Storage error:', error);
        }
      } else if (data) {
        const mediaFiles: MediaFile[] = data
          .filter((f) => f.name !== '.emptyFolderPlaceholder')
          .map((f) => ({
            id: f.id,
            name: f.name,
            url: supabase.storage.from(BUCKET_NAME).getPublicUrl(`uploads/${f.name}`).data.publicUrl,
            size: f.metadata?.size || 0,
            created_at: f.created_at || '',
            altText: '',
          }));
        setFiles(mediaFiles);
      }
    } catch (e) {
      console.error('Failed to load media:', e);
      setFiles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, and GIF files are allowed');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          toast.error('Media storage is not yet configured. Please create a "media" bucket in Supabase.');
        } else {
          toast.error('Upload failed: ' + uploadError.message);
        }
      } else {
        toast.success('Image uploaded');
        loadFiles();
      }
    } catch (e) {
      toast.error('Upload failed');
      console.error(e);
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.name}"?`)) return;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`uploads/${file.name}`]);
    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Image deleted');
      setFiles((prev) => prev.filter((f) => f.name !== file.name));
      setSelected(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground font-sans text-sm mt-1">
            Upload and manage article images
          </p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-sans font-semibold rounded-sm hover:bg-foreground/90 transition-colors cursor-pointer">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Upload Image
          <input type="file" accept={ACCEPTED_TYPES.join(',')} onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename…"
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-sm">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-sans">No images yet. Upload your first image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((file) => (
            <div
              key={file.id || file.name}
              className="group relative bg-card border border-border rounded-sm overflow-hidden cursor-pointer"
              onClick={() => setSelected(file)}
            >
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.altText || file.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-sans text-foreground truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyUrl(file.url); }}
                    className="p-1.5 text-muted-foreground hover:text-gold transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSelected(null)} />
          <div className="relative bg-card border border-border rounded-sm p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.url} alt={selected.altText || selected.name} className="w-full rounded-sm mb-4" />
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-1">
                  Filename
                </label>
                <p className="text-sm font-sans">{selected.name}</p>
              </div>
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-muted-foreground mb-1">
                  URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selected.url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-sm text-xs font-sans"
                  />
                  <button
                    onClick={() => handleCopyUrl(selected.url)}
                    className="p-2 border border-border rounded-sm hover:bg-muted"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleDelete(selected)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-sans text-destructive rounded-sm hover:bg-destructive/5"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
