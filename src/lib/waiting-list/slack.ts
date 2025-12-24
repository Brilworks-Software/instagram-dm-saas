/**
 * Slack notification for waiting list signups
 */

export interface SlackNotificationData {
  email: string | null;
  instagramId: string | null;
  message: string | null;
  previousPage: string | null;
  pageURL: string | null;
  region: string;
  city: string;
  country: string;
}

/**
 * Send notification to Slack channel
 */
export async function sendSlackNotification(data: SlackNotificationData): Promise<void> {
  const slackUrl = process.env.SLACK_URL;
  const slackToken = process.env.SLACK_TOKEN;
  const slackChannelId = process.env.SLACK_CHANNEL_ID;

  if (!slackUrl || !slackToken || !slackChannelId) {
    console.warn('Slack configuration missing, skipping notification');
    return;
  }
  // Build contact info (email or instagram)
  const contactInfo = data.email 
    ? `Email: ${data.email}` 
    : data.instagramId 
    ? `Instagram ID: @${data.instagramId}` 
    : 'No contact info';

  const payload = {
    channel: slackChannelId,
    blocks: [
      {
        type: 'rich_text',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              {
                type: 'text',
                text: `\n${contactInfo}\nMessage: ${data.message || ''}\nPreviousPage: ${data.previousPage || ''}\nPage: ${data.pageURL || ''}\nRegion: ${data.region || ''}\nCity: ${data.city || ''}\nCountry: ${data.country || ''}`,
              },
            ],
          },
        ],
      },
    ],
  };

  const headers = {
    Authorization: `Bearer ${slackToken}`,
    'Content-Type': 'application/json; charset=utf-8',
  };

  try {
    const response = await fetch(slackUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Slack API error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    // Don't throw - Slack failures shouldn't break the signup
  }
}

