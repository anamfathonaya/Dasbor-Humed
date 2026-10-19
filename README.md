# Dasboard Humed

> **Unified Media Operations Dashboard** untuk Tim Humas & Media Komnas Palestina

Dashboard terpadu yang menggabungkan analitik media sosial, monitoring berita, manajemen proyek, dan pemantauan infrastruktur dalam satu workspace.

---

## 🎯 Overview

Dasboard Humed adalah platform operasional lengkap yang dirancang untuk tim humas dan media, menggabungkan:

- 📊 **Analytics Dashboard** - Google Analytics 4, YouTube, Instagram, Facebook
- 📰 **News Monitoring** - RSS feeds, Telegram channels, Google News
- 📋 **Project Management** - Kanban board dengan drag-and-drop
- 📅 **Content Calendar** - Penjadwalan konten lintas platform
- 🖥️ **Infrastructure Monitoring** - VPS, cPanel, Synology NAS
- 📚 **Knowledge Base** - Basis pengetahuan dan SOP
- 🔐 **Role-Based Access** - Admin, Head, Staff, Reviewer

---

## ✨ Key Features

### Phase 1: Core Integrations ✅
- **Google Analytics 4**: OAuth, property discovery, 30-day metrics sync
- **YouTube**: Channel analytics, subscriber tracking, watch time
- **Database**: PostgreSQL (Supabase) + SQLite fallback
- **Security**: Row-Level Security, audit logging

### Phase 2: Dashboard & Workflows ✅
- **Enhanced Dashboard**: Live/demo toggle, GA4 & YouTube widgets
- **Google Drive Picker**: File selection for task attachments
- **RSS & Telegram**: Automated news monitoring and sync
- **Kanban Board**: Project management with drag-and-drop

### Phase 3: Infrastructure & Meta ✅
- **Instagram**: OAuth flow, Professional account insights
- **Facebook**: Page OAuth, insights sync
- **VPS Monitoring**: CPU, RAM, disk, services, uptime
- **cPanel**: Disk, bandwidth, email quotas, SSL certificates
- **Synology NAS**: Storage, backup jobs, user access

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (Supabase recommended) or SQLite
- Google Cloud project with OAuth credentials
- Meta Developer app (for Instagram/Facebook)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/dasbor-humed.git
cd dasbor-humed

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npm run db:init

# Start development server
npm run next:dev
```

Open http://localhost:3000

### First-Time Setup

1. **Connect Google Analytics:**
   - Navigate to `/pengaturan`
   - Click "Hubungkan Google Analytics"
   - Complete OAuth flow

2. **Connect YouTube:**
   - Navigate to `/integrasi-youtube`
   - Click "Hubungkan YouTube Channel"
   - Complete OAuth flow

3. **Setup News Sources:**
   - Navigate to `/pantauan-berita`
   - Click "Tarik Berita" to sync RSS and Telegram

4. **Monitor Infrastructure:**
   - Navigate to `/infrastruktur`
   - View VPS, cPanel, and NAS metrics

---

## 📚 Documentation

### Complete Guides
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[SETUP.md](./SETUP.md)** - Environment configuration
- **[README_PHASE1.md](./README_PHASE1.md)** - GA4 & YouTube integration
- **[README_PHASE2.md](./README_PHASE2.md)** - Dashboard & workflows
- **[README_PHASE3.md](./README_PHASE3.md)** - Infrastructure & Meta
- **[PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md)** - Technical implementation details

### Key Sections
- Environment variables → `SETUP.md`
- Google Cloud setup → `SETUP.md` + `DEPLOYMENT.md`
- Meta Developer setup → `DEPLOYMENT.md`
- OAuth troubleshooting → `SETUP.md`
- Infrastructure monitoring → `README_PHASE3.md`

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 16.4.2 (App Router)
- React 19
- TypeScript
- CSS Modules (dark theme)

**Backend:**
- Next.js API Routes
- PostgreSQL (Supabase) + SQLite fallback
- Server-side OAuth flows
- Encrypted token storage

**Integrations:**
- Google Analytics Data API v1
- YouTube Data API v3 & Analytics API
- Meta Graph API (Instagram & Facebook)
- RSS/Atom feed parsing
- Telegram web scraping

**Infrastructure:**
- SSH for VPS monitoring
- cPanel UAPI
- Synology DSM API

### Project Structure

```
dasbor-humed/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── channels/      # Social media APIs
│   │   │   ├── integrations/  # GA4, YouTube APIs
│   │   │   ├── infrastructure/# VPS, cPanel, NAS APIs
│   │   │   └── news/          # RSS, Telegram APIs
│   │   ├── dasbor/            # Main dashboard
│   │   ├── integrasi-*/       # Integration pages
│   │   ├── infrastruktur/     # Infrastructure monitoring
│   │   └── ...                # Other pages
│   ├── components/            # React components
│   │   ├── channels/          # Social media UI
│   │   ├── dasbor/            # Dashboard widgets
│   │   ├── integrations/      # Integration connectors
│   │   └── layout/            # Shell, navigation
│   └── lib/                   # Services & utilities
│       ├── *Service.ts        # Business logic
│       ├── db.ts              # Database client
│       └── ...
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── DEPLOYMENT.md              # Deployment guide
├── README.md                  # This file
└── package.json
```

---

## 🔐 Security

### Implemented Protections

- ✅ **OAuth State CSRF** - Random state parameter validation
- ✅ **HTTP-Only Cookies** - Sensitive data never in JavaScript
- ✅ **Token Encryption** - Server-side encryption via HMAC-SHA256
- ✅ **Row-Level Security** - Database policies per role
- ✅ **Audit Logging** - All sensitive operations logged
- ✅ **API Rate Limiting** - (Configure in production)

### Best Practices

- Never commit `.env` files
- Rotate OAuth secrets quarterly
- Use SSH keys for VPS access (not passwords)
- Enable 2FA on all admin accounts
- Review audit logs weekly
- Keep dependencies updated

---

## 🧪 Testing

### Run Tests

```bash
# Type checking
npm run type-check

