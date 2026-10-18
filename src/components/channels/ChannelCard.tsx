'use client';

import React from 'react';

export interface ChannelCardProps {
  name: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'telegram' | 'website';
  handle: string;
  followersCount: number;
  status: 'connected' | 'disconnected' | 'reauth_required';
  platformUrl: string;
}

export function ChannelCard({
  name,
  platform,
  handle,
  followersCount,
  status,
  platformUrl
}: ChannelCardProps) {
  return (
    <article className="dasbor__card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div>
          <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '11px', textTransform: 'capitalize', marginBottom: '4px' }}>
            {platform}
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 600 }}>{name}</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-muted, #64748b)' }}>{handle}</span>
        </div>

        <span
          className={`dasbor__badge ${
            status === 'connected'
              ? 'dasbor__badge--up'
              : status === 'reauth_required'
              ? 'dasbor__badge--amber'
              : 'dasbor__badge--red'
          }`}
          style={{ fontSize: '11px' }}
        >
          {status === 'connected' ? 'Tersambung' : status === 'reauth_required' ? 'Perlu Re-auth' : 'Terputus'}
        </span>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border, #e2e8f0)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>Pengikut / Pemirsa</span>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
            {followersCount.toLocaleString('id-ID')}
          </p>
        </div>

        <a
          href={platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dasbor__btn"
          style={{ fontSize: '0.82rem', textDecoration: 'none' }}
        >
          {/* @ts-ignore iconify web component */}
          <iconify-icon icon="lucide:external-link" aria-hidden="true" />
          <span>Buka di Platform</span>
        </a>
      </div>
    </article>
  );
}
