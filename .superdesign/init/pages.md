# Page Dependency Trees

## /pemantauan-kanal (Pemantauan Multi-Kanal)
Entry: `src/app/pemantauan-kanal/page.tsx`
Dependencies:
- `src/components/layout/HumasShell.tsx`
  - `src/components/layout/HumasSidebar.tsx`
  - `src/components/layout/HumasHeader.tsx`
- `src/components/channels/ChannelMonitoringView.tsx`
  - `src/components/channels/ChannelSummaryCard.tsx`
  - `src/components/channels/ChannelFilterBar.tsx`
  - `src/components/channels/ChannelDailyTrendChart.tsx`
  - `src/components/channels/ChannelFreshnessBadge.tsx`
  - `src/components/channels/ChannelConnectionStateNotice.tsx`
  - `src/components/channels/ChannelUnifiedMetricComparisonTable.tsx`

## /dasbor (Dasbor Utama & Metrik)
Entry: `src/app/dasbor/page.tsx`
Dependencies:
- `src/components/layout/HumasShell.tsx`
- KPI Cards & Sentiment Summary Widgets
- Quick Actions Bar

## /kalender-konten (Editorial Calendar)
Entry: `src/app/kalender-konten/page.tsx`
Dependencies:
- Calendar Grid & Weekly View
- Content Status Badges
- Filter Pillar & Channel
