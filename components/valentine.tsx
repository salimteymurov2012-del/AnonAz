"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Check, Ban } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function ValentineModal({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (username: string, text: string) => void;
}) {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!username.trim() || !text.trim()) return;
    onSend(username.trim(), text.trim());
    setUsername("");
    setText("");
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
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-rose-500/20 bg-surface p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-rose-400">
                <Heart className="h-4 w-4" /> {t("valentineModalTitle")}
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-white/40">{t("valentineTo")}</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3">
                  <span className="text-sm text-white/30">@</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="field border-0 bg-transparent px-0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/40">{text.length > 0 ? `${t("valentineText")} (${text.length})` : t("valentineText")}</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("valentinePlaceholder")}
                  rows={3}
                  className="field resize-none"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={onClose} className="secondary-button flex-1 text-xs">{t("valentineCancel")}</button>
              <button
                onClick={handleSend}
                disabled={!username.trim() || !text.trim()}
                className="primary-button flex-1 gap-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 disabled:opacity-30"
              >
                <Heart className="h-3.5 w-3.5" /> {t("valentineSend")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ValentineInbox({
  valentines,
  onAccept,
  onReject,
}: {
  valentines: { id: number; from: string; text: string }[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const { t } = useI18n();
  if (valentines.length === 0) return null;

  return (
    <div className="space-y-3">
      {valentines.map((v) => (
        <motion.div
          key={v.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-rose-500/15 bg-rose-500/[0.03] p-5"
        >
          <div className="mb-2 flex items-center gap-2 text-sm text-rose-400">
            <Heart className="h-4 w-4" />
            <span className="font-medium">@{v.from}</span>
          </div>
          <p className="text-sm leading-relaxed text-white/70">{v.text}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onAccept(v.id)}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-500/15 px-4 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/25"
            >
              <Check className="h-3.5 w-3.5" /> {t("valentineAccept")}
            </button>
            <button
              onClick={() => onReject(v.id)}
              className="flex items-center gap-1.5 rounded-2xl bg-white/5 px-4 py-2 text-xs font-medium text-white/50 transition hover:bg-white/10"
            >
              <Ban className="h-3.5 w-3.5" /> {t("valentineReject")}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
