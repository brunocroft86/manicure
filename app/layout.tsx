import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BelezaPro | Sistema de Agendamentos",
  description: "Agende seus horários de forma rápida e prática.",
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