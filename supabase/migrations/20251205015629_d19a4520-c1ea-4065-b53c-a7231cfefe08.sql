-- Create storage bucket for wallet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wallet-images', 'wallet-images', true);

-- Create policy for public read access
CREATE POLICY "Public read access for wallet images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'wallet-images');

-- Create policy for authenticated users to upload (admin only would need additional logic)
CREATE POLICY "Authenticated users can upload wallet images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'wallet-images' AND auth.role() = 'authenticated');