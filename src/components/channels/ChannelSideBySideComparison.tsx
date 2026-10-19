'use client';

import React, { useState } from 'react';
import type { ChannelSummaryData, SocialPlatform } from './ChannelMonitoringView';
import { formatCompactMetricValue } from './ChannelUnifiedMetricComparisonTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface ChannelSideBySideComparisonProps {
  channels: ChannelSummaryData[];
}

type NumericKey = 'followers' | 'views' | 'interactions';

const NUMERIC_ROWS: Array<{ key: NumericKey; label: string }> = [
  { key: 'followers', label: 'Pengikut' },
  { key: 'views', label: 'Tayangan' },
  { key: 'interactions', label: 'Interaksi' }
];

const ACCENT: Record<SocialPlatform, string> = {
  instagram: '#e1306c',
  facebook: '#3b82f6',
  tiktok: '#10b981',
  youtube: '#ef4444'
};

/**
 * Perbandingan berdampingan antar kanal:
 * Memenuhi Aturan Tampilan UI #3:
 * "Perbandingan antar kanal: Gunakan grafik batang horizontal yang diurutkan (sorted horizontal bar chart)."
 * Serta tabel detail terstruktur (Aturan #4) dengan penanda nilai tertinggi.
 */
export function ChannelSideBySideComparison({ channels }: ChannelSideBySideComparisonProps) {
  const [activeChartMetric, setActiveChartMetric] = useState<NumericKey>('views');

  if (channels.length < 2) {
    return (
      <Card
        className="border-dashed border-border bg-card/50 text-center py-8"
        data-testid="channel-comparison-empty"
      >
        <CardHeader>
          <CardTitle className="text-base font-semibold">Perbandingan Antar Kanal</CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto">
            Pilih &quot;Semua Kanal&quot; atau hubungkan minimal dua kanal untuk membandingkan metrik secara berdampingan.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const best = (key: NumericKey) => Math.max(...channels.map((c) => c[key]));

  // Aturan Tampilan #3: Urutkan data dari nilai tertinggi ke terendah untuk grafik batang horizontal
  const sortedChartData = [...channels]
    .map((c) => ({
      name: c.platformLabel,
      handle: c.handle,
      platform: c.platform,
      value: c[activeChartMetric],
      fill: ACCENT[c.platform] || '#059669'
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card
      className="border-border/80 bg-card shadow-xs"
      data-testid="channel-side-by-side"
      aria-label="Perbandingan metrik berdampingan antar kanal"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Analisis Komparatif
              </span>
              <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                DEMO
              </Badge>
            </div>
            <CardTitle className="text-base font-semibold">
              Perbandingan Antar Kanal
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Grafik batang horizontal terurut (Aturan #3) dan matriks perbandingan performa langsung (Aturan #4)
            </CardDescription>
          </div>

          {/* Pemilih dimensi metrik untuk visualisasi batang horizontal */}
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/60">
            {NUMERIC_ROWS.map((row) => (
              <Button
                key={row.key}
                variant={activeChartMetric === row.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveChartMetric(row.key)}
                className={`h-7 text-xs px-2.5 ${activeChartMetric === row.key ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'}`}
              >
                {row.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ATURAN #3: Sorted Horizontal Bar Chart */}
        <div className="p-4 rounded-xl border border-border/80 bg-muted/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium text-foreground">
              Peringkat {NUMERIC_ROWS.find((r) => r.key === activeChartMetric)?.label} (Diurutkan Tertinggi ke Terendah)
            </span>
            <span>Grafik Batang Horizontal</span>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={sortedChartData}
                margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.3 0.02 160 / 0.4)" />
                <XAxis
                  type="number"
                  stroke="oklch(0.7 0.02 160)"
                  fontSize={11}
                  tickFormatter={(val) => formatCompactMetricValue(val)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="oklch(0.7 0.02 160)"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.2 0.02 160)',
                    borderColor: 'oklch(0.35 0.04 160)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [
                    Number(value).toLocaleString('id-ID'),
                    NUMERIC_ROWS.find((r) => r.key === activeChartMetric)?.label || 'Nilai'
                  ]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                  {sortedChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ATURAN #4: Detail per item: Gunakan tabel yang rapi dan terstruktur */}
        <div className="rounded-lg border border-border/80 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground w-[180px]">
                  Metrik
                </TableHead>
                {channels.map((c) => (
                  <TableHead
                    key={c.id}
                    className="text-right text-xs font-semibold text-muted-foreground"
                    style={{ borderBottom: `2px solid ${ACCENT[c.platform]}` }}
                  >
                    <div className="font-bold text-foreground">{c.platformLabel}</div>
                    <div className="font-normal text-[11px] text-muted-foreground">{c.handle}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {NUMERIC_ROWS.map((row) => {
                const top = best(row.key);
                return (
                  <TableRow key={row.key} className="border-border/60 hover:bg-muted/30">
                    <TableCell className="text-xs font-medium text-foreground py-2.5">
                      {row.label}
                    </TableCell>
                    {channels.map((c) => {
                      const isTop = c[row.key] === top;
                      return (
                        <TableCell
                          key={c.id}
                          data-testid={`compare-${row.key}-${c.platform}`}
                          className={`text-right text-xs py-2.5 font-mono ${isTop ? 'font-bold text-primary' : 'text-foreground'}`}
                        >
                          {isTop && (
                            <span aria-label="Tertinggi" title="Tertinggi" className="text-primary text-[10px] mr-1">
                              ▲
                            </span>
                          )}
                          {formatCompactMetricValue(c[row.key])}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              <TableRow className="border-border/60 hover:bg-muted/30">
                <TableCell className="text-xs font-medium text-foreground py-2.5">
                  Engagement Rate
                </TableCell>
                {channels.map((c) => (
                  <TableCell
                    key={c.id}
                    data-testid={`compare-engagementRate-${c.platform}`}
                    className="text-right text-xs font-mono text-foreground py-2.5"
                  >
                    {c.engagementRate}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="border-border/60 hover:bg-muted/30">
                <TableCell className="text-xs font-medium text-foreground py-2.5">
                  Sinkron Terakhir
                </TableCell>
                {channels.map((c) => (
                  <TableCell
                    key={c.id}
                    data-testid={`compare-lastUpdatedLabel-${c.platform}`}
                    className="text-right text-xs text-muted-foreground py-2.5 whitespace-nowrap"
                  >
                    {c.lastUpdatedLabel}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChannelSideBySideComparison;
