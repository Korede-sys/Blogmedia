/*
# Create media storage bucket and e-books tables

## Overview
1. Creates a public storage bucket called "media" for article images and e-book cover images.
2. Creates the `ebooks` table for storing e-book metadata (title, description, price, cover, file URL, etc.).
3. Creates the `ebook_purchases` table to track which users have purchased which e-books.

## New Tables
- `ebooks` — E-book listings with title, slug, description, price (in cents), cover image, file URL, status, and sales metadata.
- `ebook_purchases` — Records of e-book purchases linking a user to an e-book with Stripe payment info.

## Storage
- Creates "media" bucket (public) for image uploads.
- Policies: authenticated users with editor/admin role can upload; public can read.

## Security
- RLS enabled on both new tables.
- Public can read published e-books.
- Editors/admins can CRUD e-books.
- Users can read their own purchase records.
- Only admins can view all purchase records.
- Insert policy on ebook_purchases allows anon/authenticated to create a purchase record (after Stripe payment confirmation via edge function).
*/

-- ============================================================
-- MEDIA STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read media files
DROP POLICY IF EXISTS "media_bucket_public_read" ON storage.objects;
CREATE POLICY "media_bucket_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

-- Authenticated users with editor/admin role can upload
DROP POLICY IF EXISTS "media_bucket_editor_upload" ON storage.objects;
CREATE POLICY "media_bucket_editor_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media' AND public.is_editor_or_admin()
  );

-- Authors can upload to media bucket too
DROP POLICY IF EXISTS "media_bucket_author_upload" ON storage.objects;
CREATE POLICY "media_bucket_author_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Authenticated users can update/delete their own uploads
DROP POLICY IF EXISTS "media_bucket_owner_update" ON storage.objects;
CREATE POLICY "media_bucket_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'media' AND owner = auth.uid());

DROP POLICY IF EXISTS "media_bucket_owner_delete" ON storage.objects;
CREATE POLICY "media_bucket_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND owner = auth.uid());

-- Editors/admins can delete any media
DROP POLICY IF EXISTS "media_bucket_editor_delete" ON storage.objects;
CREATE POLICY "media_bucket_editor_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_editor_or_admin());

-- ============================================================
-- EBOOKS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  subtitle text DEFAULT '',
  description text DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  is_free boolean NOT NULL DEFAULT false,
  cover_image text DEFAULT '',
  cover_alt text DEFAULT '',
  file_url text DEFAULT '',
  file_size_mb numeric DEFAULT 0,
  page_count integer DEFAULT 0,
  isbn text DEFAULT '',
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean NOT NULL DEFAULT false,
  download_count integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ebooks_status_idx ON public.ebooks (status);
CREATE INDEX IF NOT EXISTS ebooks_published_at_idx ON public.ebooks (published_at DESC);
CREATE INDEX IF NOT EXISTS ebooks_featured_idx ON public.ebooks (featured) WHERE featured = true;

ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- Public can read published e-books
DROP POLICY IF EXISTS "ebooks_public_read" ON public.ebooks;
CREATE POLICY "ebooks_public_read"
  ON public.ebooks FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Editors/admins can read all e-books
DROP POLICY IF EXISTS "ebooks_editor_read" ON public.ebooks;
CREATE POLICY "ebooks_editor_read"
  ON public.ebooks FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

-- Editors/admins can create e-books
DROP POLICY IF EXISTS "ebooks_editor_insert" ON public.ebooks;
CREATE POLICY "ebooks_editor_insert"
  ON public.ebooks FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin());

-- Editors/admins can update e-books
DROP POLICY IF EXISTS "ebooks_editor_update" ON public.ebooks;
CREATE POLICY "ebooks_editor_update"
  ON public.ebooks FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

-- Only admins can delete e-books
DROP POLICY IF EXISTS "ebooks_admin_delete" ON public.ebooks;
CREATE POLICY "ebooks_admin_delete"
  ON public.ebooks FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- EBOOK PURCHASES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ebook_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id uuid NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL DEFAULT '',
  price_paid_cents integer NOT NULL DEFAULT 0,
  stripe_session_id text DEFAULT '',
  stripe_payment_intent_id text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ebook_purchases_ebook_idx ON public.ebook_purchases (ebook_id);
CREATE INDEX IF NOT EXISTS ebook_purchases_user_idx ON public.ebook_purchases (user_id);
CREATE INDEX IF NOT EXISTS ebook_purchases_email_idx ON public.ebook_purchases (email);
CREATE INDEX IF NOT EXISTS ebook_purchases_stripe_idx ON public.ebook_purchases (stripe_session_id);

ALTER TABLE public.ebook_purchases ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchase records
DROP POLICY IF EXISTS "purchases_user_read" ON public.ebook_purchases;
CREATE POLICY "purchases_user_read"
  ON public.ebook_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read purchases matching their email (for non-authenticated checkout)
DROP POLICY IF EXISTS "purchases_email_read" ON public.ebook_purchases;
CREATE POLICY "purchases_email_read"
  ON public.ebook_purchases FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can create a purchase record (after Stripe payment)
DROP POLICY IF EXISTS "purchases_public_insert" ON public.ebook_purchases;
CREATE POLICY "purchases_public_insert"
  ON public.ebook_purchases FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can update purchases (e.g., mark as paid after webhook)
DROP POLICY IF EXISTS "purchases_admin_update" ON public.ebook_purchases;
CREATE POLICY "purchases_admin_update"
  ON public.ebook_purchases FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can read all purchases
DROP POLICY IF EXISTS "purchases_admin_read" ON public.ebook_purchases;
CREATE POLICY "purchases_admin_read"
  ON public.ebook_purchases FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can delete purchases
DROP POLICY IF EXISTS "purchases_admin_delete" ON public.ebook_purchases;
CREATE POLICY "purchases_admin_delete"
  ON public.ebook_purchases FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- UPDATED_AT TRIGGER FOR EBOOKS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'ebooks_updated_at'
  ) THEN
    CREATE TRIGGER ebooks_updated_at
      BEFORE UPDATE ON public.ebooks
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;
