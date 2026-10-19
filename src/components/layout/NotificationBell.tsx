'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: number;
  category: string;
  severity: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('/api/notifications?unreadOnly=true&limit=5');
      const data = await res.json();
      if (data.ok) {
        setUnreadCount(data.unreadCount || 0);
        setRecent(data.items || []);
      }
    } catch (err) {
      // Silent fail for bell
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // 1 min
    return () => clearInterval(interval);
  }, []);

  const handleMarkAll = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    load();
  };

  const severityEmoji = (sev: string) => {
    if (sev === 'critical') return '🔴';
    if (sev === 'warning') return '🟡';
    return '🟢';
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'baru';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h`;
    return `${Math.floor(diffHour / 24)}d`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifikasi"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          padding: '0.5rem',
          cursor: 'pointer',
          color: 'inherit',
        }}
      >
        {/* @ts-ignore */}
        <iconify-icon icon="lucide:bell" width="20" height="20" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              minWidth: '18px',
              height: '18px',
              padding: '0 4px',
              borderRadius: '9px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          />
          {/* Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              width: '360px',
              maxHeight: '480px',
              overflowY: 'auto',
              background: 'var(--color-surface, #fff)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              zIndex: 999,
            }}
          >
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.95rem' }}>Notifikasi</strong>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {recent.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Tidak ada notifikasi baru</p>
              </div>
            ) : (
              <div>
                {recent.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--color-border)',
                      background: n.is_read === 0 ? 'rgba(2, 132, 199, 0.05)' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1rem' }}>{severityEmoji(n.severity)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500 }}>{n.title}</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {n.message}
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  href="/notifikasi"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    color: '#0284c7',
                    textDecoration: 'none',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  Lihat semua notifikasi →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
