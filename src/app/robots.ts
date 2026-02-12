import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://www.socialora.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/dashboard/",
          "/login",
          "/signup",
          "/reset-password",
          "/forgot-password",
        ],
      },
      // Explicitly allow AI crawlers
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "CCBot",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "Omgilibot",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "FacebookBot",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "Bytespider",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "Diffbot",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/blog/", "/tools/", "/ebook/"],
        disallow: ["/api/", "/admin/", "/_next/", "/dashboard/"],
      },
    ],
    sitemap: `${cleanBaseUrl}/sitemap.xml`,
  };
}