# Build test
npm run next:build

# Lint
npm run lint
```

### Manual Testing Checklist

- [ ] Google Analytics OAuth flow
- [ ] YouTube OAuth flow
- [ ] Instagram OAuth flow
- [ ] Facebook OAuth flow
- [ ] News sync (RSS + Telegram)
- [ ] Dashboard live/demo toggle
- [ ] Infrastructure metrics load
- [ ] Kanban drag-and-drop

---

## 📊 Monitoring & Observability

### Built-in Features

- Audit logs at `/jejak-audit`
- Integration status at `/status-integrasi`
- Health check at `/api/health`

### Recommended Tools

- **Error Tracking:** Sentry
- **Uptime Monitoring:** UptimeRobot
- **Log Aggregation:** Better Stack (Logtail)
- **Performance:** Vercel Analytics

---

## 🤝 Contributing

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description

Co-Authored-By: Your Name <your.email@example.com>"

# Push and create PR
git push origin feature/your-feature
```

### Commit Convention

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Testing
- `chore:` - Maintenance

---

## 📝 Environment Variables Reference

### Required Variables

```bash
# Application
NODE_ENV=development|production
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NEXT_PUBLIC_GOOGLE_API_KEY=

# Meta OAuth
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=

# Security
CHANNEL_TOKEN_SECRET=
```

See `SETUP.md` for complete list and setup instructions.

---

## 🎯 Roadmap

### ✅ Completed (Phase 1-3)

- Google Analytics 4 integration
- YouTube integration
- Instagram & Facebook integration
- RSS & Telegram news monitoring
- Infrastructure monitoring (VPS, cPanel, NAS)
- Project kanban board
- Enhanced dashboard

### 🔜 Future Enhancements

- TikTok Marketing API integration
- Google Search Console integration
- Twitter/X API integration
- LinkedIn Pages integration
- WhatsApp Business API
- Automated SSL renewal
- Historical metrics & trending
- Email/Slack notifications
- Cost tracking dashboard
- SLA reporting

---

## 📞 Support

### Documentation
- Setup guide: `SETUP.md`
- Deployment: `DEPLOYMENT.md`
- Phase summaries: `README_PHASE*.md`

### Issues
- Report bugs via GitHub Issues
- Feature requests welcome

### Contact
- Email: support@yourdomain.com
- Slack: #dasboard-support

---

## 📜 License

Copyright © 2026 Komnas Palestina  
All rights reserved.

---

## ✨ Credits

**Developed by:** Claude Code (Anthropic)  
**Organization:** Komnas Palestina  
**Project Type:** Unified Media Operations Dashboard  
**Tech Stack:** Next.js 16, React 19, PostgreSQL, TypeScript  
**Implementation:** Complete (Phases 1-3)

---

## 🎉 Acknowledgments

Special thanks to:
- Google Cloud Platform (Analytics & YouTube APIs)
- Meta Developers (Instagram & Facebook APIs)
- Supabase (Database hosting)
- Vercel (Deployment platform)
- Open source community

---

**Built with ❤️ for media operations teams**

*Dasboard Humed - Making media operations management effortless*
