import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnonAZ — анонимный чат",
  description: "Анонимный рандом-чат. Найди собеседника и общайся.",
  other: { charset: "UTF-8" },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body style={{ margin: 0, background: "#0b0b0b", color: "#fff", fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
