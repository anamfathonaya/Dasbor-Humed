import { supabase, getServiceSupabase, isSupabaseConfigured } from './supabase';

export interface UploadAvatarResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Klien Storage khusus pengelolaan avatar pengguna di Supabase Storage
 */
export const avatarStorageClient = {
  /**
   * Unggah berkas avatar ke bucket 'avatars'
   * @param file Berkas gambar (File atau Blob atau Buffer)
   * @param userId ID atau email pengguna untuk penamaan berkas
   * @param extension Ekstensi file (jpg, png, webp)
   */
  async uploadAvatar(
    file: File | Blob | ArrayBuffer | Uint8Array,
    userId: string | number,
    extension = 'webp',
    useAdmin = false
  ): Promise<UploadAvatarResult> {
    if (!isSupabaseConfigured) {
      // Fallback lokal / dummy untuk development offline
      return {
        success: true,
        url: `/images/avatar-dummy.png`,
        path: `user-avatars/user-${userId}.${extension}`,
      };
    }

    try {
      const client = useAdmin ? getServiceSupabase() : supabase;
      const fileName = `user-avatars/user-${userId}-${Date.now()}.${extension}`;

      const { data, error } = await client.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
          upsert: true,
        });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Dapatkan URL publik
      const { data: publicUrlData } = client.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return {
        success: true,
        url: publicUrlData.publicUrl,
        path: data.path,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Gagal mengunggah berkas avatar',
      };
    }
  },

  /**
   * Hapus berkas avatar dari bucket
   */
  async removeAvatar(path: string, useAdmin = false): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const client = useAdmin ? getServiceSupabase() : supabase;
      const { error } = await client.storage.from('avatars').remove([path]);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal menghapus avatar' };
    }
  },

  /**
   * Dapatkan URL publik avatar
   */
  getPublicUrl(path: string): string {
    if (!isSupabaseConfigured || !path) {
      return path || '/images/avatar-default.png';
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Buat tautan aman bertanda tangan (Signed URL) dengan pembatasan peran
   * Hanya pengguna terautentikasi (head, admin, staff) yang berhak meminta signed URL
   */
  async getSignedAvatarUrlForRole(
    path: string,
    userRole: string,
    expiresInSeconds = 3600
  ): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
    const validRoles = ['head', 'admin', 'staff'];
    if (!validRoles.includes(userRole)) {
      return {
        success: false,
        error: 'Peran tidak memiliki izin mengakses tautan foto profil terproteksi.',
      };
    }

    if (!isSupabaseConfigured || !path) {
      return {
        success: true,
        signedUrl: path || '/images/avatar-default.png',
      };
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return {
        success: true,
        signedUrl: path,
      };
    }

    try {
      const client = getServiceSupabase();
      const cleanPath = path.startsWith('avatars/') ? path.replace('avatars/', '') : path;
      const { data, error } = await client.storage
        .from('avatars')
        .createSignedUrl(cleanPath, expiresInSeconds);

      if (error || !data) {
        return {
          success: false,
          error: error?.message || 'Gagal membuat signed URL foto',
        };
      }

      return {
        success: true,
        signedUrl: data.signedUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
      };
    }
  },
};
