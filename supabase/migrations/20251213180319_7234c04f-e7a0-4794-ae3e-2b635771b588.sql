-- Add image columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_url_2 TEXT;