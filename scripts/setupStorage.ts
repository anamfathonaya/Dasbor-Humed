import { getServiceSupabase, isSupabaseConfigured } from '../src/lib/supabase';

/**
 * Skrip otomatisasi persiapan bucket Storage 'avatars' dan konfigurasi kebijakan RLS
 */
async function setupStorageBucket() {
  console.log('--- Mempersiapkan Supabase Storage Bucket: avatars ---');

  if (!isSupabaseConfigured) {
    console.log('[INFO] Supabase belum dikonfigurasi aktif di environment. Menyiapkan skrip deklarasi SQL dan mode lokal.');
    console.log('Lihat file migrasi: supabase/migrations/005_storage_avatars_bucket.sql');
    return;
  }

  const client = getServiceSupabase();

  try {
    // 1. Cek daftar bucket
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    if (listError) {
      console.warn('[WARN] Gagal membaca list bucket:', listError.message);
    }

    const existingBucket = buckets?.find((b) => b.id === 'avatars');

    if (existingBucket) {
      console.log('✓ Bucket "avatars" sudah tersedia (Public: ' + existingBucket.public + ')');
    } else {
      console.log('Membuat bucket "avatars"...');
      const { data, error: createError } = await client.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });

      if (createError) {
        console.error('[ERROR] Gagal membuat bucket avatars:', createError.message);
      } else {
        console.log('✓ Berhasil membuat bucket "avatars":', data);
      }
    }
  } catch (err: any) {
    console.error('[ERROR] Terjadi kegagalan:', err.message);
  }
}

setupStorageBucket().catch(console.error);
