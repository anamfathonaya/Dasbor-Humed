'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { SAMPLE_CHANNELS_DATA, type SocialPlatform } from './ChannelMonitoringView';
import { ChannelMetricCard } from './ChannelMetricCard';
import { ChannelSideBySideComparison } from './ChannelSideBySideComparison';
import { ChannelExportButton } from './ChannelExportButton';
import { ChannelDailyTrendChart } from './ChannelDailyTrendChart';
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
import { Radio, BarChart3, TrendingUp, Users, Eye, HeartHandshake, Layers } from 'lucide-react';

type MetricDimension = React.ComponentProps<typeof ChannelDailyTrendChart>['activeMetric'];

const START_DATE = '2026-10-13';
const END_DATE = '2026-10-19';
const ALL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'tiktok', 'youtube'];

/**
 * Layout halaman dasbor metrik kanal (frontend-first, data tiruan).
 * Menggunakan shadcn/ui dan mematuhi 7 Prinsip Tampilan:
 * 1. Angka besar & perbedaan periode.
 * 2. Deret waktu (grafik garis).
 * 3. Batang horizontal terurut untuk perbandingan.
 * 4. Detail per item dalam tabel terstruktur.
 * 6. Hierarki visual tegas.
 * 7. Penanda label DEMO jelas.
 */
export function ChannelMetricsDashboardView() {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | SocialPlatform>('all');
  const [activeMetric, setActiveMetric] = useState<MetricDimension>('views' as MetricDimension);

  const channels = useMemo(
    () =>
      selectedPlatform === 'all'
        ? SAMPLE_CHANNELS_DATA
        : SAMPLE_CHANNELS_DATA.filter((c) => c.platform === selectedPlatform),
    [selectedPlatform]
  );

  const visiblePlatforms = selectedPlatform === 'all' ? ALL_PLATFORMS : [selectedPlatform];

  const totals = useMemo(
    () => ({
      followers: channels.reduce((a, c) => a + c.followers, 0),
      views: channels.reduce((a, c) => a + c.views, 0),
      interactions: channels.reduce((a, c) => a + c.interactions, 0)
    }),
    [channels]
  );

  const kpis = [
    {
      label: 'Total Pengikut',
      value: totals.followers,
      delta: '+4.2%',
      deltaText: 'vs 7 hari lalu',
      icon: Users,
      color: 'text-emerald-400'
    },
    {
      label: 'Total Tayangan',
      value: totals.views,
      delta: '+12.8%',
      deltaText: 'vs 7 hari lalu',
      icon: Eye,
      color: 'text-primary'
    },
    {
      label: 'Total Interaksi',
      value: totals.interactions,
      delta: '+8.1%',
      deltaText: 'vs 7 hari lalu',
      icon: HeartHandshake,
      color: 'text-cyan-400'
    },
    {
      label: 'Kanal Dipantau',
      value: channels.length,
      delta: '100% Aktif',
      deltaText: 'semua terhubung',
      icon: Radio,
      color: 'text-amber-400'
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Sub-navigasi modul kanal & laporan */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/pemantauan-kanal">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Pemantauan Kanal
            </Button>
          </Link>
          <Link href="/dasbor-metrik-kanal">
            <Button variant="default" size="sm" className="h-8 text-xs bg-primary text-primary-foreground">
              Dasbor Metrik Kanal
            </Button>
          </Link>
          <Link href="/laporan-kinerja">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Laporan Kinerja Kanal
            </Button>
          </Link>
        </div>

        <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-xs gap-1 py-1">
          <span>●</span>
          <span>DEMO MODE</span>
        </Badge>
      </div>

      {/* Filter platform */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardContent className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Filter Platform:</span>
              <div role="group" aria-label="Filter platform" className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'instagram', 'facebook', 'tiktok', 'youtube'] as const).map((p) => {
                  const isActive = selectedPlatform === p;
                  return (
                    <Button
                      key={p}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      aria-pressed={isActive}
                      onClick={() => setSelectedPlatform(p)}
                      className={`h-7 text-xs ${isActive ? 'bg-primary text-primary-foreground shadow-xs' : ''}`}
                    >
                      {p === 'all' ? 'Semua Kanal' : p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  );
                })}
              </div>
            </div>

            <span className="text-[11px] text-muted-foreground">
              Periode Analisis: <strong className="text-foreground">{START_DATE} s/d {END_DATE}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ATURAN #1 & #6: KPI gabungan (Nilai tunggal angka besar + perubahan periode) */}
      <section
        aria-label="Ringkasan metrik gabungan"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-border/80 bg-card shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">{k.label}</span>
                  <Icon className={`size-4 ${k.color}`} />
                </div>
                <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-foreground mt-2">
                  {typeof k.value === 'number' && k.label !== 'Kanal Dipantau'
                    ? formatCompactMetricValue(k.value)
                    : `${k.value} Kanal`}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <span className="font-semibold text-emerald-400 font-mono text-[11px]">
                    {k.delta}
                  </span>
                  <span className="text-muted-foreground text-[11px]">{k.deltaText}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Kartu per kanal */}
      <section
        aria-label="Metrik per kanal"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {visiblePlatforms.map((p) => (
          <ChannelMetricCard
            key={p}
            platform={p}
            channel={channels.find((c) => c.platform === p) ?? null}
            isSelected={selectedPlatform === p}
            onSelectChannel={setSelectedPlatform}
          />
        ))}
      </section>

      {/* ATURAN #2: Tren harian (grafik garis) */}
      <ChannelDailyTrendChart
        channels={channels}
        activeMetric={activeMetric}
        onChangeMetric={setActiveMetric}
        startDate={START_DATE}
        endDate={END_DATE}
      />

      {/* ATURAN #3: Perbandingan berdampingan antar kanal (grafik batang horizontal terurut) */}
      <ChannelSideBySideComparison channels={channels} />

      {/* ATURAN #4: Tabel siap-laporan (tabel terstruktur) */}
      <Card className="border-border/80 bg-card shadow-xs" aria-label="Tabel metrik siap laporan">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Data tabular
                </span>
                <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                  DEMO
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold">
                Metrik Kanal untuk Laporan
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Format tabel terstruktur siap ekspor dan komparasi langsung
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ChannelExportButton channels={channels} periodLabel={`${START_DATE}_${END_DATE}`} />
              <Link href="/laporan-kinerja">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Buka Laporan Kinerja
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Kanal</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Pengikut</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Tayangan</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Interaksi</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Engagement</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Sinkron Terakhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((c) => (
                  <TableRow key={c.id} className="border-border/60 hover:bg-muted/30">
                    <TableCell className="py-2.5">
                      <div className="font-semibold text-xs text-foreground">{c.platformLabel}</div>
                      <div className="text-[11px] text-muted-foreground">{c.handle}</div>
                    </TableCell>
                    <TableCell className="text-right py-2.5 font-mono text-xs text-foreground">
                      {formatCompactMetricValue(c.followers)}
                    </TableCell>
                    <TableCell className="text-right py-2.5 font-mono text-xs text-foreground">
                      {formatCompactMetricValue(c.views)}
                    </TableCell>
                    <TableCell className="text-right py-2.5 font-mono text-xs text-foreground">
                      {formatCompactMetricValue(c.interactions)}
                    </TableCell>
                    <TableCell className="text-right py-2.5 font-mono text-xs text-emerald-400 font-semibold">
                      {c.engagementRate}
                    </TableCell>
                    <TableCell className="text-right py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {c.lastUpdatedLabel}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChannelMetricsDashboardView;
