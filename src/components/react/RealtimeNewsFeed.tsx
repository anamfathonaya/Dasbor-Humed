import React, { useState, useEffect } from 'react';

interface NewsItem {
  id: number;
  title: string;
  source_name: string;
  source_type: string;
  category: string;
  published_at: string;
  is_important: number;
  summary: string;
}

export default function RealtimeNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchNews = async () => {
    try {
      const url = `/api/news/stream?type=${filterType}&limit=6`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setNews(data.items);
          setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (e) {
      console.error('Error fetching news:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Auto-polling pemantauan berita setiap 15 detik (realtime feed)
    const timer = setInterval(fetchNews, 15000);
    return () => clearInterval(timer);
  }, [filterType]);

  return (
    <div className="dasbor__card">
      <div className="dasbor__card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dasbor__card-title">Pantauan Berita Terkini (Live Stream)</h2>
          <p className="dasbor__card-sub">
            Sinkron otomatis setiap 15 detik • Terakhir: <b>{lastUpdated || 'Memuat...'}</b>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`dasbor__btn ${filterType === 'all' ? 'dasbor__btn--primary' : ''}`}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterType('rss')}
            className={`dasbor__btn ${filterType === 'rss' ? 'dasbor__btn--primary' : ''}`}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            RSS
          </button>
          <button
            type="button"
            onClick={() => setFilterType('telegram')}
            className={`dasbor__btn ${filterType === 'telegram' ? 'dasbor__btn--primary' : ''}`}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            Telegram
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        {loading && news.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-muted, #5a6875)', fontSize: '13px' }}>
            Memuat aliran berita realtime...
          </div>
        ) : news.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-muted, #5a6875)', fontSize: '13px' }}>
            Belum ada berita masuk pada kanal ini.
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #ebecee)',
                background: 'var(--color-canvas, #f8f9fa)',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="dasbor__badge dasbor__badge--blue" style={{ fontSize: '10px' }}>
                    {item.source_name}
                  </span>
                  {item.is_important ? (
                    <span className="dasbor__badge dasbor__badge--amber" style={{ fontSize: '10px' }}>
                      Prioritas
                    </span>
                  ) : null}
                  <span style={{ fontSize: '11px', color: 'var(--color-muted, #5a6875)' }}>
                    {item.published_at}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #16202b)' }}>
                  {item.title}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-muted, #5a6875)', lineHeight: 1.4 }}>
                  {item.summary}
                </p>
              </div>
              <a
                href="/pantauan-berita"
                className="dasbor__btn"
                style={{ fontSize: '11px', padding: '4px 8px', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                Rujuk
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
