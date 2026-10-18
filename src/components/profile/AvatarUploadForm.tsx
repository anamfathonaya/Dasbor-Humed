'use client';

import React, { useState } from 'react';

export interface AvatarUploadFormProps {
  currentAvatarUrl?: string;
  onUploadSuccess?: (newUrl: string) => void;
}

export function AvatarUploadForm({ currentAvatarUrl, onUploadSuccess }: AvatarUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validasi jenis file (JPG, PNG, WebP)
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      setErrorMsg('Format berkas harus JPG, PNG, atau WebP.');
      return;
    }

    // 2. Validasi ukuran berkas (Maks 2 MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(`Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas 2 MB.`);
      return;
    }

    // 3. Baca Data URL untuk pratinjau klien
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      setErrorMsg('Silakan pilih berkas foto terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarBase64: preview })
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.message || 'Gagal mengunggah foto profil.');
      }

      setSuccessMsg('Foto profil berhasil diperbarui.');
      if (onUploadSuccess && res.avatar_url) {
        onUploadSuccess(res.avatar_url);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengunggah foto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dasbor__card" style={{ padding: '1.25rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>
        Perbarui Foto Profil
      </h3>

      {errorMsg && (
        <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #cbd5e1'
            }}
          >
            {preview ? (
              <img src={preview} alt="Pratinjau Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '1.2rem', color: '#64748b' }}>Foto</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
              Pilih Berkas Foto Baru
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ fontSize: '0.82rem' }}
            />
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted, #64748b)', marginTop: '4px' }}>
              Maksimal 2 MB (JPG, PNG, WebP).
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="dasbor__btn dasbor__btn--primary"
          disabled={loading || !preview}
        >
          {loading ? 'Menyimpan...' : 'Simpan Foto Profil'}
        </button>
      </form>
    </div>
  );
}
