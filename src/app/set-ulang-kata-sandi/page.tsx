'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SetUlangKataSandiPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('Email staf wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/set-ulang-kata-sandi?mode=reset`
        });
        if (error) throw new Error(error.message);
      } else {
        // Simulasi pengiriman tautan reset ke email staf
        await new Promise((r) => setTimeout(r, 600));
      }

      setSuccessMsg(
        `Tautan aktivasi & set ulang kata sandi telah dikirim ke ${email}. Silakan periksa kotak masuk atau spam email Anda.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim tautan set ulang kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!password || !confirmPassword) {
      setErrorMsg('Kata sandi baru dan konfirmasi wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter demi keamanan akun.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(error.message);
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }

      setSuccessMsg('Kata sandi baru berhasil disimpan! Silakan masuk ke akun Anda.');
      setTimeout(() => {
        window.location.href = '/masuk';
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui kata sandi baru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-page-content="set-ulang-kata-sandi" style={{ display: 'contents' }}>
      <main className="masuk" data-node-id="reset.root" data-theme="light">
        {/* Kolom Kiri: Informasi Lembaga */}
        <section className="masuk__intro" aria-labelledby="reset-statement">
          <div className="masuk__brand">
            <span className="masuk__brand-mark" aria-hidden="true">HM</span>
            <div>
              <p className="masuk__brand-name">Humas Internal</p>
              <p className="masuk__brand-sub">Ruang kerja komunikasi lembaga</p>
            </div>
          </div>

          <div className="masuk__statement">
            <h1 id="reset-statement">Atur Ulang Kata Sandi Akun Staf</h1>
            <p>
              Seluruh staf diminta memperbarui kata sandi demi keamanan infrastruktur pangkalan data terpusat Supabase. Kata sandi lama tidak dipindahkan untuk melindungi privasi Anda.
            </p>
          </div>

          <div className="masuk__foot">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">🔒</span> Enkripsi Argon2 / Bcrypt Supabase
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">📩</span> Tautan aktivasi sekali pakai aman
            </span>
          </div>
        </section>

        {/* Kolom Kanan: Form Permintaan / Pembaruan */}
        <section className="masuk__panel" aria-labelledby="reset-title">
          <div className="masuk__card">
            <h2 id="reset-title">
              {mode === 'request' ? 'Lupa Kata Sandi' : 'Buat Kata Sandi Baru'}
            </h2>
            <p className="masuk__lead">
              {mode === 'request'
                ? 'Masukkan email staf untuk menerima tautan pembaruan kata sandi.'
                : 'Tentukan kata sandi baru untuk login harian Anda.'}
            </p>

            {errorMsg && (
              <p className="masuk__alert" role="alert" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="masuk__alert" role="status" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                ✓ {successMsg}
              </p>
            )}

            {mode === 'request' ? (
              <form onSubmit={handleRequestReset} noValidate>
                <div className="masuk__field">
                  <label className="masuk__label" htmlFor="reset-email">
                    Email Staf Terdaftar
                  </label>
                  <input
                    className="masuk__input"
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="nama@pedulinegeri.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="masuk__submit"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#1d5c94',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '14px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '16px'
                  }}
                >
                  {loading ? 'Mengirim Tautan...' : 'Kirim Tautan Atur Ulang'}
                </button>

                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    style={{ background: 'none', border: 'none', color: '#1d5c94', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Sudah memiliki kode/tautan aktivasi? Masukkan sandi baru
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUpdatePassword} noValidate>
                <div className="masuk__field">
                  <label className="masuk__label" htmlFor="new-password">
                    Kata Sandi Baru
                  </label>
                  <input
                    className="masuk__input"
                    id="new-password"
                    name="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="masuk__field" style={{ marginTop: '12px' }}>
                  <label className="masuk__label" htmlFor="confirm-password">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    className="masuk__input"
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="masuk__submit"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#1d5c94',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '14px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '16px'
                  }}
                >
                  {loading ? 'Menyimpan Sandi...' : 'Simpan Kata Sandi Baru'}
                </button>

                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setMode('request')}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Kembali ke minta tautan
                  </button>
                </div>
              </form>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <Link href="/masuk" style={{ color: '#1d5c94', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                ← Kembali ke Halaman Masuk
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
