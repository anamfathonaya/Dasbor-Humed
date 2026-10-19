'use client';

import React, { useState, useEffect } from 'react';
import { HumasShell } from '@/components/layout/HumasShell';
import Link from 'next/link';

interface Notification {
  id: number;
  category: string;
  severity: string;
  title: string;
  message: string;
  source: string | null;
  is_read: number;
  telegram_sent: number;
  email_sent: number;
  created_at: string;
}

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [testSending, setTestSending] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?unreadOnly=${filter === 'unread'}&limit=100`);
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.items || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Auto refresh setiap 30 detik
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        loadNotifications();
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleTestSend = async () => {
    setTestSending(true);
    setTestMessage(null);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Alert',
          message: `Pesan percobaan dikirim ${new Date().toLocaleString('id-ID')}`,
          severity: 'info',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setTestMessage(`✅ Terkirim! Bot: @${data.botUsername}`);
        loadNotifications();
      } else {
        setTestMessage(`❌ Gagal: ${data.error}`);
      }
    } catch (err: any) {
      setTestMessage(`❌ Error: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const severityColor = (sev: string) => {
    if (sev === 'critical') return '#ef4444';
    if (sev === 'warning') return '#f59e0b';
    return '#0284c7';
  };

  const severityEmoji = (sev: string) => {
    if (sev === 'critical') return '🔴';
    if (sev === 'warning') return '🟡';
    return '🟢';
  };

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      infrastructure: 'Infrastruktur',
      oauth_token: 'Token OAuth',
      news: 'Berita',
      content: 'Konten',
      project: 'Proyek',
      system: 'Sistem',
    };
    return map[cat] || cat;
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <HumasShell
      pageTitle="Pusat Notifikasi"
      pageSubtitle="Riwayat alert sistem, infrastruktur, dan integrasi OAuth"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Action Bar */}
        <div className="dasbor__bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`dasbor__btn ${filter === 'all' ? 'dasbor__btn--primary' : ''}`}
              onClick={() => setFilter('all')}
            >
              Semua ({notifications.length})
            </button>
            <button
              type="button"
              className={`dasbor__btn ${filter === 'unread' ? 'dasbor__btn--primary' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Belum Dibaca ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button type="button" className="dasbor__btn" onClick={handleMarkAllRead}>
                {/* @ts-ignore */}
                <iconify-icon icon="lucide:check-check" aria-hidden="true" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="dasbor__btn"
              onClick={handleTestSend}
              disabled={testSending}
            >
              {/* @ts-ignore */}
              <iconify-icon icon={testSending ? 'lucide:loader-2' : 'lucide:send'} aria-hidden="true" />
              <span>{testSending ? 'Mengirim...' : 'Test Telegram'}</span>
            </button>
            <Link href="/pengaturan/notifikasi" className="dasbor__btn">
              {/* @ts-ignore */}
              <iconify-icon icon="lucide:settings" aria-hidden="true" />
              <span>Pengaturan</span>
            </Link>
          </div>
        </div>

        {testMessage && (
          <div
            className="dasbor__card"
            style={{
              padding: '0.75rem 1rem',
              background: testMessage.startsWith('✅') ? '#dcfce7' : '#fee2e2',
              border: `1px solid ${testMessage.startsWith('✅') ? '#16a34a' : '#ef4444'}`,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#0f172a' }}>{testMessage}</p>
          </div>
        )}

        {/* Notifications List */}
        <section className="dasbor__card">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>Memuat notifikasi...</p>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              {/* @ts-ignore */}
              <iconify-icon icon="lucide:bell-off" width="48" height="48" style={{ color: 'var(--color-muted)' }} aria-hidden="true" />
              <p style={{ marginTop: '1rem', color: 'var(--color-muted)' }}>
                {filter === 'unread' ? 'Tidak ada notifikasi yang belum dibaca.' : 'Belum ada notifikasi. Sistem akan kirim alert otomatis jika ada masalah.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => n.is_read === 0 && handleMarkRead(n.id)}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-border)',
                    background: n.is_read === 0 ? 'rgba(2, 132, 199, 0.04)' : 'transparent',
                    cursor: n.is_read === 0 ? 'pointer' : 'default',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    borderLeft: `4px solid ${severityColor(n.severity)}`,
                  }}
                >
                  <div style={{ fontSize: '1.25rem', lineHeight: 1 }}>{severityEmoji(n.severity)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#475569' }}>{n.message}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span
                        className="dasbor__badge"
                        style={{ fontSize: '10px', background: severityColor(n.severity), color: '#fff' }}
                      >
                        {n.severity}
                      </span>
                      <span className="dasbor__badge" style={{ fontSize: '10px' }}>
                        {categoryLabel(n.category)}
                      </span>
                      {n.telegram_sent === 1 && (
                        <span style={{ fontSize: '0.7rem', color: '#16a34a' }}>📱 Telegram terkirim</span>
                      )}
                      {n.telegram_sent === 0 && n.email_sent === 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>📥 In-app only</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </HumasShell>
  );
}
