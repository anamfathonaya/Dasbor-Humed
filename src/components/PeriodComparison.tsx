'use client';

import React from 'react';
import { formatCompact, formatPercent, percentChange } from '@/lib/format';

interface PeriodComparisonProps {
  label: string;
  current: number;
  previous: number;
  /** Jika true, kenaikan dianggap buruk (mis. biaya). */
  invert?: boolean;
  prefix?: string;
}

export default function PeriodComparison({
  label,
  current,
  previous,
  invert = false,
  prefix = '',
}: PeriodComparisonProps) {
  const change = percentChange(current, previous);
  const up = change >= 0;
  const good = invert ? !up : up;

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '1.1rem',
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: '0.8rem',
          color: '#64748b',
          marginBottom: '0.3rem',
        }}
      >
        {label}
      </span>
      <strong style={{ fontSize: '1.4rem', color: '#0f172a' }}>
        {prefix}
        {formatCompact(current)}
      </strong>
      <div
        style={{
          marginTop: '0.4rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: good ? '#15803d' : '#b91c1c',
        }}
      >
        {up ? '▲' : '▼'} {formatPercent(Math.abs(change))}
        <small
          style={{
            display: 'block',
            fontWeight: 400,
            color: '#94a3b8',
            fontSize: '0.72rem',
          }}
        >
          vs periode lalu ({prefix}
          {formatCompact(previous)})
        </small>
      </div>
    </div>
  );
}