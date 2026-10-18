'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLayout, UserRole } from '@/components/layout/LayoutContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

import { GoogleAuthFlowModal } from '@/components/auth/GoogleAuthFlow';

export default function MasukPage() {
  const router = useRouter();
  const { setRole } = useLayout();

  const [email, setEmail] = useState('rani.head@pedulinegeri.org');
  const [password, setPassword] = useState('peduli2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('head');
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Demo user credentials mapping
  const demoAccounts = [
    { role: 'head' as UserRole, label: 'Ketua Bidang (Head)', email: 'rani.head@pedulinegeri.org' },
    { role: 'admin' as UserRole, label: 'Admin Teknis', email: 'budi.admin@pedulinegeri.org' },
    { role: 'staff' as UserRole, label: 'Staf Konten', email: 'dewi.creative@pedulinegeri.org' }
  ];

  const handleSelectDemo = (role: UserRole, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword('peduli2026');
    setAlertMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!email || !password) {
      setAlertMsg('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      // 1. Jika Supabase terkonfigurasi, coba autentikasi Supabase Auth
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          // Jika Supabase Auth menolak (misal user belum set password baru lewat reset link),
          // fallback ke validasi akun staf terdaftar
          console.warn('[MasukPage] Supabase auth returned error:', error.message);
        } else if (data?.user) {
          const userRole = (data.user.user_metadata?.role as UserRole) || selectedRole;
          setRole(userRole);
          router.push('/dasbor');
          return;
        }
      }

      // 2. Autentikasi API Internal / Session Fallback
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || (json && !json.success)) {
        setAlertMsg(json?.error || 'Email atau kata sandi tidak cocok.');
        setLoading(false);
        return;
      }

      // Set peran di context & cookies
      const finalRole = json?.data?.role || selectedRole;
      setRole(finalRole);

      // Arahkan ke dasbor
      router.push('/dasbor');
    } catch (err: any) {
      setAlertMsg(err.message || 'Terjadi kesalahan sistem saat masuk.');
      setLoading(false);
    }
  };

  const handleGoogleSso = async () => {
    setLoading(true);
    setAlertMsg(null);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/api/auth/callback`
          }
        });
        if (error) {
          throw new Error(error.message);
        }
        return;
      }

      // Fallback Google SSO handler
      window.location.href = '/api/auth/google';
    } catch (err: any) {
      setAlertMsg(err.message || 'Gagal memulai autentikasi Google SSO.');
      setLoading(false);
    }
  };

  return (
    <div data-page-content="masuk" style={{ display: 'contents' }}>
      <main className="masuk" data-node-id="masuk.root" data-theme="light">
        {/* Kolom Kiri: Pengantar Lembaga */}
        <section className="masuk__intro" aria-labelledby="masuk-statement">
          <div className="masuk__brand">
            <span className="masuk__brand-mark" aria-hidden="true">HM</span>
            <div>
              <p className="masuk__brand-name">Humas Internal</p>
              <p className="masuk__brand-sub">Ruang kerja komunikasi lembaga</p>
            </div>
          </div>

          <div className="masuk__statement">
            <h1 id="masuk-statement">Portal kerja humas dan tim komunikasi</h1>
            <p>
              Masuk dengan kredensial lembaga untuk membuka modul pemantauan berita, kalender konten, papan proyek, metrik, dan laporan.
            </p>
          </div>

          <div className="masuk__foot">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">🛡️</span> Akses sesuai peran RBAC
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span aria-hidden="true">⏱️</span> Sesi aman & audit log otomatis
            </span>
          </div>
        </section>

        {/* Kolom Kanan: Form Masuk Email & Kata Sandi */}
        <section className="masuk__panel" aria-labelledby="masuk-title">
          <div className="masuk__card">
            <h2 id="masuk-title">Masuk</h2>
            <p className="masuk__lead">Gunakan akun staf humas yang terdaftar.</p>

            {alertMsg && (
              <p className="masuk__alert" role="alert" data-open="true" id="login-alert">
                <span aria-hidden="true" style={{ marginRight: '6px' }}>⚠️</span>
                <span>{alertMsg}</span>
              </p>
            )}

            <form id="login-form" onSubmit={handleSubmit} noValidate>
              <div className="masuk__field">
                <label className="masuk__label" htmlFor="masuk-email">
                  Email atau ID staf
                </label>
                <input
                  className="masuk__input"
                  id="masuk-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="nama@pedulinegeri.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="masuk__field">
                <label className="masuk__label" htmlFor="masuk-password">
                  Kata sandi
                </label>
                <div className="masuk__password-wrap" style={{ position: 'relative' }}>
                  <input
                    className="masuk__input"
                    id="masuk-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: '44px' }}
                    required
                  />
                  <button
                    className="masuk__reveal"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    aria-pressed={showPassword}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Pilihan Cepat Akun Demo Simulasi */}
              <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#7a8794', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pilih Akun Demo Simulasi:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectDemo(acc.role, acc.email)}
                      className={`demo-chip ${selectedRole === acc.role ? 'active' : ''}`}
                      style={{
                        fontSize: '11px',
                        fontWeight: selectedRole === acc.role ? 600 : 500,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: selectedRole === acc.role ? '1px solid #1d5c94' : '1px solid #dbe1e8',
                        background: selectedRole === acc.role ? '#e3eefa' : '#fff',
                        color: selectedRole === acc.role ? '#1d5c94' : '#5a6875',
                        cursor: 'pointer'
                      }}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="masuk__row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', marginBottom: '14px' }}>
                <label className="masuk__check" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="remember-me"
                    name="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ingat perangkat ini</span>
                </label>
                <a className="masuk__link" href="#" style={{ fontSize: '12px', color: '#1d5c94', textDecoration: 'none' }}>
                  Lupa kata sandi?
                </a>
              </div>

              <button
                className="masuk__submit"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#1d5c94',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <span>{loading ? 'Memproses...' : 'Masuk ke Dasbor'}</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'center',
                  margin: '18px 0 14px 0',
                  color: '#7a8794',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <span style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }}></span>
                <span style={{ padding: '0 10px' }}>atau masuk cepat</span>
                <span style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }}></span>
              </div>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '16px' }}>🌐</span>
                <span>Masuk dengan Akun Google</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#eef2ff',
                    color: '#4338ca',
                    border: '1px solid #c7d2fe',
                    fontWeight: 600
                  }}
                >
                  Google AI Pro
                </span>
              </button>
            </form>

            <p className="masuk__note" style={{ fontSize: '11px', color: '#64748b', marginTop: '16px', lineHeight: 1.5 }}>
              Akun Google SSO terhubung langsung dengan paket <b>Google AI Pro</b> (Gemini Advanced & Google Drive 2TB) tanpa memerlukan akun Google Workspace Enterprise.
            </p>
          </div>
        </section>
      </main>

      {/* Modal Interaktif Alur Masuk Google SSO */}
      <GoogleAuthFlowModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        selectedRole={selectedRole}
        onSuccess={(role) => setRole(role as UserRole)}
      />
    </div>
  );
}
