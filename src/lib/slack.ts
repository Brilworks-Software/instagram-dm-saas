type SlackWebhookPayload = {
  text: string;
};

export async function postToSlack(text: string) {
  const url = process.env.SLACK_URL;
  const token = process.env.SLACK_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;

  if (!url || !token || !channel) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Slack] Missing env vars; set SLACK_URL, SLACK_TOKEN, SLACK_CHANNEL_ID');
    }
    return;
  }

//   console.log("text++++++++++++",text);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ channel, text } satisfies { channel: string; text: string }),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    throw new Error(
      `Slack request failed (${response.status}): ${responseText || response.statusText}`
    );
  }
}

export function formatToolUsageSlackMessage(params: {
  toolType: string;
  instaId: string;
  niche?: string | null;
  ip?: string | null;
  ipInfo?: Record<string, unknown> | null;
  additionalData?: string | null;
}) {
    // console.log("params++",params);
  const safeInstaId = (params.instaId || '').replace(/^@+/, '').trim();
  const niche = params.niche?.trim();

  const ipInfo = params.ipInfo || {};
  const city = (ipInfo['city'] as string | undefined) || '';
  const region = (ipInfo['region'] as string | undefined) || '';
  const countryName = (ipInfo['country_name'] as string | undefined) || '';
  const org = (ipInfo['org'] as string | undefined) || '';
  const timezone = (ipInfo['timezone'] as string | undefined) || '';

  const lines = [
    `🎯 New tool usage: ${params.toolType}`,
    `📱 Primary ID: ${safeInstaId || 'unknown'}`,
  ];

  if (niche) lines.push(`🏷️ Niche: ${niche}`);
  if (params.additionalData) lines.push(`\n${params.additionalData}`);
  
  if (params.ip) lines.push(`\n🌐 IP: ${params.ip}`);
  if (city) lines.push(`📍 City: ${city}`);
  if (region) lines.push(`🗺️ Region: ${region}`);
  if (countryName) lines.push(`🌍 Country: ${countryName}`);
  if (timezone) lines.push(`⏰ Timezone: ${timezone}`);
  if (org) lines.push(`🏢 Org: ${org}`);

  return lines.join('\n');
}
