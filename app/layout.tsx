import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Otimização Mobile-First e PWA
export const viewport: Viewport = {
  themeColor: "#ec4899", // A cor da barra de status no topo do celular
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Previne o zoom automático indesejado no iOS ao clicar em inputs
  userScalable: false,
};

export const metadata: Metadata = {
  title: "BelezaPro | Sistema de Agendamentos",
  description: "Agende seus horários de forma rápida e prática.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BelezaPro",
  },
  openGraph: {
    title: "Agendamento Online",
    description: "Escolha o serviço, a data e reserve seu horário em poucos segundos.",
    type: "website",
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