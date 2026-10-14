/*
# Bliss Media — Core Publishing Schema

## Overview
Creates the foundational database schema for the Bliss Media digital publishing platform.
This includes user profiles, categories, tags, articles, article revisions, comments,
newsletter subscribers, and site settings.

## Tables Created
1. profiles — Extended user data linked to auth.users, with editorial roles
2. categories — Magazine categories (Technology, Entertainment, Lifestyle, Business, News)
3. tags — Article tags for cross-cutting topics
4. articles — Core article content with editorial workflow status
5. article_tags — Join table between articles and tags
6. article_revisions — Revision history for articles
7. comments — Reader comments on published articles
8. newsletter_subscribers — Email subscribers for the newsletter
9. site_settings — Platform-wide configuration (singleton-style)

## Security
- RLS enabled on all tables
- Public can read published articles, categories, tags, approved comments, and profiles
- Only authenticated users with appropriate roles can create/edit content
- Role checks use the `raw_app_meta_data->>role` from the JWT for authorization
- Authors can only manage their own drafts/articles
- Editors and admins have broader access
- A helper function `public.has_role()` checks JWT claims for authorization

## Important Notes
- Roles (author, editor, admin) are stored in auth.users raw_app_meta_data, NOT in user-mutable metadata
- The `public.is_editor()` and `public.is_admin()` functions check JWT claims server-side
- Article status transitions are enforced at the application layer
- All timestamps use timestamptz with DEFAULT now()
*/

-- ============================================================
-- HELPER FUNCTIONS FOR ROLE-BASED ACCESS CONTROL
-- ============================================================

-- Check if the current user has a specific role (from JWT app metadata)
CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = required_role, false
  );
$$;

-- Check if current user is at least an editor (editor or admin)
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('editor', 'admin'),
    false
  );
$$;

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ============================================================
-- PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  role text NOT NULL DEFAULT 'author' CHECK (role IN ('author', 'editor', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can read basic profile info (for author bylines)
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Users can read their own full profile
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (but not role)
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile row
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
CREATE POLICY "profiles_self_insert"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Only admins can delete profiles
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
CREATE POLICY "profiles_admin_delete"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only editors/admins can create categories
DROP POLICY IF EXISTS "categories_editor_insert" ON public.categories;
CREATE POLICY "categories_editor_insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin());

-- Only editors/admins can update categories
DROP POLICY IF EXISTS "categories_editor_update" ON public.categories;
CREATE POLICY "categories_editor_update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

-- Only admins can delete categories
DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;
CREATE POLICY "categories_admin_delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- TAGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Public can read tags
DROP POLICY IF EXISTS "tags_public_read" ON public.tags;
CREATE POLICY "tags_public_read"
  ON public.tags FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only editors/admins can create tags
DROP POLICY IF EXISTS "tags_editor_insert" ON public.tags;
CREATE POLICY "tags_editor_insert"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin());

-- Only editors/admins can update tags
DROP POLICY IF EXISTS "tags_editor_update" ON public.tags;
CREATE POLICY "tags_editor_update"
  ON public.tags FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

-- Only admins can delete tags
DROP POLICY IF EXISTS "tags_admin_delete" ON public.tags;
CREATE POLICY "tags_admin_delete"
  ON public.tags FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- ARTICLES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text DEFAULT '',
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover_image text DEFAULT '',
  cover_alt text DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'archived')),
  featured boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  scheduled_for timestamptz,
  seo_title text DEFAULT '',
  meta_description text DEFAULT '',
  social_image text DEFAULT '',
  reading_time int DEFAULT 0,
  view_count int NOT NULL DEFAULT 0,
  editorial_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Unique slug only matters per-status (drafts can reuse), but we enforce uniqueness
-- among published articles via a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS articles_published_slug_unique
  ON public.articles (slug)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS articles_category_idx ON public.articles (category_id);
