'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  FileText,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  ArrowUpRight,
  BarChart3,
  RefreshCw,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Radio,
  Calendar,
  KanbanSquare,
  BookOpen,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface GA4Metrics {
  totalUsers: number;
  totalSessions: number;
  totalPageviews: number;
  avgBounceRate: number;
}

interface YouTubeMetrics {
  subscriberCount: number;
  totalViewsCount: number;
  analyticsViews30d: number;
  analyticsWatchTimeMinutes30d: number;
}

// 30-day website trend dummy data
const WEBSITE_TREND_DATA = [
  { day: '01', users: 780, sessions: 1120 },
  { day: '05', users: 920, sessions: 1350 },
  { day: '10', users: 890, sessions: 1290 },
  { day: '15', users: 1150, sessions: 1680 },
  { day: '20', users: 1040, sessions: 1520 },
  { day: '25', users: 1280, sessions: 1890 },
  { day: '30', users: 1340, sessions: 1960 },
];

const websiteChartConfig = {
  users: {
    label: 'Pengguna',
    color: 'var(--color-chart-1)',
  },
  sessions: {
    label: 'Sesi',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

// Cross-channel reach comparison (sorted descending)
const CHANNEL_REACH_DATA = [
  { channel: 'YouTube', reach: 521600, fill: 'var(--color-chart-1)' },
  { channel: 'Portal Web', reach: 156000, fill: 'var(--color-chart-2)' },
  { channel: 'Instagram', reach: 98400, fill: 'var(--color-chart-3)' },
  { channel: 'TikTok', reach: 74200, fill: 'var(--color-chart-4)' },
  { channel: 'Facebook', reach: 32500, fill: 'var(--color-chart-5)' },
].sort((a, b) => b.reach - a.reach);

const channelChartConfig = {
  reach: {
    label: 'Jangkauan (Tayangan)',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig;

// Top performing items for table display
const TOP_CONTENT_ITEMS = [
  {
    title: 'Rilis Kebijakan Baru Sektor Publik 2026',
    channel: 'Website Utama',
    views: 42100,
    duration: '3m 42s',
    status: 'Aktif',
    change: '+14.2%',
  },
  {
    title: 'Liputan Khusus: Kunjungan Delegasi Kerja',
    channel: 'YouTube Video',
    views: 38400,
    duration: '8m 15s',
    status: 'Unggulan',
    change: '+22.5%',
  },
  {
    title: 'Panduan Layanan Terpadu Satu Pintu',
    channel: 'Website Dokumen',
    views: 27900,
    duration: '4m 10s',
    status: 'Aktif',
    change: '+8.1%',
  },
  {
    title: 'Infografis Ringkasan Kinerja Triwulan III',
    channel: 'Instagram Post',
    views: 19300,
    duration: '1m 20s',
    status: 'Stabil',
    change: '+5.4%',
  },
  {
    title: 'Tutorial Prosedur Administrasi Pegawai',
    channel: 'YouTube Short',
    views: 14800,
    duration: '0m 58s',
    status: 'Stabil',
    change: '+3.9%',
  },
];

export function DashboardView() {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ga4Metrics, setGa4Metrics] = useState<GA4Metrics | null>(null);
  const [youtubeMetrics, setYoutubeMetrics] = useState<YouTubeMetrics | null>(null);

  useEffect(() => {
    if (isLiveMode) {
      loadLiveData();
    } else {
      setLoading(false);
    }
  }, [isLiveMode]);

  const loadLiveData = async () => {
    setLoading(true);
    try {
      const ga4Response = await fetch('/api/integrations/google-analytics/properties?includeMetrics=true');
      if (ga4Response.ok) {
        const ga4Data = await ga4Response.json();
        if (ga4Data.ok && ga4Data.properties?.length > 0) {
          const firstProperty = ga4Data.properties[0];
          if (firstProperty.metrics) {
            setGa4Metrics(firstProperty.metrics);
          }
        }
      }

      const ytResponse = await fetch('/api/channels/youtube');
      if (ytResponse.ok) {
        const ytData = await ytResponse.json();
        if (ytData.ok && ytData.channels?.length > 0) {
          setYoutubeMetrics(ytData.channels[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load live data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'jt';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'rb';
    }
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const demoGA4: GA4Metrics = {
    totalUsers: 28500,
    totalSessions: 42000,
    totalPageviews: 156000,
    avgBounceRate: 42.3,
  };

  const demoYT: YouTubeMetrics = {
    subscriberCount: 185000,
    totalViewsCount: 14820400,
    analyticsViews30d: 521600,
    analyticsWatchTimeMinutes30d: 148900,
  };

  const activeGA4 = isLiveMode ? (ga4Metrics || demoGA4) : demoGA4;
  const activeYT = isLiveMode ? (youtubeMetrics || demoYT) : demoYT;
  const isDemoActive = !isLiveMode || (!ga4Metrics && !youtubeMetrics);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner / Mode Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-muted-foreground">Mode Data:</span>
          {isDemoActive ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500 font-semibold text-xs tracking-wider">
                DEMO
              </Badge>
              <span className="text-xs text-amber-500/90 font-medium">
                Data Percontohan Terstandar
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-semibold text-xs tracking-wider">
                LIVE
              </Badge>
              <span className="text-xs text-primary font-medium">
                Integrasi Aktif Terhubung
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLiveMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadLiveData}
              disabled={loading}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsLiveMode(!isLiveMode)}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLiveMode ? (
              <>
                <Eye className="size-3.5" />
                <span>Beralih ke Demo</span>
              </>
            ) : (
              <>
                <Radio className="size-3.5" />
                <span>Beralih ke Live</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Tabs for Structured Dashboard View */}
      <Tabs defaultValue="ringkasan" className="w-full">
        <TabsList className="bg-muted/70 p-1 rounded-lg border border-border/60">
          <TabsTrigger value="ringkasan" className="text-xs font-medium px-3.5 py-1.5">
            Ringkasan Eksekutif
          </TabsTrigger>
          <TabsTrigger value="website" className="text-xs font-medium px-3.5 py-1.5">
            Website & Portal
          </TabsTrigger>
          <TabsTrigger value="youtube" className="text-xs font-medium px-3.5 py-1.5">
            YouTube Media
          </TabsTrigger>
          <TabsTrigger value="integrasi" className="text-xs font-medium px-3.5 py-1.5">
            Status Integrasi
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RINGKASAN EKSEKUTIF */}
        <TabsContent value="ringkasan" className="flex flex-col gap-6 mt-4">
          {/* PRINSIP 1: Nilai tunggal dengan perubahan (angka besar dengan selisih periode, bukan grafik) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium tracking-wide">Pengguna Website (30 Hari)</span>
                  <Users className="size-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
                    {formatNumber(activeGA4.totalUsers)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-400">
                    <TrendingUp className="size-3" /> +12.4%
                  </span>
                  <span className="text-muted-foreground">(+3.1rb) vs bln lalu</span>
                  {isDemoActive && (
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 border-amber-500/30 text-amber-500">
                      DEMO
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* KPI 2 */}
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium tracking-wide">Total Sesi Website</span>
                  <Activity className="size-4 text-teal-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
                    {formatNumber(activeGA4.totalSessions)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-400">
                    <TrendingUp className="size-3" /> +8.2%
                  </span>
                  <span className="text-muted-foreground">(+3.2rb) vs bln lalu</span>
                  {isDemoActive && (
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 border-amber-500/30 text-amber-500">
                      DEMO
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* KPI 3 */}
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium tracking-wide">YouTube Subscribers</span>
                  <YoutubeIcon className="size-4 text-red-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
                    {formatNumber(activeYT.subscriberCount)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-400">
                    <TrendingUp className="size-3" /> +5.1%
                  </span>
                  <span className="text-muted-foreground">(+9.0rb) vs bln lalu</span>
                  {isDemoActive && (
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 border-amber-500/30 text-amber-500">
                      DEMO
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* KPI 4 */}
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-medium tracking-wide">Tayangan YouTube (30d)</span>
                  <Eye className="size-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-bold font-mono tracking-tight text-foreground">
                    {formatNumber(activeYT.analyticsViews30d)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-400">
                    <TrendingUp className="size-3" /> +18.4%
                  </span>
                  <span className="text-muted-foreground">(+81.2rb) vs bln lalu</span>
                  {isDemoActive && (
                    <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 border-amber-500/30 text-amber-500">
                      DEMO
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DUA GRAFIK SESUAI ATURAN TAMPILAN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PRINSIP 2: Deret waktu: grafik garis (line chart) */}
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Tren Kunjungan Harian (30 Hari)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Deret waktu pertumbuhan pengguna dan sesi web harian
                    </CardDescription>
                  </div>
                  {isDemoActive && (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px]">
                      DEMO
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer config={websiteChartConfig} className="h-56 w-full">
                  <LineChart data={WEBSITE_TREND_DATA} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.6} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `Tgl ${value}`}
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `${value}`}
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: 'var(--color-chart-1)' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="var(--color-chart-2)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2.5, fill: 'var(--color-chart-2)' }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* PRINSIP 3: Perbandingan antar kanal: grafik batang horizontal yang diurutkan */}
            <Card className="border-border/80 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Perbandingan Jangkauan Antar Kanal (30 Hari)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Batang horizontal terurut dari performa tertinggi ke terendah
                    </CardDescription>
                  </div>
                  {isDemoActive && (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px]">
                      DEMO
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer config={channelChartConfig} className="h-56 w-full">
                  <BarChart
                    data={CHANNEL_REACH_DATA}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.6} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatNumber(v)}
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                    />
                    <YAxis
                      dataKey="channel"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      stroke="var(--color-foreground)"
                      fontSize={11}
                      width={80}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="reach"
                      radius={[0, 4, 4, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* PRINSIP 4: Detail per item: Gunakan tabel yang rapi dan terstruktur */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Konten & Halaman Berkinerja Tertinggi
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Detail per item performa konten lintas kanal komunikasi publik
                  </CardDescription>
                </div>
                {isDemoActive && (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px]">
                    DEMO
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">Judul Konten / Halaman</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Kanal Media</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Tampilan</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Durasi Rata-rata</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Tren</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TOP_CONTENT_ITEMS.map((item, index) => (
                    <TableRow key={index} className="border-border/60 hover:bg-muted/40">
                      <TableCell className="font-medium text-xs text-foreground py-2.5">
                        {item.title}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2.5">
                        {item.channel}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-right py-2.5">
                        {new Intl.NumberFormat('id-ID').format(item.views)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground text-right py-2.5">
                        {item.duration}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-400 text-right py-2.5">
                        {item.change}
                      </TableCell>
                      <TableCell className="text-center py-2.5">
                        <Badge
                          variant={item.status === 'Unggulan' ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* PRINSIP 5: Status integrasi: badge status dengan waktu sinkron terakhir, tanpa grafik */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Status Sinkronisasi & Integrasi Kanal
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Pemantauan status operasional saluran komunikasi tanpa grafik
                  </CardDescription>
                </div>
                <Link href="/status-integrasi">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    <span>Lihat Semua</span>
                    <ArrowUpRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Google Analytics 4</span>
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]">
                      Terhubung
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Sinkron terakhir: <b>19 Okt 2026, 14:30 WIB</b>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">YouTube Data API</span>
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]">
                      Terhubung
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Sinkron terakhir: <b>19 Okt 2026, 14:15 WIB</b>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Meta Graph (IG & FB)</span>
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]">
                      Terhubung
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Sinkron terakhir: <b>19 Okt 2026, 13:45 WIB</b>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">TikTok Business API</span>
                    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500 text-[10px]">
                      Siaga Token
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Sinkron terakhir: <b>18 Okt 2026, 09:00 WIB</b>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: WEBSITE & PORTAL */}
        <TabsContent value="website" className="flex flex-col gap-6 mt-4">
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    <span>Analitik Portal & Situs Web (Google Analytics 4)</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Metrik 30 hari akumulatif lalu lintas pembaca portal humas
                  </CardDescription>
                </div>
                <Link href="/pengaturan">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    <Settings className="size-3" />
                    <span>Kelola Properti</span>
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLiveMode && !ga4Metrics && (
                <Alert className="mb-4 border-amber-500/30 bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <AlertTitle className="text-xs font-semibold">Koneksi Belum Terpasang</AlertTitle>
                  <AlertDescription className="text-xs">
                    Google Analytics belum terhubung ke database lokal. <Link href="/pengaturan" className="underline font-semibold">Hubungkan sekarang</Link> atau gunakan data demo.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Pengguna Total</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{formatNumber(activeGA4.totalUsers)}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">▲ +12.4% periode ini</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Total Sesi Kunjungan</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{formatNumber(activeGA4.totalSessions)}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">▲ +8.2% periode ini</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Tampilan Halaman</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{formatNumber(activeGA4.totalPageviews)}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">▲ +15.7% periode ini</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Rasio Pentalan (Bounce Rate)</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{activeGA4.avgBounceRate.toFixed(1)}%</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">▼ -2.1% (lebih sehat)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: YOUTUBE MEDIA */}
        <TabsContent value="youtube" className="flex flex-col gap-6 mt-4">
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <YoutubeIcon className="size-4 text-red-500" />
                    <span>Performa Saluran YouTube Resmi (30 Hari)</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Data penayangan, pelanggan, dan jam tonton video publikasi
                  </CardDescription>
                </div>
                <Link href="/integrasi-youtube">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
                    <Settings className="size-3" />
                    <span>Kelola Kanal</span>
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLiveMode && !youtubeMetrics && (
                <Alert className="mb-4 border-amber-500/30 bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <AlertTitle className="text-xs font-semibold">Kanal Belum Ditautkan</AlertTitle>
                  <AlertDescription className="text-xs">
                    Kanal YouTube belum diotorisasi via OAuth2. <Link href="/integrasi-youtube" className="underline font-semibold">Tautkan saluran</Link> untuk menarik metrik real-time.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Jumlah Pelanggan</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{formatNumber(activeYT.subscriberCount)}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">▲ +5.1% bln ini</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Total Tampilan Sepanjang Masa</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{formatNumber(activeYT.totalViewsCount)}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Akumulatif</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Tayangan 30 Hari Terakhir</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{formatNumber(activeYT.analyticsViews30d)}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">▲ +18.4% bln ini</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-1">Waktu Tonton (30 Hari)</div>
                  <div className="text-2xl font-bold font-mono text-foreground">{formatNumber(activeYT.analyticsWatchTimeMinutes30d)} min</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">▲ +9.6% bln ini</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: STATUS INTEGRASI */}
        <TabsContent value="integrasi" className="flex flex-col gap-6 mt-4">
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Daftar Lengkap Sambungan Saluran & API
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Ringkasan kesiapan token akses dan jadwal penarikan otomatis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">Google Analytics 4 API</div>
                      <div className="text-[11px] text-muted-foreground">Properti ID: GA4-3982410-ID</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs">
                    Aktif & Siaga
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">YouTube Data & Analytics v3</div>
                      <div className="text-[11px] text-muted-foreground">Channel: @HumasPemerintahRI</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs">
                    Aktif & Siaga
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">Meta Graph API (Instagram & Facebook)</div>
                      <div className="text-[11px] text-muted-foreground">Halaman Resmi Terverifikasi</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs">
                    Aktif & Siaga
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">TikTok Content API</div>
                      <div className="text-[11px] text-muted-foreground">Masa berlaku refresh token 7 hari</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-500 text-xs">
                    Perlu Pembaharuan
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/papan-proyek" className="group">
          <Card className="border-border/80 bg-card hover:border-primary/50 transition-all p-3.5">
            <div className="flex items-center gap-2.5">
              <KanbanSquare className="size-4 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-semibold text-foreground">Papan Proyek</div>
                <div className="text-[11px] text-muted-foreground">Kelola tugas tim</div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/kalender-konten" className="group">
          <Card className="border-border/80 bg-card hover:border-primary/50 transition-all p-3.5">
            <div className="flex items-center gap-2.5">
              <Calendar className="size-4 text-teal-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-semibold text-foreground">Kalender Konten</div>
                <div className="text-[11px] text-muted-foreground">Jadwal tayang</div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/pantauan-berita" className="group">
          <Card className="border-border/80 bg-card hover:border-primary/50 transition-all p-3.5">
            <div className="flex items-center gap-2.5">
              <Radio className="size-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-semibold text-foreground">Pantauan Berita</div>
                <div className="text-[11px] text-muted-foreground">Radar isu publik</div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/basis-pengetahuan" className="group">
          <Card className="border-border/80 bg-card hover:border-primary/50 transition-all p-3.5">
            <div className="flex items-center gap-2.5">
              <BookOpen className="size-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-semibold text-foreground">Basis Pengetahuan</div>
                <div className="text-[11px] text-muted-foreground">SOP & Panduan</div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
