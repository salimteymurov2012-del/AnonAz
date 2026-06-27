"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, UserPlus, Clock } from "lucide-react";
import type { UserCard } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";

function getInitials(name: string) {
  return name.charAt(0).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-violet-600", "bg-fuchsia-600", "bg-indigo-600",
    "bg-blue-600", "bg-purple-600", "bg-pink-600"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function UserCard({ user }: { user: UserCard }) {
  const router = useRouter();
  const { t, language } = useI18n();
  const { toast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-2xl transition-all duration-500 hover:border-accent/30 hover:bg-white/[0.06] hover:shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] animate-pulse-glow"
    >
      <div className="absolute -top-10 -right-10 h-20 w-20 rounded-full bg-accent/5 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/[0.02] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="relative shrink-0">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white ${getAvatarColor(user.username)}`}>
            {getInitials(user.username)}
          </div>
          {user.online && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400 ring-2 ring-background" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-white">
              @{user.username}
            </span>
            <span className="shrink-0 text-xs">{user.status}</span>
            <span className="ml-auto shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/50">
              {user.age}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/50">
              {user.city}
            </span>
            <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/40">
              {user.gender === "male" ? "♂" : user.gender === "female" ? "♀" : "⚧"}
            </span>
            {user.online ? (
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("online")}
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/35">
                <Clock className="h-2.5 w-2.5" />
                {user.lastSeen}
              </span>
            )}
          </div>

          {user.description && (
            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/60">
              {user.description}
            </p>
          )}

          {user.interests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.interests.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-accent/8 px-2 py-0.5 text-[10px] text-accent/70"
                >
                  #{i}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3">
        <button onClick={() => router.push(`/chat?user=${user.username}`)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent/15 py-2 text-xs font-medium text-accent transition hover:bg-accent/25">
          <MessageCircle className="h-3.5 w-3.5" />
          {t("message")}
        </button>
        <button onClick={async () => {
          try {
            const res = await api.toggleFavorite(user.id);
            toast("success", res.favorited ? t("addedToFavorites") : t("removedFromFavorites"));
          } catch (e: any) {
            toast("error", e.message || "Ошибка");
          }
        }} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-white/50 transition hover:bg-white/10 hover:text-white/80">
          <Heart className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => router.push(`/profile?username=${user.username}`)} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-white/50 transition hover:bg-white/10 hover:text-white/80">
          <UserPlus className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
