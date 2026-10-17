import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://inagerlis-pv-crm.onrender.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/organizaciones/nueva',
          '/legal',
          '/legal/terminos',
          '/legal/privacidad',
          '/legal/derechos-de-autor',
        ],
        disallow: [
          '/api/',
          '/caja/',
          '/ventas/',
          '/pos/caja/',
          '/configuracion/',
          '/asistente-ia/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
