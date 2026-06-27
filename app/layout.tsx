import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://anonaz.app"),
  title: "AnonAZ — анонимные знакомства по всему Азербайджану",
  description:
    "Современная платформа анонимных знакомств, общения и валентинок для пользователей по всему Азербайджану.",
  applicationName: "AnonAZ",
  keywords: [
    "AnonAZ",
    "анонимные знакомства",
    "чат",
    "Азербайджан",
    "dating app",
    "anonymous chat"
  ],
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "AnonAZ",
    description:
      "Анонимные знакомства, чат и валентинки в современном тёмном интерфейсе.",
    siteName: "AnonAZ",
    locale: "ru_RU",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AnonAZ",
    description:
      "Анонимные знакомства, чат и валентинки в современном тёмном интерфейсе."
  }
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-white antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
