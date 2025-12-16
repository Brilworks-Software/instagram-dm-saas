# Database Migration: Add Cookies Column

## Issue
The `cookies` column doesn't exist in your Supabase `instagram_accounts` table, causing the error:
```
Could not find the 'cookies' column of 'instagram_accounts' in the schema cache
```

## Solution

### Option 1: Run SQL Migration in Supabase (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this SQL:

```sql
-- Add cookies field to instagram_accounts table
ALTER TABLE instagram_accounts 
ADD COLUMN IF NOT EXISTS cookies JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS instagram_accounts_cookies_idx 
ON instagram_accounts(cookies) 
WHERE cookies IS NOT NULL;

-- Add comment
COMMENT ON COLUMN instagram_accounts.cookies IS 
'Instagram session cookies stored as JSONB for persistent authentication';
```

4. Click **Run** to execute

### Option 2: Use Prisma Migrate

If you're using Prisma with direct database access:

```bash
# Create a new migration
npm run prisma:migrate:dev --name add_cookies_column

# Or apply the existing migration file
psql $DATABASE_URL -f prisma/migrations/add_cookies_column.sql
```

## Verification

After running the migration, verify the column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'instagram_accounts' 
AND column_name = 'cookies';
```

You should see:
```
column_name | data_type
------------|----------
cookies     | jsonb
```

## Temporary Workaround

The code has been updated to handle the missing column gracefully:
- If the `cookies` column doesn't exist, it will save the account without cookies
- Cookies will still be saved to localStorage for functionality
- Once you add the column, cookies will be saved to the database automatically

## After Migration

Once the column is added:
1. Refresh your application
2. Try connecting an Instagram account again
3. The cookies will now be saved to the database

