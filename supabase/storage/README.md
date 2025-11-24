# Supabase Storage Configuration

This directory contains SQL scripts to configure Supabase Storage buckets and their security policies.

## Storage Buckets

### 1. tree-images (Public)
- **Purpose**: Store tree monitoring photos uploaded by users
- **Public Access**: Yes (anyone can view)
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Folder Structure**: `{user_id}/{tree_id}/{image_id}.jpg`

### 2. documents (Private)
- **Purpose**: Store certificates, receipts, and reports
- **Public Access**: No (user-specific access)
- **File Size Limit**: 20MB
- **Allowed Types**: PDF, JPEG, JPG, PNG
- **Folder Structure**: `{user_id}/{document_type}/{document_id}.pdf`

### 3. avatars (Public)
- **Purpose**: Store user profile pictures
- **Public Access**: Yes (anyone can view)
- **File Size Limit**: 2MB
- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Folder Structure**: `{user_id}/avatar.jpg`

### 4. nft-badges (Public)
- **Purpose**: Store NFT badge artwork and metadata
- **Public Access**: Yes (anyone can view)
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, SVG, WebP
- **Folder Structure**: `{badge_type}/{tier}/{badge_id}.png`

## How to Set Up Storage Buckets

### Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket** for each bucket
4. Configure bucket settings:
   - Name: Use the bucket names from above
   - Public: Set according to the specifications
   - File size limit: Set the limits as specified
   - Allowed MIME types: Configure in bucket settings

5. After creating buckets, go to **Policies** tab
6. Copy and paste the policy SQL from `buckets.sql`
7. Execute the policies for each bucket

### Option 2: Using SQL Editor

1. Navigate to **SQL Editor** in Supabase dashboard
2. Copy the entire content of `buckets.sql`
3. Execute the script
4. Verify buckets are created in the Storage section

### Option 3: Using Supabase CLI

```bash
# Ensure you're linked to your project
supabase link --project-ref wobpryllvdjaapzjbsxx

# Run the storage configuration
supabase db push
```

## Storage Policies Summary

### tree-images Bucket
- ✅ Anyone can view (public)
- ✅ Authenticated users can upload
- ✅ Users can update/delete their own images

### documents Bucket
- ✅ Users can view their own documents
- ✅ Authenticated users can upload
- ✅ Users can update/delete their own documents

### avatars Bucket
- ✅ Anyone can view (public)
- ✅ Users can upload/update/delete their own avatar

### nft-badges Bucket
- ✅ Anyone can view (public)
- ✅ Only admins can upload/update badges

## File Upload Examples

### Upload Tree Image (Frontend)

```typescript
import { supabase } from './services/supabase';

async function uploadTreeImage(userId: string, treeId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${treeId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('tree-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('tree-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

### Upload Avatar

```typescript
async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true // Replace existing avatar
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

### Download Private Document

```typescript
async function downloadDocument(userId: string, documentPath: string) {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(documentPath);
  
  if (error) throw error;
  
  // Create download link
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = documentPath.split('/').pop() || 'document.pdf';
  a.click();
}
```

## Security Best Practices

1. **File Validation**: Always validate file types and sizes on the client side before upload
2. **Virus Scanning**: Consider integrating virus scanning for user uploads
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **File Naming**: Use UUIDs or timestamps to prevent filename collisions
5. **Cleanup**: Implement cleanup jobs to remove orphaned files
6. **Monitoring**: Monitor storage usage and set up alerts

## Storage Limits

- **Free Tier**: 1GB storage
- **Pro Tier**: 100GB storage
- **Enterprise**: Custom limits

Monitor your storage usage in the Supabase dashboard under **Settings > Usage**.

## Troubleshooting

### Error: "Bucket already exists"
- The bucket was already created. Skip bucket creation and just apply policies.

### Error: "Policy already exists"
- Drop existing policies before recreating:
  ```sql
  DROP POLICY IF EXISTS "policy_name" ON storage.objects;
  ```

### Error: "File size exceeds limit"
- Check the file size limit in bucket configuration
- Compress images before upload
- Split large files if necessary

### Error: "MIME type not allowed"
- Verify the file type is in the allowed MIME types list
- Update bucket configuration to allow additional types if needed

## Maintenance

### Clean up orphaned files
```sql
-- Find files not referenced in tree_images table
SELECT name FROM storage.objects 
WHERE bucket_id = 'tree-images'
AND name NOT IN (
  SELECT image_url FROM tree_images
);
```

### Monitor storage usage
```sql
-- Get storage usage by bucket
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_size_bytes,
  pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
FROM storage.objects
GROUP BY bucket_id;
```
