"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const reasons = ["spam", "offense", "fake", "other"] as const;

export type ReportReason = (typeof reasons)[number];

const reasonKeys: Record<string, "reportSpam" | "reportOffense" | "reportFake" | "reportOther"> = {
  spam: "reportSpam",
  offense: "reportOffense",
  fake: "reportFake",
  other: "reportOther",
};

export function ReportModal({
  open,
  onClose,
  onReport,
  username,
}: {
  open: boolean;
  onClose: () => void;
  onReport: (reason: ReportReason) => void;
  username: string;
}) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<ReportReason | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    onReport(selected);
    setSelected(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Flag className="h-4 w-4 text-red-400" />
                {t("reportOn")} @{username}
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelected(r)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    selected === r
                      ? "border-accent/50 bg-accent/10 text-white"
                      : "border-white/8 bg-white/[0.03] text-white/60 hover:bg-white/10"
                  }`}
                >
                  {t(reasonKeys[r])}
                </button>
              ))}
            </div>

            <button
              disabled={!selected}
              onClick={handleSubmit}
              className="mt-4 w-full rounded-2xl bg-red-500/20 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/30 disabled:opacity-30"
            >
              {t("reportSubmit")}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
