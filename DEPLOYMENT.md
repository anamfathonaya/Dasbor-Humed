# Dasboard Humed - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Code Readiness
- [x] All 3 phases implemented (Phase 1, 2, 3)
- [x] Build passing (`npm run next:build`)
- [x] TypeScript errors resolved
- [x] All features documented
- [x] Git commits clean with attribution

### 🔐 Security Review
- [x] OAuth state CSRF protection implemented
- [x] Tokens encrypted server-side
- [x] HTTP-only cookies for sensitive data
- [x] API keys never exposed to client
- [x] Audit logging enabled
- [ ] Environment variables secured (production)
- [ ] Rate limiting configured (production)

### 📚 Documentation
- [x] README_PHASE1.md
- [x] README_PHASE2.md
- [x] README_PHASE3.md
- [x] SETUP.md
- [x] PHASE1_SUMMARY.md
- [x] This deployment guide

---

## 🚀 Step 1: Environment Setup

### Required Environment Variables

Create `.env.production` file:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://humed.yourdomain.com

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# Google OAuth (GA4 & YouTube)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://humed.yourdomain.com/api/integrations/google-analytics/callback
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_for_picker

# Meta (Instagram & Facebook)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=https://humed.yourdomain.com/api/channels/meta/instagram/oauth/callback

# Encryption
CHANNEL_TOKEN_SECRET=your_random_64_char_secret_key_here
META_APP_SECRET=your_meta_app_secret_for_token_encryption

# Infrastructure (optional - for monitoring)
VPS_SSH_KEY=path_to_ssh_private_key_or_base64_encoded
CPANEL_API_TOKEN=your_cpanel_api_token
SYNOLOGY_DSM_PASSWORD=your_dsm_password

# Optional: Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@yourdomain.com
SMTP_PASSWORD=your_smtp_password
```

### Generate Secrets

```bash
# Generate random secret for token encryption
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate OAuth state secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌐 Step 2: Google Cloud Setup

### 1. Create Google Cloud Project

1. Visit https://console.cloud.google.com/
2. Create new project: "Dasboard Humed Production"
3. Note the project ID

### 2. Enable Required APIs

```
✓ Google Analytics Data API
✓ Google Analytics Admin API
✓ YouTube Data API v3
✓ YouTube Analytics API
✓ Google Drive API (for file picker)
```

### 3. Create OAuth 2.0 Credentials

**Application Type:** Web application

**Authorized Redirect URIs:**
```
https://humed.yourdomain.com/api/integrations/google-analytics/callback
https://humed.yourdomain.com/api/channels/youtube/oauth/callback
```

**Authorized JavaScript Origins:**
```
https://humed.yourdomain.com
```

### 4. OAuth Consent Screen

- User Type: External (or Internal if using Google Workspace)
- App Name: Dasboard Humed
- User support email: admin@yourdomain.com
- Scopes:
  - `https://www.googleapis.com/auth/analytics.readonly`
  - `https://www.googleapis.com/auth/youtube.readonly`
  - `https://www.googleapis.com/auth/yt-analytics.readonly`

### 5. Test Users (while in testing mode)

Add email addresses that can test OAuth flow before publishing app.

---

## 📱 Step 3: Meta Developer Setup

### 1. Create Meta App

1. Visit https://developers.facebook.com/apps/
2. Create App → Business
3. Add products:
   - Facebook Login
   - Instagram Basic Display

### 2. Configure Facebook Login

**Valid OAuth Redirect URIs:**
```
https://humed.yourdomain.com/api/channels/meta/instagram/oauth/callback
https://humed.yourdomain.com/api/channels/meta/facebook/oauth/callback
```

### 3. Configure Instagram Basic Display

1. Add Instagram App ID
2. Configure redirect URIs (same as above)
3. Add Instagram Testers (while in development mode)

### 4. App Review (for production)

Required permissions to request:
- `instagram_basic`
- `instagram_manage_insights`
- `pages_show_list`
- `pages_read_engagement`
- `read_insights`

**Note:** Must provide screen recording and use case explanation.

### 5. Business Verification

For `instagram_manage_insights` and `read_insights`, Meta requires:
- Business verification
- Privacy policy URL
- Terms of service URL
- Use case explanation

---

## 🗄️ Step 4: Database Setup (Supabase)

### 1. Create Supabase Project

