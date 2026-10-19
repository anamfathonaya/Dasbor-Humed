'use client';

import React, { useState, useEffect } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import Link from 'next/link';

interface Preference {
  id: number;
  channel: string;
  category: string;
  enabled: number;
  min_severity: string;
  telegram_chat_id: string | null;
  email_address: string | null;
}

const CATEGORIES = [
  { key: 'infrastructure', label: 'Infrastruktur (VPS, cPanel, NAS)', emoji: '🖥️' },
  { key: 'oauth_token', label: 'Token OAuth (Meta, YouTube, GA)', emoji: '🔑' },
  { key: 'news', label: 'Berita & Telegram Monitor', emoji: '📰' },
  { key: 'content', label: 'Konten & Kalender', emoji: '📅' },
  { key: 'project', label: 'Proyek & Task', emoji: '📋' },
  { key: 'system', label: 'Sistem & Error', emoji: '⚙️' },
];

const CHANNELS = [
  { key: 'in_app', label: 'Notifikasi In-App', emoji: '🔔' },
  { key: 'telegram', label: 'Telegram Bot', emoji: '📱' },
  { key: 'email', label: 'Email', emoji: '📧' },
];

const SEVERITIES = [
  { key: 'info', label: 'Info' },
  { key: 'warning', label: 'Warning' },
  { key: 'critical', label: 'Critical' },
];

export default function PengaturanNotifikasiPage() {
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPrefs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/preferences');
      const data = await res.json();
      if (data.ok) {
        setPrefs(data.preferences || []);
        const tgPref = data.preferences?.find((p: Preference) => p.channel === 'telegram');
        if (tgPref?.telegram_chat_id) setTelegramChatId(tgPref.telegram_chat_id);
        const emailPref = data.preferences?.find((p: Preference) => p.channel === 'email');
        if (emailPref?.email_address) setEmailAddress(emailPref.email_address);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrefs();
  }, []);

  const updatePref = async (channel: string, category: string, updates: Partial<Preference>) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          category,
          enabled: updates.enabled !== undefined ? updates.enabled === 1 : undefined,
          minSeverity: updates.min_severity,
          telegramChatId: channel === 'telegram' ? telegramChatId : undefined,
          emailAddress: channel === 'email' ? emailAddress : undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('✅ Preferensi disimpan');
        loadPrefs();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getPref = (channel: string, category: string): Preference | undefined => {
    return prefs.find(p => p.channel === channel && p.category === category);
  };

  return (
    <HumasShell
      pageTitle="Pengaturan Notifikasi"
      pageSubtitle="Atur channel, kategori, dan threshold alert"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Telegram Setup */}
        <section className="dasbor__card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
            📱 Konfigurasi Telegram Bot
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            Bot harus dibuat via @BotFather di Telegram. Setelah bot jadi, masukkan <code>TELEGRAM_BOT_TOKEN</code> di environment variable <code>.env</code>. User harus start chat dengan bot dulu agar dapat <code>chat_id</code>.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Chat ID (default untuk semua alert)
              </label>
              <input
                type="text"
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
                placeholder="contoh: -1001882991083 atau 123456789"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}
              />
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                💡 Grup/channel pakai ID negatif mulai -100...
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Email (opsional, untuk channel email)
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={e => setEmailAddress(e.target.value)}
                placeholder="humas@pedulinegeri.org"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>
        </section>

        {message && (
          <div
            className="dasbor__card"
            style={{
              padding: '0.5rem 0.75rem',
              background: message.startsWith('✅') ? '#dcfce7' : '#fee2e2',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{message}</p>
          </div>
        )}

        {/* Preferences Matrix */}
        <section className="dasbor__card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
            🎛️ Matriks Preferensi
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            Pilih channel mana yang aktif per kategori, dan minimum severity yang akan dikirim.
          </p>

          {loading ? (
            <p>Memuat preferensi...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {CHANNELS.map(channel => (
                <div key={channel.key}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
                    {channel.emoji} {channel.label}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {CATEGORIES.map(cat => {
                      const pref = getPref(channel.key, cat.key);
                      const enabled = pref?.enabled === 1;
                      const minSev = pref?.min_severity || 'warning';
                      return (
                        <div
                          key={cat.key}
                          style={{
                            padding: '0.75rem',
                            border: '1px solid var(--color-border)',
                            borderRadius: '0.5rem',
                            background: enabled ? 'rgba(2, 132, 199, 0.04)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                              {cat.emoji} {cat.label}
                            </span>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={e => updatePref(channel.key, cat.key, { enabled: e.target.checked ? 1 : 0 })}
                                style={{ marginRight: '0.25rem' }}
                              />
                              <span style={{ fontSize: '0.75rem' }}>{enabled ? 'Aktif' : 'Off'}</span>
                            </label>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>Min. severity:</label>
                            <select
                              value={minSev}
                              onChange={e => updatePref(channel.key, cat.key, { min_severity: e.target.value })}
                              disabled={!enabled || saving}
                              style={{ width: '100%', padding: '0.25rem', fontSize: '0.8rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', marginTop: '0.25rem' }}
                            >
                              {SEVERITIES.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/notifikasi" className="dasbor__btn">
            {/* @ts-ignore */}
            <iconify-icon icon="lucide:bell" aria-hidden="true" />
            <span>Lihat Notifikasi</span>
          </Link>
        </div>
      </div>
    </HumasShell>
  );
}
