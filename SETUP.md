# Dasboard Humed - Setup Instructions

## Prerequisites

1. **Node.js** 24+ and npm
2. **Google Cloud Project** with OAuth credentials
3. **Supabase Project** (optional - falls back to SQLite)

## Environment Setup

Create a `.env` file in the root directory:

```bash
# Google OAuth (required for GA4 and YouTube)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google-analytics/callback

# Supabase (optional - uses SQLite if not configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Google Analytics Data API
   - Google Analytics Admin API
   - YouTube Data API v3
   - YouTube Analytics API
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/integrations/google-analytics/callback`
   - `http://localhost:3000/api/channels/youtube/oauth/callback`
   - Add your production domain when deploying
7. Copy **Client ID** and **Client Secret** to `.env`

### 2. Configure OAuth Consent Screen

1. Navigate to **OAuth consent screen**
2. User Type: **External** (or Internal if using Workspace)
3. Add scopes:
   - `.../auth/analytics.readonly`
   - `.../auth/youtube.readonly`
   - `.../auth/yt-analytics.readonly`
4. Add test users (your Google account email)
5. Save and continue

## Database Setup

### Option A: Supabase (Recommended for Production)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy connection details to `.env`
3. Run migrations:
   ```bash
   # Apply all migrations from supabase/migrations/
   npm run migrate:supabase
   ```

### Option B: SQLite (Local Development)

No setup needed - `dasbor.db` is created automatically on first run.

## Installation

```bash
# Install dependencies
npm install

# Run database initialization (creates tables)
npm run db:init

# Start development server
npm run next:dev
```

## First-Time Usage

### 1. Access the Application

Open http://localhost:3000

### 2. Connect Google Analytics 4

1. Navigate to **Pengaturan** (Settings) page
2. Scroll to **Google Analytics 4** section
3. Click **Hubungkan Google Analytics**
4. Sign in with Google account that has GA4 access
5. Grant permissions
6. Select property to connect
7. Wait for automatic first sync

### 3. Connect YouTube

1. Navigate to **Penghubung YouTube** page
2. Click **Hubungkan YouTube Channel**
3. Sign in with Google account that owns the channel
4. Grant YouTube permissions
5. Channel will appear with subscriber count
6. Click **Tarik Analytics** to fetch 30-day metrics

### 4. View Data

- **Main Dashboard** (`/dasbor`) - Overview of all metrics
- **Channel Monitoring** (`/pemantauan-kanal`) - Social media analytics
- **Reports** (`/laporan-kinerja`) - Performance reports

## API Endpoints Reference

### Google Analytics 4
- `GET /api/integrations/google-analytics/start` - Initiate OAuth
- `GET /api/integrations/google-analytics/callback` - OAuth callback
- `GET /api/integrations/google-analytics/properties` - List properties
- `POST /api/integrations/google-analytics/sync` - Sync metrics

### YouTube
- `GET /api/channels/youtube/oauth/start` - Initiate OAuth
- `GET /api/channels/youtube/oauth/callback` - OAuth callback
- `GET /api/channels/youtube/route` - List channels
- `POST /api/channels/youtube/sync` - Sync analytics

## Troubleshooting

### OAuth Error: redirect_uri_mismatch

**Solution:** Add the exact callback URL to Google Cloud Console authorized redirect URIs.

### No properties found (GA4)

**Solution:** Ensure your Google account has at least Editor access to a GA4 property.

### Token expired

**Solution:** Click reconnect button in the integration UI. Tokens refresh automatically but may need manual reconnection after 7 days.

### Database connection error (Supabase)

**Solution:** Verify `NEXT_PUBLIC_SUPABASE_URL` and keys in `.env`. App will fall back to SQLite if Supabase is misconfigured.

## Development Commands

```bash
# Development
npm run next:dev          # Start Next.js dev server
npm run dev               # Start Astro dev server (legacy)

# Build
npm run next:build        # Build for production
npm run build             # Build Astro (legacy)

# Database
npm run db:init           # Initialize SQLite schema
npm run migrate:supabase  # Apply Supabase migrations
```

## Production Deployment

### Vercel Deployment

1. Push to GitHub repository
2. Import in Vercel dashboard
3. Add environment variables (all from `.env`)
4. Deploy
5. Update OAuth redirect URIs in Google Console with production domain

### Supabase Production

1. Apply all migrations in Supabase dashboard SQL editor
2. Enable Row Level Security (RLS) policies
3. Create service role API key for backend operations
4. Configure environment variables in hosting platform

## Security Notes

- Never commit `.env` to git
- Use encrypted credential storage in production
- Rotate OAuth secrets periodically
- Enable 2FA on Google accounts with GA4/YouTube access
- Review audit logs regularly at `/jejak-audit`

## Support & Documentation

- **Phase 1 Summary:** `PHASE1_SUMMARY.md`
- **Architecture:** See feasibility matrix in initial prompt
- **Database Schema:** `supabase/migrations/` folder
- **API Docs:** Each route file has JSDoc comments

---

**Current Phase:** Phase 1 Complete (95%)
**Next:** Phase 2 - Team Workflows & Content Management
