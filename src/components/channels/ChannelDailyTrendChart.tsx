'use client';

import React from 'react';
import type { ChannelSummaryData, MetricDimension } from './ChannelMonitoringView';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ChannelDailyTrendChartProps {
  channels: ChannelSummaryData[];
  activeMetric: MetricDimension;
  onChangeMetric: (metric: MetricDimension) => void;
  startDate: string;
  endDate: string;
}

const PLATFORM_THEME: Record<
  ChannelSummaryData['platform'],
  { color: string; label: string }
> = {
  instagram: {
    color: '#e1306c',
    label: 'Instagram'
  },
  facebook: {
    color: '#1877f2',
    label: 'Facebook'
  },
  tiktok: {
    color: '#10b981',
    label: 'TikTok'
  },
  youtube: {
    color: '#dc2626',
    label: 'YouTube'
  }
};

const METRIC_LABELS: Record<MetricDimension, string> = {
  views: 'Tayangan (Views / Reach)',
  interactions: 'Interaksi (Likes, Comments, Shares)',
  followers: 'Pengikut (Followers / Subscribers)'
};

/**
 * Komponen grafik deret waktu harian per kanal.
 * Memenuhi Aturan Tampilan UI #2:
 * "Deret waktu: Gunakan grafik garis (line chart)."
 */
export function ChannelDailyTrendChart({
  channels,
  activeMetric,
  onChangeMetric,
  startDate,
  endDate
}: ChannelDailyTrendChartProps) {
  return (
    <Card
      className="border-border/80 bg-card shadow-xs"
      aria-label="Tren harian per kanal"
      data-testid="daily-trends-section"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Deret Waktu (Line Chart)
              </span>
              <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                DEMO
              </Badge>
            </div>
            <CardTitle className="text-base font-semibold">
              Tren Harian Terpisah per Kanal ({startDate} s/d {endDate})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Grafik garis deret waktu harian untuk memantau fluktuasi <strong>{METRIC_LABELS[activeMetric]}</strong> (Aturan #2)
            </CardDescription>
          </div>

          <div
            role="group"
            aria-label="Pilih metrik grafik tren harian"
            className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/60 flex-wrap"
          >
            {(
              [
                { id: 'views', label: 'Tayangan (Views)' },
                { id: 'interactions', label: 'Interaksi' },
                { id: 'followers', label: 'Pengikut' }
              ] as const
            ).map((dim) => {
              const active = activeMetric === dim.id;
              return (
                <Button
                  key={dim.id}
                  type="button"
                  size="sm"
                  variant={active ? 'default' : 'ghost'}
                  data-testid={`trend-metric-tab-${dim.id}`}
                  onClick={() => onChangeMetric(dim.id)}
                  className={`h-7 text-xs px-2.5 ${active ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'}`}
                >
                  {dim.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Grid Grafik Garis Terpisah per Kanal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => {
            const values = channel.dailyTrend.map((pt) => pt[activeMetric]);
            const maxVal = Math.max(...values, 1);
            const avgVal = Math.round(
              values.reduce((sum, v) => sum + v, 0) / (values.length || 1)
            );
            const peakIdx = values.indexOf(maxVal);
            const peakPoint = channel.dailyTrend[peakIdx];
            const theme = PLATFORM_THEME[channel.platform];

            const growthLabel =
              activeMetric === 'views'
                ? channel.viewsGrowth
                : activeMetric === 'interactions'
                ? channel.interactionsGrowth
                : channel.followersGrowth;

            // Siapkan data untuk Recharts LineChart
            const chartData = channel.dailyTrend.map((pt) => ({
              date: pt.date,
              label: pt.label,
              value: pt[activeMetric]
            }));

            return (
              <div
                key={`trend-${channel.id}`}
                data-testid={`channel-trend-chart-${channel.platform}`}
                className="p-3.5 rounded-lg border border-border/80 bg-muted/20 flex flex-col justify-between gap-3"
              >
                {/* Header Kanal */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {channel.platformLabel}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ({channel.handle})
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-1.5 py-0"
                  >
                    {growthLabel}
                  </Badge>
                </div>

                {/* Ringkasan Statistik Harian Kanal */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-card p-2 rounded border border-border/60">
                  <span>
                    Rata-rata:{' '}
                    <strong className="text-foreground font-mono">
                      {avgVal.toLocaleString('id-ID')}
                    </strong>
                  </span>
                  {peakPoint && (
                    <span>
                      Puncak ({peakPoint.label}):{' '}
                      <strong className="text-foreground font-mono">
                        {maxVal.toLocaleString('id-ID')}
                      </strong>
                    </span>
                  )}
                </div>

                {/* ATURAN #2: Line Chart Recharts */}
                <div className="h-[140px] w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.3 0.02 160 / 0.3)" />
                      <XAxis
                        dataKey="label"
                        stroke="oklch(0.6 0.02 160)"
                        fontSize={10}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="oklch(0.6 0.02 160)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.2 0.02 160)',
                          borderColor: 'oklch(0.35 0.04 160)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          padding: '6px 10px'
                        }}
                        formatter={(val: any) => [
                          Number(val).toLocaleString('id-ID'),
                          METRIC_LABELS[activeMetric].split(' ')[0]
                        ]}
                        labelFormatter={(lbl) => `Tanggal: ${lbl}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={theme.color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: theme.color }}
                        activeDot={{ r: 5, fill: theme.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ChannelDailyTrendChart;
