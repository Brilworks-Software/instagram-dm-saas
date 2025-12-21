import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard/',
          '/settings/',
          '/inbox/',
          '/campaigns/',
          '/analytics/',
          '/leads/',
          '/ai-studio/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard/',
          '/settings/',
          '/inbox/',
          '/campaigns/',
          '/analytics/',
          '/leads/',
          '/ai-studio/',
        ],
      },
    ],
    sitemap: `${cleanBaseUrl}/sitemap.xml`,
  };
}

