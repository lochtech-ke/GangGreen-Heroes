-- ============================================================================
-- Supabase Storage Buckets Configuration
-- ============================================================================
-- This file creates storage buckets and configures their security policies
-- ============================================================================

-- Create tree-images bucket for tree monitoring photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tree-images',
  'tree-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create documents bucket for certificates and reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
);

-- Create avatars bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create nft-badges bucket for NFT badge images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nft-badges',
  'nft-badges',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
);

-- ============================================================================
-- Storage Policies for tree-images bucket
-- ============================================================================

-- Anyone can view tree images (public bucket)
CREATE POLICY "Anyone can view tree images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tree-images');

-- Authenticated users can upload tree images
CREATE POLICY "Authenticated users can upload tree images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tree-images' AND
    auth.role() = 'authenticated'
  );

-- Users can update their own uploaded images
CREATE POLICY "Users can update own tree images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tree-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own uploaded images
CREATE POLICY "Users can delete own tree images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tree-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- Storage Policies for documents bucket
-- ============================================================================

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can upload documents
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- Storage Policies for avatars bucket
-- ============================================================================

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- Storage Policies for nft-badges bucket
-- ============================================================================

-- Anyone can view NFT badge images (public bucket)
CREATE POLICY "Anyone can view nft badges"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'nft-badges');

-- Only admins can upload NFT badge images
CREATE POLICY "Admins can upload nft badges"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'nft-badges' AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Only admins can update NFT badge images
CREATE POLICY "Admins can update nft badges"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'nft-badges' AND
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- Storage Configuration Complete
-- ============================================================================
-- All storage buckets and policies have been configured
-- File size limits and MIME types are enforced
-- ============================================================================
