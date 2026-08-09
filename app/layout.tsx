import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Otimização Mobile-First, Viewport e PWA
export const viewport: Viewport = {
  themeColor: "#ec4899", // A cor da barra de status no topo do celular
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Previne o zoom automático indesejado no iOS ao clicar em inputs
  userScalable: false,
};

export const metadata: Metadata = {
  title: "BelezaPro | Sistema de Agendamentos Inteligente para Salões",
  description: "A agenda inteligente que trabalha por você 24h. Organize horários, adicione serviços e permita que suas clientes agendem direto pelo celular.",
  keywords: ["sistema para salao", "agenda para manicure", "aplicativo de agendamento", "belezapro", "salão de beleza"],
  manifest: "/manifest.json",
  
  // AQUI: Força o navegador e celulares a lerem o seu Favicon e ícones
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BelezaPro",
  },
  
  openGraph: {
    title: "BelezaPro | Sistema de Agendamentos para Salões",
    description: "Elimine a bagunça do WhatsApp e profissionalize seu estúdio por R$ 50/mês.",
    url: "https://manicure-amber.vercel.app",
    siteName: "BelezaPro",
    // AQUI: A Mágica pro WhatsApp puxar a sua imagem certa!
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Logo do Sistema BelezaPro",
      },
    ],
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}