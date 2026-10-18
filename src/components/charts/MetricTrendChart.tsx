'use client';

import React, { useState } from 'react';

export interface MetricTrendChartProps {
  initialPeriod?: number;
  initialPlatform?: string;
  onPeriodChange?: (period: number) => void;
  onPlatformChange?: (platform: string) => void;
}

export function MetricTrendChart({
  initialPeriod = 12,
  initialPlatform = 'semua',
  onPeriodChange,
  onPlatformChange
}: MetricTrendChartProps) {
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(initialPeriod);

  const handlePlatformSelect = (val: string) => {
    setSelectedPlatform(val);
    if (onPlatformChange) onPlatformChange(val);
  };

  const handlePeriodSelect = (val: number) => {
    setSelectedPeriod(val);
    if (onPeriodChange) onPeriodChange(val);
  };

  // Titik SVG dinamis sesuai data tiruan
  const pathD =
    selectedPeriod === 4
      ? 'M 50 140 Q 200 80, 350 90 T 620 30 L 620 170 L 50 170 Z'
      : selectedPeriod === 26
      ? 'M 50 150 Q 150 110, 250 120 T 450 70 T 620 35 L 620 170 L 50 170 Z'
      : 'M 50 140 Q 150 90, 250 110 T 450 60 T 620 40 L 620 170 L 50 170 Z';

  const strokeD =
    selectedPeriod === 4
      ? 'M 50 140 Q 200 80, 350 90 T 620 30'
      : selectedPeriod === 26
      ? 'M 50 150 Q 150 110, 250 120 T 450 70 T 620 35'
      : 'M 50 140 Q 150 90, 250 110 T 450 60 T 620 40';

  return (
    <article className="dasbor__card">
      <div className="dasbor__card-head">
        <div>
          <h2>Tren jangkauan & interaksi</h2>
          <p>
            {selectedPeriod} pekan terakhir ·{' '}
            {selectedPlatform === 'semua' ? 'seluruh platform' : selectedPlatform}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            className="dasbor__select"
            aria-label="Pilih platform"
            value={selectedPlatform}
            onChange={(e) => handlePlatformSelect(e.target.value)}
          >
            <option value="semua">Semua platform</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="situs">Situs web</option>
          </select>
          <div className="dasbor__seg" role="group" aria-label="Rentang periode">
            <button
              className="dasbor__seg-btn"
              type="button"
              aria-pressed={selectedPeriod === 4}
              onClick={() => handlePeriodSelect(4)}
            >
              4P
            </button>
            <button
              className="dasbor__seg-btn"
              type="button"
              aria-pressed={selectedPeriod === 12}
              onClick={() => handlePeriodSelect(12)}
            >
              12P
            </button>
            <button
              className="dasbor__seg-btn"
              type="button"
              aria-pressed={selectedPeriod === 26}
              onClick={() => handlePeriodSelect(26)}
            >
              26P
            </button>
          </div>
        </div>
      </div>

      <div className="dasbor__chart-body">
        <svg viewBox="0 0 640 190" role="img" aria-label="Grafik tren jangkauan kanal">
          <defs>
            <linearGradient id="metricBlueArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2f6ea8" stopOpacity=".22" />
              <stop offset="1" stopColor="#2f6ea8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="dasbor__plot-grid">
            <line x1="45" x2="625" y1="35" y2="35" />
            <line x1="45" x2="625" y1="90" y2="90" />
            <line x1="45" x2="625" y1="150" y2="150" />
          </g>
          <path fill="url(#metricBlueArea)" d={pathD} />
          <path fill="none" stroke="#2f6ea8" strokeWidth="2.5" strokeLinejoin="round" d={strokeD} />
          <g fill="#2f6ea8" stroke="#fff" strokeWidth="2">
            <circle cx="50" cy="140" r="4" />
            <circle cx="150" cy="105" r="4" />
            <circle cx="250" cy="110" r="4" />
            <circle cx="350" cy="85" r="4" />
            <circle cx="450" cy="60" r="4" />
            <circle cx="550" cy="50" r="4" />
            <circle cx="620" cy="40" r="4" />
          </g>
        </svg>
      </div>
      <div className="dasbor__axis">
        {selectedPeriod === 4 ? (
          <>
            <span>P1</span>
            <span>P2</span>
            <span>P3</span>
            <span>P4</span>
          </>
        ) : (
          <>
            <span>P1</span>
            <span>P2</span>
            <span>P3</span>
            <span>P4</span>
            <span>P5</span>
            <span>P6</span>
            <span>P7</span>
            <span>P8</span>
            <span>P9</span>
            <span>P10</span>
            <span>P11</span>
            <span>P12</span>
          </>
        )}
      </div>

      <div className="dasbor__legend">
        <span>
          <i className="dasbor__swatch" style={{ background: '#2f6ea8' }} /> Jangkauan akun
        </span>
        <span>
          <i className="dasbor__swatch" style={{ background: '#0f766e' }} /> Interaksi keterlibatan
        </span>
        <span style={{ marginLeft: 'auto', color: '#5a6875' }}>
          Kenaikan bertahap dipicu video dokumentasi dan reels.
        </span>
      </div>
    </article>
  );
}
export default MetricTrendChart;
