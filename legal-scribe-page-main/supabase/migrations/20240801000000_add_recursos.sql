-- ============================================================
-- Migration: add_recursos
-- Adds the recursos table for the digital library / shop
-- Run this in your Supabase SQL editor or via supabase db push
-- ============================================================

-- Enum for resource types
DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM (
    'libro',
    'pdf',
    'minuta',
    'demanda',
    'guia',
    'otro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Main resources table
CREATE TABLE IF NOT EXISTS public.recursos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  slug             text NOT NULL UNIQUE CHECK (char_length(slug) > 0),
  description      text CHECK (char_length(description) <= 1000),
  cover_image_url  text CHECK (char_length(cover_image_url) <= 1000),
  file_url         text CHECK (char_length(file_url) <= 1000),
  resource_type    resource_type NOT NULL DEFAULT 'pdf',
  price            numeric(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  currency         char(3) NOT NULL DEFAULT 'PEN',
  payment_url      text CHECK (char_length(payment_url) <= 1000),
  is_free          boolean NOT NULL DEFAULT false,
  published        boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recursos_updated_at ON public.recursos;
CREATE TRIGGER recursos_updated_at
  BEFORE UPDATE ON public.recursos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;

-- Public can read published resources
CREATE POLICY "recursos_public_select"
  ON public.recursos FOR SELECT
  USING (published = true);

-- Admin (owner) can read all their own resources
CREATE POLICY "recursos_owner_select"
  ON public.recursos FOR SELECT
  USING (auth.uid() = author_id);

-- Admin can insert their own resources
CREATE POLICY "recursos_owner_insert"
  ON public.recursos FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Admin can update their own resources
CREATE POLICY "recursos_owner_update"
  ON public.recursos FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Admin can delete their own resources
CREATE POLICY "recursos_owner_delete"
  ON public.recursos FOR DELETE
  USING (auth.uid() = author_id);

-- Index for fast public listing
CREATE INDEX IF NOT EXISTS recursos_published_idx
  ON public.recursos (published, created_at DESC);