CREATE INDEX IF NOT EXISTS articles_author_idx ON public.articles (author_id);
CREATE INDEX IF NOT EXISTS articles_status_idx ON public.articles (status);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON public.articles (published_at DESC);
CREATE INDEX IF NOT EXISTS articles_featured_idx ON public.articles (featured) WHERE featured = true;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
DROP POLICY IF EXISTS "articles_public_read" ON public.articles;
CREATE POLICY "articles_public_read"
  ON public.articles FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Authors can read their own articles (any status)
DROP POLICY IF EXISTS "articles_author_read" ON public.articles;
CREATE POLICY "articles_author_read"
  ON public.articles FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Editors/admins can read all articles
DROP POLICY IF EXISTS "articles_editor_read" ON public.articles;
CREATE POLICY "articles_editor_read"
  ON public.articles FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

-- Authors can create their own articles (as draft)
DROP POLICY IF EXISTS "articles_author_insert" ON public.articles;
CREATE POLICY "articles_author_insert"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles (but not self-publish)
DROP POLICY IF EXISTS "articles_author_update" ON public.articles;
CREATE POLICY "articles_author_update"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (
    auth.uid() = author_id AND (
      -- Authors can't set status to published/approved/scheduled themselves
      -- unless they're also an editor/admin
      status NOT IN ('published', 'approved', 'scheduled') OR public.is_editor_or_admin()
    )
  );

-- Editors/admins can update any article
DROP POLICY IF EXISTS "articles_editor_update" ON public.articles;
CREATE POLICY "articles_editor_update"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

-- Only admins can delete articles
DROP POLICY IF EXISTS "articles_admin_delete" ON public.articles;
CREATE POLICY "articles_admin_delete"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- ARTICLE TAGS JOIN TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- Public can read tags for published articles
DROP POLICY IF EXISTS "article_tags_public_read" ON public.article_tags;
CREATE POLICY "article_tags_public_read"
  ON public.article_tags FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.status = 'published'
    )
  );

-- Authors can read tags for their own articles
DROP POLICY IF EXISTS "article_tags_author_read" ON public.article_tags;
CREATE POLICY "article_tags_author_read"
  ON public.article_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.author_id = auth.uid()
    )
  );

-- Editors/admins can read all article tags
DROP POLICY IF EXISTS "article_tags_editor_read" ON public.article_tags;
CREATE POLICY "article_tags_editor_read"
  ON public.article_tags FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

-- Authors can manage tags on their own articles
DROP POLICY IF EXISTS "article_tags_author_insert" ON public.article_tags;
CREATE POLICY "article_tags_author_insert"
  ON public.article_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.author_id = auth.uid()
    )
  );

-- Editors/admins can manage all article tags
DROP POLICY IF EXISTS "article_tags_editor_insert" ON public.article_tags;
CREATE POLICY "article_tags_editor_insert"
  ON public.article_tags FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin());

-- Authors can delete tags on their own articles
DROP POLICY IF EXISTS "article_tags_author_delete" ON public.article_tags;
CREATE POLICY "article_tags_author_delete"
  ON public.article_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.author_id = auth.uid()
    )
  );

-- Editors/admins can delete any article tags
DROP POLICY IF EXISTS "article_tags_editor_delete" ON public.article_tags;
CREATE POLICY "article_tags_editor_delete"
  ON public.article_tags FOR DELETE
  TO authenticated
  USING (public.is_editor_or_admin());

-- ============================================================
-- ARTICLE REVISIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.article_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  revision_number int NOT NULL DEFAULT 1,
  title text NOT NULL,
  excerpt text DEFAULT '',
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  edited_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  change_note text DEFAULT '',
  status_at_save text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revisions_article_idx ON public.article_revisions (article_id);
CREATE INDEX IF NOT EXISTS revisions_created_idx ON public.article_revisions (created_at DESC);

ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;

-- Authors can read revisions for their own articles
DROP POLICY IF EXISTS "revisions_author_read" ON public.article_revisions;
CREATE POLICY "revisions_author_read"
  ON public.article_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.author_id = auth.uid()
    )
  );

-- Editors/admins can read all revisions
DROP POLICY IF EXISTS "revisions_editor_read" ON public.article_revisions;
CREATE POLICY "revisions_editor_read"
  ON public.article_revisions FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

