"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Heart, MessageCircle, Flag, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { ReportModal, type ReportReason } from "@/components/report-modal";
import { ValentineInbox } from "@/components/valentine";
import { useToast } from "@/components/toast";
import { Loader } from "@/components/loader";
import { useRouter, useSearchParams } from "next/navigation";

function ProfileContent() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [valentines, setValentines] = useState<{ id: number; from: string; text: string }[]>([]);

  useEffect(() => {
    if (!username) {
      toast("error", t("usernameRequired"));
      router.push("/");
      return;
    }
    api.getUser(username).then((data: any) => {
      setUser(data);
      api.getReceivedValentines().then((vals: any) => {
        setValentines((vals as any[]).map((v: any) => ({ id: v.id, from: v.from.username, text: v.text })));
      }).catch(() => {});
      setLoading(false);
    }).catch(() => {
      toast("error", t("userNotFound"));
      setLoading(false);
    });
  }, [username]);

  const handleReport = async (reason: ReportReason) => {
    try {
      await api.sendReport({ targetUsername: username!, reason });
      toast("error", t("reportSent"));
    } catch (e: any) {
      toast("error", e.message);
    }
  };

  if (loading) return <Loader />;
  if (!user) return <div className="flex justify-center py-20 text-sm text-white/40">{t("userNotFound")}</div>;

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-4xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl"
      >
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="relative h-32 bg-gradient-to-br from-accent/15 via-purple-500/10 to-transparent sm:h-40" />
        <div className="relative -mt-12 px-6 sm:px-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-accent/20 text-3xl font-bold text-accent ring-4 ring-background shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]">
            {user.username?.charAt(0).toUpperCase() || "?"}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 sm:px-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">@{user.username}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50">
                {user.city && <><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.city}</span><span>·</span></>}
                {user.age && <><span>{user.age} {t("profileYears")}</span><span>·</span></>}
                <span>{user.gender === "male" ? (language === "ru" ? "Парень" : "Oğlan") : user.gender === "female" ? (language === "ru" ? "Девушка" : "Qız") : "⚧"}</span>
              </div>
            </div>
            {user.isOnline ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> {t("online")}
              </span>
            ) : null}
          </div>

          {user.description && <p className="mt-4 text-sm leading-relaxed text-white/60">{user.description}</p>}

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs">
            <div className="flex items-center gap-2 text-white/40">
              <Calendar className="h-3.5 w-3.5" />{t("profileSite")}: {new Date(user.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <Clock className="h-3.5 w-3.5" />{t("profileLastSeen")}: {new Date(user.lastSeen).toLocaleString()}
            </div>
            {user.district && <div className="flex items-center gap-2 text-white/40"><MapPin className="h-3.5 w-3.5" />{user.district}</div>}
            <div className="flex items-center gap-2 text-white/40"><ShieldCheck className="h-3.5 w-3.5" />{t("profileAnon")}</div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => router.push(`/chat?user=${user.username}`)} className="primary-button flex-1 gap-2 text-xs">
              <MessageCircle className="h-4 w-4" />{t("message")}
            </button>
            <button onClick={() => api.toggleFavorite(user.id).then((r: any) => toast("success", r.favorited ? t("addedToFavorites") : t("removedFromFavorites"))).catch(() => {})}
              className="secondary-button gap-2 text-xs"><Heart className="h-4 w-4" /> {t("favorite")}</button>
            <button onClick={() => setReportOpen(true)} className="secondary-button gap-2 text-xs text-red-400"><Flag className="h-4 w-4" /></button>
          </div>
        </div>
      </motion.div>

      <div className="mt-8">
        <h2 className="mb-4 section-title flex items-center gap-2"><Heart className="h-5 w-5 text-rose-400" />{t("valentineTitle")}</h2>
        <ValentineInbox valentines={valentines}
          onAccept={(id) => { api.acceptValentine(id).then(() => { setValentines((p) => p.filter((v) => v.id !== id)); toast("valentine", t("accepted")); }).catch(() => {}); }}
          onReject={(id) => { api.rejectValentine(id).then(() => { setValentines((p) => p.filter((v) => v.id !== id)); toast("info", t("rejected")); }).catch(() => {}); }}
        />
        {valentines.length === 0 && <p className="text-sm text-white/30">{t("noValentines")}</p>}
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} onReport={(reason) => { handleReport(reason); setReportOpen(false); }} username={user?.username || ""} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProfileContent />
    </Suspense>
  );
}
