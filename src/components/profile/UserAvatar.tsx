'use client';

import React, { useState } from 'react';

export interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function UserAvatar({
  src,
  name,
  size = 40,
  className = ''
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const showImage = Boolean(src && !imgError);

  return (
    <div
      className={`l-humas__avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-primary-subtle, #e0f2fe)',
        color: 'var(--color-primary, #0369a1)',
        fontWeight: 600,
        userSelect: 'none',
        flexShrink: 0
      }}
      aria-label={`Avatar untuk ${name}`}
    >
      {showImage ? (
        <img
          src={src!}
          alt={name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
