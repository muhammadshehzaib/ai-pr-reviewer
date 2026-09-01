import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/vault/', '/history/', '/repositories/'],
      },
    ],
    sitemap: 'https://pullpilot.ai/sitemap.xml',
  };
}