1. Visit https://supabase.com
2. New Project → "Dasboard Humed Production"
3. Note connection details

### 2. Run Migrations

```bash
# Apply all migrations from supabase/migrations/
psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
psql $DATABASE_URL -f supabase/migrations/002_social_channels.sql
# ... run all migrations in order
psql $DATABASE_URL -f supabase/migrations/013_google_analytics_integration.sql
```

### 3. Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE social_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_connected_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_connected_accounts ENABLE ROW LEVEL SECURITY;
-- ... etc for all sensitive tables

-- Create policies (example)
CREATE POLICY "Allow authenticated users to view channels"
ON social_channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admins to manage channels"
ON social_channels FOR ALL
TO authenticated
USING (
  current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'head')
);
```

### 4. Create Database Backup Schedule

In Supabase dashboard:
- Settings → Database → Automated backups
- Enable daily backups with 7-day retention

---

## ☁️ Step 5: Deploy to Vercel (Recommended)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# From project root
vercel

# Follow prompts:
# - Project name: dasboard-humed
# - Framework: Next.js
# - Root directory: ./
```

### 4. Set Environment Variables

```bash
# Via CLI
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add META_APP_ID
# ... add all environment variables

# Or via Vercel Dashboard:
# Project Settings → Environment Variables
```

### 5. Deploy to Production

```bash
vercel --prod
```

### 6. Configure Custom Domain

In Vercel dashboard:
- Settings → Domains
- Add domain: humed.yourdomain.com
- Update DNS records as instructed

---

## 🐳 Alternative: Deploy with Docker

### 1. Create Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run next:build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

### 2. Build and Run

```bash
# Build image
docker build -t dasboard-humed:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name dasboard-humed \
  dasboard-humed:latest
```

### 3. Docker Compose (with database)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - postgres
      
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: dasboard_humed
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

---

## 🔐 Step 6: Infrastructure Access Setup

### VPS Monitoring Setup

```bash
# Generate SSH key for monitoring
ssh-keygen -t ed25519 -C "dasboard-monitoring" -f ~/.ssh/dasboard_monitor

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/dasboard_monitor.pub admin@your-vps.com

# Add private key to environment
PRIVATE_KEY=$(cat ~/.ssh/dasboard_monitor | base64)
vercel env add VPS_SSH_KEY $PRIVATE_KEY
```

### cPanel API Token

1. Log into cPanel
2. Security → Manage API Tokens
3. Create Token:
   - Name: "Dasboard Monitoring"
   - Expiry: Never (or 1 year)
   - Permissions: Full Access
4. Copy token to environment variable

### Synology DSM Setup

1. Create dedicated user: `dasboard-monitor`
2. Permissions: Read-only
3. Enable 2FA
4. Note credentials for environment variables

---

## 📊 Step 7: Post-Deployment Verification

### 1. Health Check

```bash
# Test API health
curl https://humed.yourdomain.com/api/health

# Expected response:
# {"ok":true,"status":"healthy","timestamp":"..."}
```

### 2. OAuth Flow Tests

**Google Analytics:**
1. Navigate to `/pengaturan`
2. Click "Hubungkan Google Analytics"
3. Complete OAuth flow
4. Verify property appears

**YouTube:**
1. Navigate to `/integrasi-youtube`
2. Click "Hubungkan YouTube Channel"
3. Complete OAuth flow
4. Verify channel appears with metrics

**Instagram:**
1. Navigate to `/integrasi-meta`
2. Click "Hubungkan Instagram"
3. Complete OAuth flow
4. Verify account appears

**Facebook:**
1. Navigate to `/integrasi-meta`
2. Click "Hubungkan Facebook Page"
3. Complete OAuth flow
4. Verify page appears

### 3. Feature Smoke Tests

```bash
# Test news sync
curl -X POST https://humed.yourdomain.com/api/news/sync-all

# Test infrastructure monitoring
curl https://humed.yourdomain.com/api/infrastructure/vps

# Test Meta accounts
curl https://humed.yourdomain.com/api/channels/meta/accounts
```

### 4. Dashboard Load Test

1. Visit `/dasbor`
2. Toggle live/demo mode
3. Verify GA4 and YouTube widgets load
4. Check console for errors

---

## 📈 Step 8: Monitoring & Alerts

### 1. Setup Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to `.env.production`:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### 2. Setup Uptime Monitoring

**Recommended Services:**
- UptimeRobot (free tier: 50 monitors)
- Pingdom
- StatusCake

