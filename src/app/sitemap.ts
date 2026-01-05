import type { MetadataRoute } from 'next';
import { sitemapPages } from "./sitemapdata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPagesData = sitemapPages.map((data) => {
    return {
      url: data.loc,
      lastModified: new Date(data.lastmod),
    };
  });

  return staticPagesData;
}

