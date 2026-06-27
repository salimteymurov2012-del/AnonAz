"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
      <div className="hidden items-center gap-2 px-2 text-xs text-white/50 sm:flex">
        <Globe className="h-3.5 w-3.5" />
        {t("language")}
      </div>
      {[
        { code: "ru", label: "🇷🇺 RU" },
        { code: "az", label: "🇦🇿 AZ" }
      ].map((item) => {
        const active = language === item.code;

        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLanguage(item.code as "ru" | "az")}
            className={`relative rounded-xl px-3 py-2 text-xs font-medium transition ${
              active ? "text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {active ? (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-xl bg-accent"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