**Endpoints to Monitor:**
```
https://humed.yourdomain.com/api/health (every 5 min)
https://humed.yourdomain.com/dasbor (every 15 min)
```

### 3. Setup Log Aggregation

**Vercel Built-in:**
- Project → Logs
- Filter by level: error, warning

**Alternative: Better Stack (formerly Logtail)**
```bash
npm install @logtail/node @logtail/next

# Add to middleware
import { Logtail } from '@logtail/node';
const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
```

### 4. Database Monitoring

**Supabase Dashboard:**
- Database → Usage
- Set up alerts for:
  - Connection count > 80%
  - Disk usage > 80%
  - Long-running queries

---

## 👥 Step 9: User Management

### 1. Create Admin Accounts

```sql
-- Insert admin user
INSERT INTO users (email, role, name, created_at)
VALUES 
  ('admin@yourdomain.com', 'admin', 'Admin Humas', NOW()),
  ('kepala@yourdomain.com', 'head', 'Kepala Bidang', NOW());
```

### 2. Role-Based Access Control

**Roles:**
- `admin` - Full access (OAuth connections, settings)
- `head` - Management access (view all, manage team)
- `staff` - Standard access (view, create content)
- `reviewer` - Review only

**Implementation:**
```typescript
// In middleware or API routes
const userRole = req.cookies.get('user_role')?.value;
if (!['admin', 'head'].includes(userRole)) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}
```

---

## 🔄 Step 10: Backup & Recovery

### 1. Database Backups

**Automated (Supabase):**
- Enabled by default
- Daily snapshots
- 7-day retention

**Manual Backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20261019.sql
```

### 2. Code Backups

```bash
# Git push to remote
git push origin main

# Tag releases
git tag -a v1.0.0 -m "Phase 3 Complete - Production Ready"
git push origin v1.0.0
```

### 3. Environment Variables Backup

```bash
# Export from Vercel
vercel env pull .env.backup

# Store securely (1Password, AWS Secrets Manager, etc.)
```

---

## 📖 Step 11: User Training

### 1. Create User Guide

Documentation should cover:
- Login and role permissions
- Connecting social media accounts
- Reading dashboard metrics
- News monitoring workflow
- Project kanban usage
- Content calendar
- Infrastructure monitoring

### 2. Video Tutorials (Recommended)

- Dashboard Overview (5 min)
- Connecting Google Analytics (3 min)
- Connecting YouTube (3 min)
- Connecting Instagram & Facebook (5 min)
- Using Project Kanban (5 min)
- Monitoring Infrastructure (3 min)

### 3. Support Channels

- Email: support@yourdomain.com
- Documentation: https://docs.yourdomain.com
- Slack channel: #dasboard-support

---

## 🎯 Success Metrics

### Week 1 Targets:
- [ ] All admin users trained
- [ ] GA4 property connected
- [ ] YouTube channel connected
- [ ] At least 1 Instagram account connected
- [ ] RSS feeds pulling news
- [ ] Infrastructure monitoring active

### Month 1 Targets:
- [ ] All team members onboarded
- [ ] Daily active usage
- [ ] 5+ projects in kanban
- [ ] 20+ content items scheduled
- [ ] Zero critical bugs

---

## 🆘 Troubleshooting

### Common Issues:

**OAuth redirect mismatch:**
```
Error: redirect_uri_mismatch
Solution: Check redirect URIs in Google/Meta console match exactly
```

**Database connection fails:**
```
Error: Connection timeout
Solution: Verify DATABASE_URL and firewall rules
```

**Token encryption fails:**
```
Error: Invalid encryption key
Solution: Ensure CHANNEL_TOKEN_SECRET is 32+ characters
```

**Build fails:**
```
Error: Module not found
Solution: Run npm install, verify all dependencies
```

---

## ✅ Deployment Complete Checklist

- [ ] Environment variables configured
- [ ] Google Cloud OAuth working
- [ ] Meta OAuth working
- [ ] Database migrated
- [ ] Application deployed
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error tracking enabled
- [ ] Uptime monitoring configured
- [ ] Database backups scheduled
- [ ] Admin accounts created
- [ ] User training scheduled
- [ ] Documentation published

---

**🎉 Ready for Production! 🎉**

For support: Refer to README_PHASE1.md, README_PHASE2.md, README_PHASE3.md
