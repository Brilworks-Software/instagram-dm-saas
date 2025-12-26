# eBook Lead Capture Setup Guide

## ✅ What's Been Set Up

1. **Lead Capture Form Component** (`src/components/ebook/lead-capture-form.tsx`)
   - Simple form with email OR Instagram username
   - Minimal clicks - just one field required
   - Beautiful UX with icons and validation

2. **API Route** (`src/app/api/ebook/download/route.ts`)
   - Handles form submission
   - Stores leads in Supabase
   - Generates signed download URLs from Supabase Storage

3. **Updated eBook Page** (`src/app/ebook/increase-instagram-followers-reach-engagement/page.tsx`)
   - Shows lead capture form first
   - Auto-downloads after submission
   - Success state with download link

4. **Database Migration** (`supabase/migrations/001_create_ebook_leads_table.sql`)
   - Creates `ebook_leads` table in Supabase
   - Tracks email, Instagram username, download time
   - Includes RLS policies

5. **Upload Script** (`scripts/upload-ebook-to-supabase.js`)
   - Uploads PDF from local path to Supabase Storage
   - Creates storage bucket if needed
   - Verifies upload

## 🚀 Setup Steps

### Step 1: Run Database Migration

Run the SQL migration in your Supabase Dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_create_ebook_leads_table.sql`
3. Run the SQL to create the table

Or use Supabase CLI:
```bash
supabase db push
```

### Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `ebooks`
4. Set to **Private** (we'll use signed URLs)
5. Optional: Set file size limit to 10MB
6. Optional: Set allowed MIME types to `application/pdf`

### Step 3: Upload PDF to Supabase Storage

**Option A: Using the Script (Recommended)**

1. Ensure your PDF is at: `/home/brilworks/Downloads/increase-instagram-followers-reach-engagement.pdf`
2. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
   (Get from Supabase Dashboard → Settings → API → service_role key)
3. Run:
   ```bash
   node scripts/upload-ebook-to-supabase.js
   ```

**Option B: Manual Upload**

1. Go to Supabase Dashboard → Storage → `ebooks` bucket
2. Click "Upload file"
3. Upload: `increase-instagram-followers-reach-engagement.pdf`
4. Ensure file is named exactly: `increase-instagram-followers-reach-engagement.pdf`

### Step 4: Test the Flow

1. Visit: `http://localhost:3000/ebook/increase-instagram-followers-reach-engagement`
2. Fill in email OR Instagram username
3. Click "Download Free eBook"
4. PDF should download automatically
5. Check Supabase Dashboard → Table Editor → `ebook_leads` to see the lead

## 📊 Viewing Leads

To view collected leads:

1. Go to Supabase Dashboard → Table Editor
2. Select `ebook_leads` table
3. See all downloads with email/Instagram username and timestamp

## 🔧 Configuration

### Environment Variables

Make sure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Only needed for upload script
```

### Storage Bucket Settings

- **Name:** `ebooks`
- **Public:** `false` (private)
- **File size limit:** 10MB (or larger if needed)
- **Allowed MIME types:** `application/pdf`

## 🎨 Customization

### Change Form Fields

Edit `src/components/ebook/lead-capture-form.tsx`:
- Add more fields
- Change validation
- Customize styling

### Change Storage Path

Edit `src/app/api/ebook/download/route.ts`:
- Change bucket name: `'ebooks'`
- Change file name: `'increase-instagram-followers-reach-engagement.pdf'`

### Change Download Behavior

Edit `src/app/ebook/increase-instagram-followers-reach-engagement/page.tsx`:
- Modify `handleDownloadSuccess` function
- Change success message
- Add redirect after download

## 🐛 Troubleshooting

### "Failed to generate download link"

- Check that PDF is uploaded to Supabase Storage
- Verify bucket name is `ebooks`
- Verify file name matches exactly
- Check Supabase Storage permissions

### "Error storing lead"

- Check that `ebook_leads` table exists
- Verify RLS policies allow inserts
- Check Supabase connection

### Upload Script Fails

- Verify PDF exists at specified path
- Check SUPABASE_SERVICE_ROLE_KEY is set
- Try creating bucket manually first
- Check file size (should be < 10MB by default)

## 📈 Next Steps

1. **Analytics:** Track downloads in your analytics tool
2. **Email Integration:** Send welcome email after download
3. **Follow-up:** Set up email sequences for leads
4. **A/B Testing:** Test different form variations
5. **Dashboard:** Build admin dashboard to view leads

## ✅ Checklist

- [ ] Database migration run
- [ ] Storage bucket created
- [ ] PDF uploaded to Supabase Storage
- [ ] Environment variables set
- [ ] Form tested locally
- [ ] Download works correctly
- [ ] Leads are being stored

