# eBook Slack Integration

## Overview
Added Slack notifications for eBook downloads to track user engagement and lead capture, similar to the tools tracking system.

## What Was Implemented

### 1. New Slack Formatter Function
**File:** `src/lib/slack.ts`

Added `formatEbookDownloadSlackMessage()` function that formats eBook download notifications with:
- 📚 Event type: "New eBook Download"
- 📧 Email (if provided)
- 📱 Instagram username (if provided)
- 🌐 IP address
- 📍 City, Region, Country
- ⏰ Timezone
- 🏢 Organization/ISP

### 2. Updated API Route
**File:** `src/app/api/ebook/download/route.ts`

Enhanced the download API to:
- Accept `clientIp` and `ipInfo` from the frontend
- Send Slack notification after successful lead capture
- Non-blocking notification (doesn't fail the download if Slack fails)
- Logs notification status to console

### 3. Updated Lead Capture Form
**File:** `src/components/ebook/lead-capture-form.tsx`

Enhanced the form to:
- Fetch user's IP address using ipify.org API
- Get detailed location info from ipapi.co
- Send IP and location data to the download API
- Handle errors gracefully without blocking submission

## Slack Message Format

When a user downloads the eBook, Slack receives:

```
📚 New eBook Download: Instagram Followers & Engagement Guide
📧 Email: user@example.com
📱 Instagram: @username
🌐 IP: 123.456.789.0
📍 City: San Francisco
🗺️ Region: California
🌍 Country: United States
⏰ Timezone: America/Los_Angeles
🏢 Org: Example ISP
```

## Environment Variables Required

Make sure these are set in your `.env`:
- `SLACK_URL` - Slack webhook URL
- `SLACK_TOKEN` - Slack bot token
- `SLACK_CHANNEL_ID` - Channel ID to post to

## Testing

1. Go to: `http://localhost:3000/ebook/increase-instagram-followers-reach-engagement`
2. Enter email or Instagram username
3. Click "Download Free eBook"
4. Check your Slack channel for the notification

## Error Handling

- IP fetching errors are caught and logged (doesn't block download)
- Slack notification errors are caught and logged (doesn't block download)
- User always gets the download link even if notifications fail

## Benefits

✅ Track lead quality (email vs Instagram)
✅ Geographic insights (where your audience is)
✅ Real-time notifications
✅ Same format as tool usage tracking
✅ Non-blocking (user experience not affected)

