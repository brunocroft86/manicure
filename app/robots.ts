import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Protege o painel administrativo fechado para clientes logados
    },
    sitemap: 'https://belezapro.com.br/sitemap.xml',
  };
}