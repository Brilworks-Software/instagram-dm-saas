#!/usr/bin/env node

/**
 * Script to upload eBook PDF to Supabase Storage
 * 
 * Usage:
 *   node scripts/upload-ebook-to-supabase.js
 * 
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (or SUPABASE_SERVICE_ROLE_KEY for admin access)
 *   - PDF file at: /home/brilworks/Downloads/increase-instagram-followers-reach-engagement.pdf
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local');
  process.exit(1);
}

const PDF_PATH = '/home/brilworks/Downloads/increase-instagram-followers-reach-engagement.pdf';
const STORAGE_BUCKET = 'ebooks';
const STORAGE_FILE = 'increase-instagram-followers-reach-engagement.pdf';

async function uploadEBook() {
  console.log('🚀 Starting eBook upload to Supabase Storage...\n');

  // Check if PDF exists
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ Error: PDF file not found at: ${PDF_PATH}`);
    console.error('Please ensure the PDF file exists at the specified path.');
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Read PDF file
  console.log('📄 Reading PDF file...');
  const fileBuffer = fs.readFileSync(PDF_PATH);
  const fileSize = (fileBuffer.length / 1024 / 1024).toFixed(2);
  console.log(`   File size: ${fileSize} MB\n`);

  // Check if bucket exists, create if not
  console.log('🪣 Checking storage bucket...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('❌ Error listing buckets:', listError.message);
    process.exit(1);
  }

  const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
  
  if (!bucketExists) {
    console.log(`   Bucket "${STORAGE_BUCKET}" doesn't exist. Creating...`);
    const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: false, // Private bucket, we'll use signed URLs
      fileSizeLimit: 10485760, // 10MB limit
      allowedMimeTypes: ['application/pdf'],
    });

    if (createError) {
      console.error('❌ Error creating bucket:', createError.message);
      console.error('\n💡 Tip: You may need to create the bucket manually in Supabase Dashboard:');
      console.error('   1. Go to Storage in Supabase Dashboard');
      console.error(`   2. Create a new bucket named "${STORAGE_BUCKET}"`);
      console.error('   3. Set it to private');
      console.error('   4. Run this script again');
      process.exit(1);
    }
    console.log('   ✅ Bucket created successfully\n');
  } else {
    console.log('   ✅ Bucket exists\n');
  }

  // Upload file
  console.log('📤 Uploading PDF to Supabase Storage...');
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(STORAGE_FILE, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error('❌ Error uploading file:', error.message);
    process.exit(1);
  }

  console.log('   ✅ File uploaded successfully!');
  console.log(`   Path: ${data.path}\n`);

  // Verify upload
  console.log('🔍 Verifying upload...');
  const { data: files, error: listFilesError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list();

  if (listFilesError) {
    console.error('❌ Error listing files:', listFilesError.message);
  } else {
    const uploadedFile = files.find(f => f.name === STORAGE_FILE);
    if (uploadedFile) {
      console.log('   ✅ File verified in storage');
      console.log(`   File name: ${uploadedFile.name}`);
      console.log(`   File size: ${(uploadedFile.metadata?.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Created: ${uploadedFile.created_at}\n`);
    }
  }

  console.log('✅ eBook upload completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. The PDF is now stored in Supabase Storage');
  console.log('   2. The API route will generate signed URLs for downloads');
  console.log('   3. Test the download at: /ebook/increase-instagram-followers-reach-engagement');
}

uploadEBook().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

