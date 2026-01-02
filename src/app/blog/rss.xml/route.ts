import { getAllBlogPosts } from '@/lib/blog-loader';
import { SITE_LAUNCH_DATE } from '@/lib/constants';

// Escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  const blogPosts = getAllBlogPosts()
    .filter((post) => {
      // Filter out README and example posts
      return post.slug !== 'README' && post.slug !== 'example-post';
    });

  // Get latest blog post date for lastBuildDate and pubDate
  const sortedPosts = blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestPostDate = sortedPosts.length > 0 
    ? new Date(sortedPosts[0].date).toUTCString()
    : SITE_LAUNCH_DATE.toUTCString();

  const rssItems = sortedPosts
    .map((post) => {
      const postUrl = `${cleanBaseUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${post.category}]]></category>
      <author><![CDATA[${post.author || 'Dhaval Trivedi'}]]></author>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[SocialOra Blog - Instagram DM Automation &amp; Cold DM Strategies]]></title>
    <description><![CDATA[Expert guides on Instagram DM automation, cold DM strategies, and Instagram marketing automation.]]></description>
    <link>${escapeXml(cleanBaseUrl)}/blog</link>
    <atom:link href="${escapeXml(cleanBaseUrl)}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${latestPostDate}</lastBuildDate>
    <pubDate>${latestPostDate}</pubDate>
    <managingEditor><![CDATA[${sortedPosts[0]?.author || 'Dhaval Trivedi'}]]></managingEditor>
    <webMaster>digital@socialora.com</webMaster>
    <category>Technology</category>
    <category>Social Media Marketing</category>
    <category>Instagram Automation</category>
${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

