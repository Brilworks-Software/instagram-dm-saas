# Vercel Single Project Migration

This project has been migrated from a separate frontend/backend structure to a single Next.js project for Vercel deployment.

## Structure

```
instagram-dm-saas/
├── src/
│   ├── app/              # Next.js app directory (pages + API routes)
│   │   ├── api/          # API routes (converted from NestJS)
│   │   └── (dashboard)/  # Frontend pages
│   ├── lib/              # Shared libraries
│   │   └── backend/      # Backend services (converted from NestJS)
│   └── components/       # React components
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── package.json          # Single package.json for all dependencies
└── vercel.json           # Vercel configuration
```

## API Routes

All backend endpoints are now Next.js API routes in `src/app/api/`:

- `/api/instagram/cookie/verify` - Verify Instagram cookies
- `/api/instagram/cookie/connect` - Connect Instagram account
- More routes can be added as needed

## Environment Variables

Create `.env.local` with:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
NEXT_PUBLIC_BACKEND_URL="https://instagram-dm-saas-h94m.vercel.app"
```

## Deployment to Vercel

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## Development

```bash
npm install
npm run dev
```

## Database

Prisma is configured at the root level. Run migrations:

```bash
npm run prisma:migrate:dev
npm run prisma:generate
```

