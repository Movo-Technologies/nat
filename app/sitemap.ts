import { siteUrl } from '@/lib/site-url';
export default function sitemap() {
  return [
    {
      url: new URL('/', siteUrl).toString(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
  ];
}
