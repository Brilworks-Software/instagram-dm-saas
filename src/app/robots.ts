import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
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
    ],
    sitemap: "https://www.socialora.app/sitemap.xml",
  };
}

