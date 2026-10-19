'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HumasShell } from '@/components/layout/HumasShell';
import { ChannelReportSummaryBlock } from '@/components/channels/ChannelReportSummaryBlock';
import { mockPerformance, reportChannels, reportPeriods } from '@/lib/clientDataFetcher';

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
import { FilePlus, Filter, Calendar, Share2, Layers } from 'lucide-react';

export default function LaporanKinerjaPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('Semua Kanal');

  const filteredRows = (Array.isArray(mockPerformance) ? mockPerformance : []).filter((row) => {
    const matchChannel = selectedChannel === 'Semua Kanal' || row.channel.toLowerCase() === selectedChannel.toLowerCase();
    const matchPeriod = !row.period || row.period === selectedPeriod;
    return matchChannel && matchPeriod;
  });

  return (
    <HumasShell
      pageTitle="Laporan Kinerja Kanal"
      pageSubtitle="Ringkasan performa per kanal publikasi, konversi kampanye, dan pencatatan temuan berkala · 2026"
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Sub-Navigasi Modul Laporan */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/laporan">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Ringkasan Semua Laporan
              </Button>
            </Link>
            <Link href="/laporan-kinerja">
              <Button variant="default" size="sm" className="h-8 text-xs bg-primary text-primary-foreground">
                Laporan Kinerja Kanal
              </Button>
            </Link>
            <Link href="/bagikan-cetak">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Bagikan &amp; Cetak
              </Button>
            </Link>
          </div>

          <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-xs gap-1 py-1">
            <span>●</span>
            <span>DEMO</span>
          </Badge>
        </div>

        {/* Filter Toolbar */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <label htmlFor="period-select" className="text-xs font-medium text-muted-foreground">
                    Periode:
                  </label>
                  <select
                    id="period-select"
                    className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    {reportPeriods.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="size-3.5 text-muted-foreground" />
                  <label htmlFor="channel-select" className="text-xs font-medium text-muted-foreground">
                    Kanal:
                  </label>
                  <select
                    id="channel-select"
                    className="h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                  >
                    {reportChannels.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button size="sm" variant="default" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <FilePlus className="size-3.5" />
                <span>Simpan sebagai Catatan</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ringkasan Metrik Kanal Media Sosial */}
        <ChannelReportSummaryBlock selectedChannel={selectedChannel} />

        {/* PRINSIP 4: Tabel Rincian per Kanal (Detail per item dalam tabel terstruktur) */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Tabel Rincian
                  </span>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                    DEMO
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold">
                  Rincian Metrik per Kanal
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Data performa keterlibatan publik dan laju akuisisi mitra lembaga
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/80 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">Kanal</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Jangkauan</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Interaksi</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Konversi</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Perubahan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row, idx) => (
                    <TableRow key={idx} className="border-border/60 hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold text-foreground py-2.5">
                        {row.channel}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-foreground py-2.5">
                        {row.reach.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-foreground py-2.5">
                        {row.engagement.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-foreground py-2.5">
                        {row.conversions.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono px-1.5 py-0 ${
                            (row.delta ?? 0) >= 0
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {(row.delta ?? 0) >= 0 ? `+${row.delta}%` : `${row.delta}%`}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </HumasShell>
  );
}
