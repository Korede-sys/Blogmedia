export type ArticleStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export type UserRole = 'author' | 'editor' | 'admin';

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: ArticleBlock[];
  cover_image: string;
  cover_alt: string;
  category_id: string | null;
  author_id: string;
  status: ArticleStatus;
  featured: boolean;
  is_pinned: boolean;
  published_at: string | null;
  scheduled_for: string | null;
  seo_title: string;
  meta_description: string;
  social_image: string;
  reading_time: number;
  view_count: number;
  editorial_notes: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  category?: Category | null;
  author?: Profile | null;
  tags?: Tag[];
}

export interface ArticleRevision {
  id: string;
  article_id: string;
  revision_number: number;
  title: string;
  excerpt: string;
  body: ArticleBlock[];
  edited_by: string;
  change_note: string;
  status_at_save: ArticleStatus;
  created_at: string;
  editor?: Profile | null;
}

export interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  user_id: string | null;
  body: string;
  status: CommentStatus;
  parent_id: string | null;
  created_at: string;
  replies?: Comment[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  tagline: string;
  description: string;
  primary_email: string;
  social_twitter: string;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  footer_text: string;
  created_at: string;
  updated_at: string;
}

// TipTap-style JSON document blocks
export type ArticleBlock =
  | { type: 'heading'; attrs: { level: number }; content?: ArticleInline[] }
  | { type: 'paragraph'; content?: ArticleInline[] }
  | { type: 'bulletList'; content: { type: 'listItem'; content: { type: 'paragraph'; content?: ArticleInline[] }[] }[] }
  | { type: 'orderedList'; content: { type: 'listItem'; content: { type: 'paragraph'; content?: ArticleInline[] }[] }[] }
  | { type: 'blockquote'; content?: ArticleBlock[] }
  | { type: 'image'; attrs: { src: string; alt?: string; caption?: string } }
  | { type: 'horizontalRule' };

export type ArticleInline = {
  type: 'text';
  text: string;
  marks?: { type: 'bold' | 'italic' | 'link'; attrs?: { href: string } }[];
};
