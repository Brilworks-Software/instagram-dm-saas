# Socialora - Instagram DM Automation SaaS Platform

<div align="center">

![Socialora Logo](https://img.shields.io/badge/Socialora-Instagram%20DM%20Automation-purple?style=for-the-badge&logo=instagram)

**Automate and scale your Instagram direct messages with AI-powered features**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Support](#-support)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [Development](#-development)
- [Deployment](#-deployment)
- [Security](#-security)
- [Support](#-support)
- [Contributing](#-contributing)

## 🎯 Overview

**Socialora** is a comprehensive SaaS platform designed to help businesses, creators, and agencies automate and manage Instagram direct messages at scale. With AI-powered features, multi-account support, and advanced campaign management, Socialora streamlines your Instagram outreach and engagement.

### Key Benefits

- ⚡ **Save Time**: Automate repetitive DM tasks and responses
- 📈 **Scale Growth**: Reach more leads and customers efficiently
- 🤖 **AI-Powered**: Smart automation and intelligent responses
- 🔒 **Secure**: Enterprise-grade security and data protection
- 📊 **Analytics**: Track performance and optimize your strategy

## ✨ Features

### Core Features

- 🔐 **Multi-Account Management**: Connect and manage unlimited Instagram accounts from one dashboard
- 💬 **Unified Inbox**: View and manage all Instagram DMs from all accounts in one place
- 📊 **Campaign Management**: Create, schedule, and track DM campaigns with advanced targeting
- 🤖 **AI Automations**: Set up intelligent auto-responses based on keywords and triggers
- 👥 **Lead Generation**: Find and engage potential customers using hashtags, followers, and bio keywords
- 📈 **Analytics Dashboard**: Track campaign performance, response rates, and engagement metrics
- 🔔 **Smart Notifications**: Get notified about important messages and campaign updates
- 🎯 **Personalization**: Use variables to personalize messages at scale

### Advanced Features

- 🌐 **Direct Login**: Browser-based Instagram login without manual cookie management
- 🔄 **Auto-Reconnection**: Automatic account reconnection when cookies expire
- 💾 **Persistent Sessions**: Cookies saved securely in Supabase for seamless experience
- 🛡️ **Rate Limiting**: Built-in protection against Instagram rate limits
- 📱 **Chrome Extension**: One-click Instagram account connection
- 🔒 **Workspace Isolation**: Secure data separation for teams and agencies

## 🛠 Tech Stack

### Full-Stack Framework
- **Framework**: Next.js 14 (App Router) - Monorepo structure
- **Language**: TypeScript
- **API Routes**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (via Supabase or Vercel Postgres)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Zustand
- **Analytics**: PostHog

### Backend Services
- **Browser Automation**: Puppeteer (for Instagram login)
- **Instagram API**: instagram-private-api
- **Session Management**: Cookie-based authentication
- **Encryption**: AES-256-CBC for secure cookie storage

### Infrastructure
- **Database**: Supabase (PostgreSQL) or Vercel Postgres
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (recommended)
- **Deployment**: Vercel (automatic from GitHub)

### Extension
- **Platform**: Chrome Extension (Manifest V3)
- **Purpose**: Instagram session extraction
- **Versions**: Separate builds for Local and Production

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (Supabase recommended)
- **Chrome Browser** (for extension)
- **Supabase Account** (free tier works)

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/instagram-dm-saas.git
cd instagram-dm-saas

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp VERCEL_ENV_TEMPLATE.txt .env.local
# Edit .env.local with your credentials (see Configuration section)

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Run database migrations
npm run prisma:migrate:dev

# 6. Start development server
npm run dev
```

Visit `http://localhost:3000` and start using Socialora!

> ⚠️ **Important**: Make sure to set `DATABASE_URL` in your `.env.local` file. Without it, the application will fail with Prisma errors.

## 📦 Installation

### Step-by-Step Installation

#### 1. Clone Repository

```bash
git clone https://github.com/your-username/instagram-dm-saas.git
cd instagram-dm-saas
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Environment Setup

```bash
# Copy environment template
cp VERCEL_ENV_TEMPLATE.txt .env.local

# Edit .env.local with your credentials
# See Configuration section below for required variables
```

#### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

#### 5. Chrome Extension Setup

**For Local Development:**
```bash
cd extension
./build.sh
# Extract socialora-extension-local-v1.0.1.zip
# Load in Chrome as unpacked extension
```

**For Production:**
```bash
cd extension
./build.sh
# Use socialora-extension-prod-v1.0.1.zip for Chrome Web Store
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local` in the root directory:

```env
# Database (REQUIRED - Without this, the app will fail!)
# Get from: Vercel Postgres, Supabase, or other PostgreSQL provider
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# Supabase (REQUIRED)
# Get from: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Backend URL (Set after first deployment)
# For local: http://localhost:3000
# For production: https://your-project.vercel.app
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"

# Security (REQUIRED - Generate secure values!)
# Generate with: openssl rand -base64 32
JWT_SECRET="your-generated-secret-min-32-characters"
ENCRYPTION_KEY="your-generated-key-32-characters"

# Instagram OAuth (Optional)
META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
META_OAUTH_REDIRECT_URI="http://localhost:3000/api/instagram/callback"

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
```

> ⚠️ **CRITICAL**: The `DATABASE_URL` environment variable is **required** and must be in the correct format:
> 
> **Correct Format** (must start with `postgresql://` or `postgres://`):
> ```
> DATABASE_URL="postgresql://user:password@host:5432/database"
> ```
> 
> **Common Errors**:
> - ❌ Missing protocol: `user:password@host:5432/database` → ✅ Add `postgresql://` at the start
> - ❌ Extra spaces: ` postgresql://...` → ✅ Remove spaces before/after
> - ❌ Wrong format: `postgresql:user:password@host` → ✅ Use `postgresql://user:password@host:port/db`
> 
> If you see errors like:
> ```
> PrismaClientInitializationError: the URL must start with the protocol `postgresql://`
> ```
> Check that your `DATABASE_URL` starts with `postgresql://` or `postgres://` and has no extra spaces.
> 
> Make sure to set this in:
> - Local development: `.env.local` file
> - Vercel deployment: Project Settings → Environment Variables (no quotes needed in Vercel)

### Supabase Setup

1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Run Migrations**: Execute SQL migrations from `backend/prisma/migrations/` in Supabase SQL Editor
3. **Configure RLS**: Row-level security policies are included in migrations
4. **Set Up Auth**: Configure email templates (see `SUPABASE_EMAIL_TEMPLATES.md`)

## 📖 Usage Guide

### Connecting Instagram Accounts

Socialora offers three methods to connect Instagram accounts:

#### Method 1: Direct Login (Recommended) ⭐

1. Go to **Settings → Instagram Accounts**
2. Click **"Connect with Direct Login"**
3. Browser window opens - log in to Instagram
4. Account connects automatically!

**Benefits**: No manual steps, automatic reconnection, most secure

#### Method 2: Chrome Extension

1. Install Socialora Chrome Extension
2. Go to **Settings → Instagram Accounts**
3. Click **"Connect with Extension"**
4. Open Instagram and click extension icon
5. Click **"Grab Instagram Session"**

**Benefits**: One-click connection, works with existing Instagram session

#### Method 3: Manual Cookies (Advanced)

1. Go to **Settings → Instagram Accounts**
2. Click **"Connect with Cookies"**
3. Open Instagram in browser
4. Extract cookies from Developer Tools
5. Paste into Socialora

**Benefits**: Full control, works without extension

### Creating Your First Campaign

1. **Navigate to Campaigns**: Click "Campaigns" in sidebar
2. **Create Campaign**: Click "Create Campaign" button
3. **Select Account**: Choose which Instagram account to use
4. **Add Recipients**: Select contacts from your leads or add new ones
5. **Write Message**: Create personalized message template
   - Use `{name}`, `{username}`, `{firstname}` for personalization
6. **Configure Settings**: Set sending rate, delays, schedule
7. **Launch**: Start your campaign!

### Setting Up AI Automations

1. **Go to AI Studio**: Navigate from sidebar
2. **Create Automation**: Click "Create Automation"
3. **Set Triggers**: Define keywords or message types
4. **Write Response**: Create AI-powered response templates
5. **Choose Mode**: Manual review or fully automated
6. **Activate**: Enable the automation

### Finding Leads

1. **Go to Leads Page**: Navigate from sidebar
2. **Choose Search Method**:
   - **By Hashtag**: Find users with specific hashtags
   - **By Followers**: Get followers of target accounts
   - **By Bio Keywords**: Search user bios for keywords
3. **Review Results**: Filter and select potential leads
4. **Add to Contacts**: Save leads for campaigns

### Managing Inbox

1. **Select Account**: Choose Instagram account from dropdown
2. **View Conversations**: All DMs appear in sidebar
3. **Open Conversation**: Click to view messages
4. **Reply**: Type message and send
5. **Use AI Replies**: Click AI icon for suggested responses

## 🔧 Development

### Running Locally

```bash
# Start development server (runs both frontend and API routes)
npm run dev

# Runs on http://localhost:3000
# API routes available at http://localhost:3000/api/*
```

### Database Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create new migration
npm run prisma:migrate:dev -- --name migration_name

# View database in browser
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Extension Development

```bash
cd extension

# Build both versions
./build.sh

# Test locally
# 1. Extract socialora-extension-local-v1.0.1.zip
# 2. Load in Chrome as unpacked extension
# 3. Make changes to source files
# 4. Reload extension in chrome://extensions/
```

### Code Structure

```
instagram-dm-saas/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes (backend)
│   │   │   ├── instagram/    # Instagram API endpoints
│   │   │   ├── campaigns/     # Campaign API endpoints
│   │   │   └── notifications/# Notification API endpoints
│   │   ├── (auth)/           # Auth pages (login, signup)
│   │   ├── (dashboard)/      # Dashboard pages
│   │   ├── docs/             # Documentation
│   │   ├── privacy/          # Privacy policy
│   │   ├── terms/            # Terms of service
│   │   └── support/          # Support page
│   ├── components/           # React components
│   │   ├── ui/               # UI components
│   │   ├── layout/           # Layout components
│   │   └── inbox/            # Inbox components
│   ├── lib/                  # Utilities and services
│   │   ├── server/           # Server-side services
│   │   │   ├── instagram/    # Instagram services
│   │   │   ├── campaigns/     # Campaign services
│   │   │   ├── notifications/# Notification services
│   │   │   ├── prisma/       # Prisma client
│   │   │   └── auth.ts       # Auth helpers
│   │   ├── supabase/         # Supabase helpers
│   │   └── api.ts            # API client
│   ├── hooks/                # React hooks
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── extension/                # Chrome extension
│   ├── background.js         # Background script
│   ├── popup.html/js         # Extension popup
│   ├── manifest.json         # Extension manifest
│   └── build.sh              # Build script
├── package.json              # Dependencies
└── vercel.json               # Vercel configuration
```

## 🌐 Deployment

### Vercel Deployment (Recommended)

See detailed guide: [`VERCEL_DEPLOYMENT_GUIDE.md`](./VERCEL_DEPLOYMENT_GUIDE.md)

**Quick Deploy:**
1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `.` (root)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Set Environment Variables** (CRITICAL):
   - Go to Project Settings → Environment Variables
   - Add all variables from `VERCEL_ENV_TEMPLATE.txt`
   - **⚠️ IMPORTANT**: Make sure `DATABASE_URL` is set, otherwise you'll get 500 errors!
   - Set for: Production, Preview, and Development

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string (REQUIRED)
- `DIRECT_URL` - Direct database connection (usually same as DATABASE_URL)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `ENCRYPTION_KEY` - Generate with: `openssl rand -base64 32`
- `NEXT_PUBLIC_BACKEND_URL` - Your Vercel URL (set after first deployment)

> ⚠️ **Troubleshooting**: If you see `PrismaClientInitializationError: Environment variable not found: DATABASE_URL`, make sure to add `DATABASE_URL` in Vercel Project Settings → Environment Variables.

### Extension Deployment

See detailed guide: [`EXTENSION_DEPLOYMENT.md`](./EXTENSION_DEPLOYMENT.md)

1. Build production version: `cd extension && ./build.sh`
2. Upload `socialora-extension-prod-v1.0.1.zip` to Chrome Web Store
3. Fill in store listing details
4. Submit for review

## 🔐 Security

### Security Features

- ✅ **Row-Level Security (RLS)**: All database queries protected by Supabase RLS
- ✅ **Workspace Isolation**: Users can only access their own workspace data
- ✅ **Encrypted Storage**: Instagram cookies encrypted before storage
- ✅ **Secure Authentication**: Supabase Auth with email verification
- ✅ **HTTPS Only**: All communications encrypted in transit
- ✅ **Content Security Policy**: Strict CSP headers for XSS protection

### Best Practices

- Never commit `.env` files
- Use strong encryption keys (32+ characters)
- Regularly rotate JWT secrets
- Monitor for suspicious activity
- Keep dependencies updated

## 📚 Documentation

- 📖 **[Full Documentation](./src/app/docs/page.tsx)** - Complete user guide (available at `/docs`)
- 🚀 **[Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)** - Detailed Vercel deployment instructions
- 🔌 **[Extension Guide](./extension/README.md)** - Chrome extension setup
- 📧 **[Email Templates](./SUPABASE_EMAIL_TEMPLATES.md)** - Supabase email customization
- 🔐 **[Security Notes](./SECURITY_NOTES.md)** - Security information and vulnerabilities

## 🆘 Support

### Get Help

- 📖 **Documentation**: Visit `/docs` for detailed guides
- 💬 **Support Page**: Visit `/support` for FAQs and contact options
- 🐛 **Issues**: Open an issue on [GitHub Issues](https://github.com/your-username/instagram-dm-saas/issues)
- 📧 **Email**: digital@socialora.com

### Common Issues

- **Account disconnects**: Cookies expire - use Direct Login for auto-reconnection
- **Campaigns not sending**: Check account connection and rate limits
- **Extension not working**: Make sure you're using the correct version (local vs prod)
- **500 errors on Vercel**: Check that `DATABASE_URL` is set in Vercel Environment Variables
- **Prisma errors**: 
  - Error: "Environment variable not found: DATABASE_URL" → Set `DATABASE_URL` in Vercel
  - Error: "the URL must start with the protocol `postgresql://`" → Make sure `DATABASE_URL` starts with `postgresql://` or `postgres://` (no extra spaces, no quotes in Vercel)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Commit**: `git commit -m 'Add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow the existing code style

## 📝 License

[Your License Here]

## 🎯 Roadmap

### Upcoming Features

- [ ] WhatsApp integration
- [ ] Telegram integration
- [ ] Advanced AI models (GPT-4, Claude)
- [ ] Team collaboration features
- [ ] API access for developers
- [ ] Webhooks for integrations
- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics and reporting
- [ ] A/B testing for campaigns
- [ ] Scheduled campaigns with timezone support

### In Progress

- [x] Multi-account support
- [x] Direct Instagram login
- [x] Cookie persistence
- [x] AI automations
- [x] Lead generation
- [x] Analytics dashboard

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com)
- Analytics by [PostHog](https://posthog.com)

---

<div align="center">

**Built with ❤️ by the Socialora team**

[Website](https://www.socialora.app) • [Documentation](/docs) • [Support](/support) • [GitHub](https://github.com/your-username/instagram-dm-saas)

⭐ Star us on GitHub if you find this project helpful!

</div>
