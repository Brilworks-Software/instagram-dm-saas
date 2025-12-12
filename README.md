# Instagram DM SaaS

A comprehensive SaaS platform for managing Instagram direct messages, campaigns, and automations.

## Features

- 🔐 **Multi-Account Support**: Connect and manage multiple Instagram accounts
- 💬 **DM Management**: Send and receive Instagram direct messages
- 📊 **Campaign Management**: Create and manage DM campaigns with lead selection
- 🤖 **AI Automations**: Create intelligent automations for automated responses
- 📈 **Analytics**: Track campaign performance and message statistics
- 🔔 **Notifications**: Email, push, and in-app notifications
- 👥 **Lead Generation**: Find leads using hashtags, user bios, and followers
- 🎯 **Target Audience**: Quick-select presets for different audience types

## Tech Stack

### Backend
- **NestJS**: Node.js framework
- **Prisma**: ORM for database management
- **PostgreSQL**: Database (via Supabase)
- **Instagram Private API**: Instagram integration via cookie-based authentication

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling
- **Supabase**: Authentication and database client

### Extension
- **Chrome Extension**: One-click Instagram session extraction

## Project Structure

```
instagram-dm-saas/
├── backend/          # NestJS backend API
├── frontend/         # Next.js frontend application
└── extension/        # Chrome extension for Instagram auth
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Supabase)
- Chrome browser (for extension)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd instagram-dm-saas
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:

**Backend** (`backend/.env`):
```env
DATABASE_URL=your_postgresql_connection_string
DIRECT_URL=your_direct_postgresql_connection_string
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_character_encryption_key
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_META_APP_ID=your_meta_app_id
NEXT_PUBLIC_META_OAUTH_REDIRECT_URI=http://localhost:3000/api/instagram/callback
```

5. Run database migrations:
```bash
cd backend
npx prisma migrate dev
```

6. Start the backend:
```bash
cd backend
npm run start:dev
```

7. Start the frontend:
```bash
cd frontend
npm run dev
```

8. Load the Chrome extension:
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the `extension/` folder

## Usage

1. **Connect Instagram Account**:
   - Go to Settings > Instagram
   - Use the Chrome extension to grab your Instagram session
   - Or manually enter cookies

2. **Create Campaigns**:
   - Navigate to Campaigns
   - Create a new campaign
   - Select leads/contacts
   - Set message template
   - Start the campaign

3. **Set Up Automations**:
   - Go to AI Studio
   - Create automation rules
   - Set trigger keywords
   - Enable/disable as needed

4. **Find Leads**:
   - Go to Leads page
   - Search by hashtag (user bio)
   - Search by account followers
   - Add leads to your contacts

## Development

### Backend Development
```bash
cd backend
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Management
```bash
cd backend
npx prisma studio  # Open Prisma Studio
npx prisma migrate dev  # Create new migration
```

## Environment Variables

See `.env.example` files in each directory for required environment variables.

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]

