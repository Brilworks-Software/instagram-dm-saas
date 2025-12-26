/**
 * Slack notification for waiting list signups
 */

export interface SlackNotificationData {
  email: string | null;
  instagramId: string | null;
  message: string | null;
  previousPage: string | null;
  pageURL: string | null;
  region?: string;
  city: string;
  country: string;
}

/**
 * Result of sending Slack notification
 */
export interface SlackNotificationResult {
  success: boolean;
  error?: string;
}

/**
 * Send notification to Slack channel
 */
export async function sendSlackNotification(data: SlackNotificationData): Promise<SlackNotificationResult> {
  const slackUrl = process.env.SLACK_URL;
  const slackToken = process.env.SLACK_TOKEN;
  const slackChannelId = process.env.SLACK_CHANNEL_ID;

  if (!slackUrl || !slackToken || !slackChannelId) {
    console.warn('Slack configuration missing, skipping notification');
    return {
      success: false,
      error: 'Slack configuration missing',
    };
  }
  
  // Build contact info - show both email and Instagram ID when both are provided
  const contactParts: string[] = [];
  if (data.email) {
    contactParts.push(`Email: ${data.email}`);
  }
  if (data.instagramId) {
    contactParts.push(`Instagram ID: @${data.instagramId}`);
  }
  const contactInfo = contactParts.length > 0 
    ? contactParts.join(' | ') 
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
      const errorMessage = `Slack API error: ${response.status} ${response.statusText} - ${errorText}`;
      console.error("❌ Slack API error:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        contactInfo,
        email: data.email,
        instagramId: data.instagramId,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Check response body for Slack-specific errors
    // Some Slack APIs return ok: false in the body even with 200 status
    try {
      const responseData = await response.text();
      if (responseData && responseData.trim()) {
        try {
          const parsedData = JSON.parse(responseData);
          // Slack API might return ok: false in the body even with 200 status
          if (parsedData.ok === false) {
            const errorMessage = `Slack API error: ${
              parsedData.error || "Unknown error"
            }`;
            console.error("❌ Slack API returned error in response body:", {
              error: parsedData.error,
              response: parsedData,
              contactInfo,
              email: data.email,
              instagramId: data.instagramId,
            });
            return {
              success: false,
              error: errorMessage,
            };
          }
        } catch (jsonError) {
          // Response is not valid JSON, but that's okay - some APIs return plain text success
        }
      }
    } catch (readError) {
      // Error reading response body, but response.ok was true, so assume success
      console.warn(
        "⚠️ Could not read Slack response body, but status was OK:",
        readError
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error sending Slack notification:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      contactInfo,
      email: data.email,
      instagramId: data.instagramId,
    });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

