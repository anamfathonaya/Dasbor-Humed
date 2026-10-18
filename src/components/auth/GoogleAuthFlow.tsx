'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface GoogleAuthFlowProps {
  onSuccess?: (role: string) => void;
  onError?: (err: string) => void;
  selectedRole?: string;
}

export function GoogleAuthFlowModal({
  isOpen,
  onClose,
  selectedRole = 'head',
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedRole?: string;
  onSuccess?: (role: string) => void;
}) {
  const [step, setStep] = useState<'prompt' | 'connecting' | 'success'>('prompt');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartGoogleOAuth = async () => {
    setLoading(true);
    setStep('connecting');
    setErrorMsg(null);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });
        if (error) throw new Error(error.message);
        return;
      }

      // Simulasi alur Google OAuth terhubung Google AI Pro
      await new Promise((r) => setTimeout(r, 900));

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'humas.pedulinegeri@gmail.com',
          name: 'Tim Humas (Google AI Pro)',
          role: selectedRole
        })
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        setStep('success');
        setTimeout(() => {
          if (onSuccess) onSuccess(selectedRole);
          window.location.href = '/dasbor';
        }, 800);
      } else {
        throw new Error(json?.error || 'Gagal menyambungkan sesi Google SSO');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi gangguan saat menghubungkan akun Google.');
      setStep('prompt');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🌐</span>
            <span style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
              Masuk Cepat Google SSO
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#64748b'
            }}
          >
            ✕
          </button>
        </div>

        {/* Isi Modal */}
        <div style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fef2f2',
                color: '#991b1b',
                fontSize: '13px',
                border: '1px solid #fecaca'
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {step === 'prompt' && (
            <div>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#166534', fontSize: '13px' }}>
                  <span>✓</span> Terhubung Paket Google AI Pro
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#15803d', lineHeight: 1.4 }}>
                  Integrasi Google Drive 2TB dan Gemini Advanced aktif tanpa memerlukan akun Google Workspace Enterprise.
                </p>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Pilih akun Google terdaftar lembaga untuk langsung membuka ruang kerja sesuai peran hak akses:
              </p>

              {/* Akun Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  marginBottom: '1.25rem'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#1d5c94',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  G
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                    humas.pedulinegeri@gmail.com
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Peran: <b style={{ textTransform: 'capitalize' }}>{selectedRole}</b> · Lembaga Peduli Negeri
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleStartGoogleOAuth}
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#1d5c94',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Lanjutkan dengan Google
                </button>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 6px 0' }}>
                Menghubungkan Akun Google...
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Memvalidasi izin Google AI Pro dan sesi keamanan SSO.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#15803d', margin: '0 0 6px 0' }}>
                Autentikasi Berhasil!
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Mengalihkan ke dasbor kerja...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
