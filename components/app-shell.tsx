"use client";

import { motion } from "framer-motion";
import {
  Heart, MessageCircleMore, LogIn, UserPlus, Home
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", icon: Home, label: t("navDiscover") },
    { href: "/chat", icon: MessageCircleMore, label: t("navChat") },
    { href: "/login", icon: LogIn, label: t("navLogin") },
  ];

  return (
    <div className="relative overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent shadow-glass">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">AnonAZ</div>
                <div className="text-xs text-white/50">{t("brandTagline")}</div>
              </div>
            </motion.div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition ${
                    active
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/register" className="hidden sm:inline-flex primary-button gap-2 !rounded-full !px-4 !py-2 !text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              {t("heroPrimary")}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {children}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/60 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { href: "/", icon: Home },
            { href: "/chat", icon: MessageCircleMore },
            { href: "/register", icon: UserPlus },
            { href: "/login", icon: LogIn },
          ].map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 rounded-2xl px-4 py-2 transition ${
                  active ? "text-accent" : "text-white/40 hover:text-white/70"
                }`}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-[10px]">{active ? "•" : ""}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
