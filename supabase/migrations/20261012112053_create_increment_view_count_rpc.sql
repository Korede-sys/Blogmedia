/*
# Create increment_view_count RPC function

## Overview
Adds a SECURITY DEFINER function to atomically increment the view_count column
on an article. This allows anon users to increment views without needing
UPDATE permissions on the articles table (which would be a security risk).

## Security
- SECURITY DEFINER: runs with the function owner's privileges
- Only increments view_count, no other columns
- Safe for public (anon) use
*/

CREATE OR REPLACE FUNCTION public.increment_view_count(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.articles
  SET view_count = view_count + 1
  WHERE id = article_id AND status = 'published';
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated;
