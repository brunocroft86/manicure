import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BelezaPro | Sistema de Agendamentos',
    short_name: 'BelezaPro',
    description: 'A agenda inteligente do seu estúdio.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdf2f8', // Cor pink-50 do Tailwind
    theme_color: '#ec4899', // Cor pink-500 do Tailwind
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}