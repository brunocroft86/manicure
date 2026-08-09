import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Protege o painel administrativo fechado para clientes logados
    },
    sitemap: 'https://belezapro.com.br/sitemap.xml',
  };
}