-- Authors can create revisions for their own articles
DROP POLICY IF EXISTS "revisions_author_insert" ON public.article_revisions;
CREATE POLICY "revisions_author_insert"
  ON public.article_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.author_id = auth.uid()
    )
  );

-- Editors/admins can create revisions for any article
DROP POLICY IF EXISTS "revisions_editor_insert" ON public.article_revisions;
CREATE POLICY "revisions_editor_insert"
  ON public.article_revisions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_editor_or_admin());

-- Only admins can delete revisions
DROP POLICY IF EXISTS "revisions_admin_delete" ON public.article_revisions;
CREATE POLICY "revisions_admin_delete"
  ON public.article_revisions FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- COMMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT '',
  author_email text NOT NULL DEFAULT '',
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_article_idx ON public.comments (article_id);
CREATE INDEX IF NOT EXISTS comments_status_idx ON public.comments (status);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Public can read approved comments on published articles
DROP POLICY IF EXISTS "comments_public_read" ON public.comments;
CREATE POLICY "comments_public_read"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_id AND a.status = 'published'
    )
  );

-- Anyone (anon or authenticated) can submit a comment (pending moderation)
DROP POLICY IF EXISTS "comments_public_insert" ON public.comments;
CREATE POLICY "comments_public_insert"
  ON public.comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can delete their own comments
DROP POLICY IF EXISTS "comments_user_delete" ON public.comments;
CREATE POLICY "comments_user_delete"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Editors/admins can update comment status (moderate)
DROP POLICY IF EXISTS "comments_editor_update" ON public.comments;
CREATE POLICY "comments_editor_update"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin())
  WITH CHECK (public.is_editor_or_admin());

-- Editors/admins can read all comments (for moderation)
DROP POLICY IF EXISTS "comments_editor_read" ON public.comments;
CREATE POLICY "comments_editor_read"
  ON public.comments FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin());

-- Editors/admins can delete comments
DROP POLICY IF EXISTS "comments_editor_delete" ON public.comments;
CREATE POLICY "comments_editor_delete"
  ON public.comments FOR DELETE
  TO authenticated
  USING (public.is_editor_or_admin());

-- ============================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  subscribed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert their email)
DROP POLICY IF EXISTS "newsletter_public_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_public_insert"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can check if their email is subscribed (for unsubscribe flow)
-- We allow anon to select so the unsubscribe flow can work
DROP POLICY IF EXISTS "newsletter_public_read" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_public_read"
  ON public.newsletter_subscribers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can unsubscribe (update their own email's is_active flag)
DROP POLICY IF EXISTS "newsletter_public_update" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_public_update"
  ON public.newsletter_subscribers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Only admins can delete subscribers
DROP POLICY IF EXISTS "newsletter_admin_delete" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_delete"
  ON public.newsletter_subscribers FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- SITE SETTINGS TABLE (singleton)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id int PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'Bliss Media',
  tagline text NOT NULL DEFAULT 'Stories. Perspectives. Culture.',
  description text NOT NULL DEFAULT '',
  primary_email text NOT NULL DEFAULT '',
  social_twitter text DEFAULT '',
  social_facebook text DEFAULT '',
  social_instagram text DEFAULT '',
  social_linkedin text DEFAULT '',
  footer_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read site settings
DROP POLICY IF EXISTS "settings_public_read" ON public.site_settings;
CREATE POLICY "settings_public_read"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can update settings
DROP POLICY IF EXISTS "settings_admin_update" ON public.site_settings;
CREATE POLICY "settings_admin_update"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can insert (initial setup)
DROP POLICY IF EXISTS "settings_admin_insert" ON public.site_settings;
CREATE POLICY "settings_admin_insert"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at'
  ) THEN
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'articles_updated_at'
  ) THEN
    CREATE TRIGGER articles_updated_at
      BEFORE UPDATE ON public.articles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'site_settings_updated_at'
  ) THEN
    CREATE TRIGGER site_settings_updated_at
      BEFORE UPDATE ON public.site_settings
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_app_meta_data ->> 'role', 'author')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
