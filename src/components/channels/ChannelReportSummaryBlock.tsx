'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SAMPLE_CHANNELS_DATA } from './ChannelMonitoringView';
import { formatCompactMetricValue } from './ChannelUnifiedMetricComparisonTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye, HeartHandshake, ArrowUpRight } from 'lucide-react';

export interface ChannelReportSummaryBlockProps {
  /** Nama kanal terpilih di filter laporan ("Semua Kanal" atau nama platform) */
  selectedChannel?: string;
}

/**
 * Blok ringkasan metrik kanal media sosial untuk halaman Laporan Kinerja.
 * Mematuhi Aturan Tampilan UI:
 * - Nilai tunggal: angka besar dengan hierarki tegas (Aturan #1 & #6)
 * - Penanda label DEMO jelas (Aturan #7)
 */
export function ChannelReportSummaryBlock({ selectedChannel = 'Semua Kanal' }: ChannelReportSummaryBlockProps) {
  const [channelsData, setChannelsData] = useState<any[]>(SAMPLE_CHANNELS_DATA);
  const [databaseSource, setDatabaseSource] = useState<string>('sample');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const platformQuery = selectedChannel !== 'Semua Kanal' ? `?platform=${selectedChannel.toLowerCase()}` : '';
        const res = await fetch(`/api/channels/aggregate${platformQuery}`);
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.channels) && isMounted) {
            setChannelsData(json.channels);
            if (json.database) setDatabaseSource(json.database);
          }
        }
      } catch {
        // Fallback ke data lokal
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedChannel]);

  const rows =
    selectedChannel === 'Semua Kanal'
      ? channelsData
      : channelsData.filter((c) => (c.platformLabel || c.platform || '').toLowerCase() === selectedChannel.toLowerCase());

  const totals = rows.reduce(
    (acc, c) => ({
      followers: acc.followers + c.followers,
      views: acc.views + c.views,
      interactions: acc.interactions + c.interactions
    }),
    { followers: 0, views: 0, interactions: 0 }
  );

  const topByViews = rows.length ? rows.reduce((a, b) => (b.views > a.views ? b : a)) : null;

  return (
    <Card
      className="border-border/80 bg-card shadow-xs"
      data-testid="report-channel-summary"
      aria-label="Ringkasan metrik kanal media sosial"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Ringkasan Agregat
              </span>
              <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                DEMO
              </Badge>
            </div>
            <CardTitle className="text-base font-semibold">
              Ringkasan Metrik Kanal Media Sosial
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Pengikut, tayangan, dan interaksi dari kanal resmi Kemensos RI (hanya-baca)
            </CardDescription>
          </div>
          <Link href="/dasbor-metrik-kanal">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <span>Buka Dasbor Metrik Kanal</span>
              <ArrowUpRight className="size-3.5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <p data-testid="report-channel-summary-empty" className="text-xs text-muted-foreground py-4 text-center">
            Belum ada metrik untuk kanal &quot;{selectedChannel}&quot;. Hubungkan kanal atau jalankan penarikan metrik terlebih dahulu.
          </p>
        ) : (
          <div className="space-y-4">
            {/* PRINSIP 1 & 6: Angka besar monospaced dengan hierarki tegas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Total Pengikut</span>
                  <Users className="size-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono tracking-tight text-foreground mt-1.5">
                  {formatCompactMetricValue(totals.followers)}
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">Akumulasi audiens</span>
              </div>

              <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Total Tayangan</span>
                  <Eye className="size-3.5 text-primary" />
                </div>
                <div className="text-2xl font-bold font-mono tracking-tight text-foreground mt-1.5">
                  {formatCompactMetricValue(totals.views)}
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">Views / Jangkauan</span>
              </div>

              <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium">Total Interaksi</span>
                  <HeartHandshake className="size-3.5 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold font-mono tracking-tight text-foreground mt-1.5">
                  {formatCompactMetricValue(totals.interactions)}
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">Likes, comments, shares</span>
              </div>
            </div>

            {topByViews && rows.length > 1 && (
              <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-xs flex items-center justify-between flex-wrap gap-2">
                <span className="text-foreground">
                  Kanal kontributor tayangan terbesar:{' '}
                  <strong className="text-primary">{topByViews.platformLabel}</strong> ({topByViews.handle})
                </span>
                <span className="font-mono text-primary font-semibold">
                  {formatCompactMetricValue(topByViews.views)} views
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ChannelReportSummaryBlock;
