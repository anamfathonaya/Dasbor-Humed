-- Migrasi 005: Inisialisasi Storage Bucket 'avatars' dan Kebijakan Akses (RLS)
-- Supabase Storage bucket configuration

-- 1. Buat bucket 'avatars' publik jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- batas 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Kebijakan RLS untuk bucket 'avatars'
-- A. Akses Baca Publik (Semua orang / staf dapat melihat foto avatar pengguna)
CREATE POLICY "Public Read Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- B. Pengunggahan Foto Avatar (Pengguna terautentikasi dapat mengunggah file miliknya)
CREATE POLICY "Authenticated Users Upload Avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'user-avatars'
);

-- C. Pembaruan Foto Avatar (Pengguna dapat memperbarui avatarnya)
CREATE POLICY "Authenticated Users Update Avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'user-avatars'
);

-- D. Penghapusan Foto Avatar
CREATE POLICY "Authenticated Users Delete Avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'user-avatars'
);
