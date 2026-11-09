import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meu dia — Lista de tarefas",
  description: "Organize suas tarefas e acompanhe tudo o que precisa fazer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
