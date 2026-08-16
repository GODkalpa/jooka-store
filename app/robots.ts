import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jookawear.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/test/*',
          '/test-actions',
          '/test-auth',
          '/test-hydration',
          '/admin-setup',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
