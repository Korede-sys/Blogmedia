'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Upload, Loader2, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

const BUCKET_NAME = 'media';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'application/epub+zip'];

export function PdfUpload({
  value,
  onChange,
  placeholder = 'https://… (link to PDF/EPUB file)',
  className,
}: PdfUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Only PDF and EPUB files are allowed');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `ebooks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { upsert: false });

      if (uploadError) {
        toast.error('Upload failed: ' + uploadError.message);
      } else {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
        onChange(urlData.publicUrl);
        toast.success('File uploaded');
      }
    } catch {
      toast.error('Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
        />
        <label className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-secondary text-foreground text-xs font-sans font-medium rounded-sm hover:bg-secondary/80 transition-colors cursor-pointer whitespace-nowrap">
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          Upload
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2.5 text-muted-foreground hover:text-destructive transition-colors"
            title="Clear file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {value && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
          <FileText className="w-3.5 h-3.5" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:text-gold underline"
          >
            {value}
          </a>
        </div>
      )}
    </div>
  );
}
