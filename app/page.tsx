"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart, Search, MessageCircleMore,
  Users, ArrowRight, Sparkles, ChevronRight,
  Flag, ShieldCheck, Ban, Star, Shuffle, UserPlus
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { UserCard } from "@/components/user-card";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";
import { SkeletonList } from "@/components/loader";
import type { UserCard as UserCardType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { cities } from "@/lib/cities";
import { mockUsers } from "@/lib/mock-data";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.06 }
};

export default function HomePage() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [onlineUsers, setOnlineUsers] = useState<UserCardType[]>([]);
  const [newUsers, setNewUsers] = useState<UserCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, online: 0, messages: 0 });
  const [searchQ, setSearchQ] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchGender, setSearchGender] = useState("");
  const [searchAge, setSearchAge] = useState("");
  const [searchAgeMin, setSearchAgeMin] = useState("");
  const [searchResults, setSearchResults] = useState<UserCardType[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [valentineUsername, setValentineUsername] = useState("");

  useEffect(() => {
    Promise.all([
      api.getOnlineUsers().catch(() => null),
      api.getUsers().catch(() => null),
    ]).then(([online, all]) => {
      if (online && all) {
        const mappedOnline = (online as any[]).map(mapUser);
        const mappedAll = (all as any[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(mapUser);
        setOnlineUsers(mappedOnline);
        setNewUsers(mappedAll.slice(0, 8));
        setStats({ users: all.length, online: online.length, messages: all.length * 3 });
      } else {
        setOnlineUsers(mockUsers.filter((u) => u.online));
        setNewUsers(mockUsers);
        setStats({ users: mockUsers.length, online: mockUsers.filter((u) => u.online).length, messages: mockUsers.length * 3 });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function mapUser(u: any): UserCardType {
    return { id: u.id, username: u.username, age: u.age || 0, city: u.city || "", district: u.district || "", gender: u.gender || "other", description: u.description || "", online: u.isOnline, lastSeen: u.lastSeen || "", interests: [], avatar: u.avatar || "", status: "" };
  }

  const doSearch = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchQ) params.set("q", searchQ);
      if (searchCity) params.set("city", searchCity);
      if (searchGender && searchGender !== "all") params.set("gender", searchGender);
      if (searchAgeMin) params.set("minAge", searchAgeMin);
      if (searchAge) params.set("maxAge", searchAge);
      const res = await api.searchUsers(`?${params.toString()}`);
      setSearchResults((res as any[]).map(mapUser));
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  return (
    <main className="relative mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">

      {/* ─── HERO ─── */}
      <motion.section
        {...fadeUp}
        className="relative overflow-hidden rounded-4xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 text-center sm:p-16 lg:p-24"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12)_0%,transparent_70%)]" />

        {/* Floating orbs */}
        <div className="absolute top-10 left-10 h-24 w-24 rounded-full bg-accent/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/3 h-16 w-16 rounded-full bg-fuchsia-500/8 blur-3xl animate-float" style={{ animationDelay: "1s" }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="relative z-10 mx-auto inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-xs font-medium text-accent/90 backdrop-blur-md"
        >
          <Sparkles className="h-3 w-3" />
          {t("heroBadge")}
        </motion.div>

        <h1 className="relative z-10 mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            {t("heroTitle")}
          </span>
        </h1>

        <p className="relative z-10 mx-auto mt-5 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
          {t("heroDescription")}
        </p>

        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
          <motion.button
            onClick={() => router.push("/chat")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:bg-violet-500 hover:shadow-[0_0_40px_-8px_rgba(139,92,246,0.5)]"
          >
            <MessageCircleMore className="h-5 w-5" />
            {language === "ru" ? "Начать анонимный чат" : "Anonim çata başla"}
          </motion.button>
          <motion.button
            onClick={() => router.push("/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-white/80 backdrop-blur-lg transition-all duration-300 hover:bg-white/10 hover:border-white/20"
          >
            <UserPlus className="h-4 w-4" />
            {t("heroPrimary")}
          </motion.button>
        </div>

        {/* Stats */}
        <div className="relative z-10 mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.04]">
          {[
            { value: stats.users, label: t("statUsers"), icon: Users },
            { value: stats.online, label: t("statOnline"), icon: Sparkles },
            { value: stats.messages, label: t("statMessages"), icon: MessageCircleMore }
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex flex-col items-center justify-center px-4 py-5 text-center group hover:bg-white/[0.02] transition-colors"
            >
              <s.icon className="h-4 w-4 text-accent/40 mb-1 group-hover:text-accent/60 transition-colors" />
              <span className="text-2xl font-bold text-white tabular-nums">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</span>
              <span className="mt-0.5 text-[11px] text-white/40">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── SEARCH ─── */}
      <motion.section {...fadeUp} className="mt-20">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] text-white/50 backdrop-blur-md">
            <Search className="h-3 w-3" />
            {t("searchTitle")}
          </span>
          <p className="mt-3 text-sm text-white/40">{t("searchDescription")}</p>
        </div>

        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder={t("searchNickname")} className="field text-xs"
          />
          <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)} className="field text-xs text-white/50">
            <option value="">{t("searchCity")}</option>
            {cities.map((c) => (
              <option key={c.nameAz} value={c.nameAz}>{language === "ru" ? c.nameRu : c.nameAz}</option>
            ))}
          </select>
          <div className="flex gap-1.5">
            <select value={searchAgeMin} onChange={(e) => setSearchAgeMin(e.target.value)} className="field text-xs text-white/50 flex-1 min-w-0">
              <option value="">{language === "ru" ? "От" : "Min"}</option>
              {Array.from({ length: 42 }, (_, i) => (
                <option key={i + 18} value={i + 18}>{i + 18}</option>
              ))}
            </select>
            <select value={searchAge} onChange={(e) => setSearchAge(e.target.value)} className="field text-xs text-white/50 flex-1 min-w-0">
              <option value="">{language === "ru" ? "До" : "Max"}</option>
              {Array.from({ length: 42 }, (_, i) => (
                <option key={i + 18} value={i + 18}>{i + 18}</option>
              ))}
            </select>
          </div>
          <select value={searchGender} onChange={(e) => setSearchGender(e.target.value)} className="field text-xs text-white/50">
            <option value="">{t("searchGender")}</option>
            <option value="all">{t("searchAll")}</option>
            <option value="male">{t("searchMale")}</option>
            <option value="female">{t("searchFemale")}</option>
            <option value="other">{t("searchOther")}</option>
          </select>
        </div>

        <div className="mx-auto mt-4 flex flex-wrap justify-center gap-3">
          <button onClick={doSearch} disabled={searching} className="primary-button max-w-xs flex-1 gap-2 text-xs disabled:opacity-40">
            <Search className="h-4 w-4" />
            {searching ? "..." : t("searchTitle")}
          </button>
          <button onClick={async () => {
            try {
              const all = await api.getUsers();
              if (all.length === 0) return;
              const random = all[Math.floor(Math.random() * all.length)];
              router.push(`/profile?username=${random.username}`);
            } catch {}
          }} className="secondary-button gap-2 text-xs">
            <Shuffle className="h-4 w-4" />
            {t("random")}
          </button>
        </div>

        {/* Search results */}
        {searchResults !== null && (
          <div className="mt-6">
            <p className="mb-4 text-xs text-white/40">{searchResults.length} {t("found")}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {searchResults.length === 0 ? (
                <p className="col-span-full text-center text-sm text-white/30">{t("noUsersFound")}</p>
              ) : searchResults.map((user) => (
                <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <UserCard user={user} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {/* ─── ONLINE NOW ─── */}
      <motion.section id="online-section" {...fadeUp} className="mt-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              {t("onlineNow")}
            </h2>
            <p className="section-copy mt-1">
              {onlineUsers.length} {t("statOnline")}
            </p>
          </div>
          <button onClick={() => router.push("/chat")} className="secondary-button text-xs">
            {t("anonymousChat")} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <motion.div
          {...stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {loading ? <SkeletonList count={4} /> : onlineUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <UserCard user={user} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ─── NEW PROFILES ─── */}
      <motion.section {...fadeUp} className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="section-title">{t("newProfiles")}</h2>
            <p className="section-copy mt-1">{t("statUsers")}</p>
          </div>
          <button onClick={() => router.push("/register")} className="secondary-button text-xs">
            {t("heroPrimary")} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <motion.div
          {...stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {newUsers.slice(0, 4).map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <UserCard user={user} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ─── ANONYMOUS CHAT ─── */}
      <motion.section {...fadeUp} className="mt-20">
        <div className="relative overflow-hidden rounded-4xl border border-white/[0.06] bg-gradient-to-b from-accent/[0.02] to-transparent p-8 text-center sm:p-12">
          <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-[11px] text-accent backdrop-blur-md">
              <MessageCircleMore className="h-3 w-3" />
              {t("anonymousChat")}
            </span>
            <h2 className="section-title mt-3">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                {language === "ru" ? "Случайный анонимный чат" : "Təsadüfi anonim çat"}
              </span>
            </h2>
            <p className="section-copy mx-auto mt-2">
              {language === "ru"
                ? "Нажми кнопку и начни общение со случайным собеседником. Без регистрации, без логинов."
                : "Düyməyə bas və təsadüfi həmsöhbətlə ünsiyyətə başla. Qeydiyyatsız, girişsiz."}
            </p>

            <motion.button
              onClick={() => router.push("/chat")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-300 hover:bg-violet-500 hover:shadow-[0_0_40px_-8px_rgba(139,92,246,0.5)]"
            >
              <MessageCircleMore className="h-5 w-5" />
              {language === "ru" ? "Найти собеседника" : "Həmsöhbət tap"}
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ─── SAFETY ─── */}
      <motion.section {...fadeUp} className="mt-20">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] text-white/50 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3" />
            {t("navSafety")}
          </span>
          <h2 className="section-title mt-3">{t("safetyTitle")}</h2>
          <p className="section-copy mt-2">{t("safetyDescription")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Ban, text: t("safetyOne") },
            { icon: Flag, text: t("safetyTwo") },
            { icon: Star, text: t("safetyThree") }
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-start gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-white/60">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ─── VALENTINE ─── */}
      <motion.section {...fadeUp} className="mt-20">
        <div className="relative overflow-hidden rounded-4xl border border-white/[0.06] bg-gradient-to-b from-accent/[0.03] to-transparent p-8 text-center sm:p-12">
          <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/8 px-3 py-1 text-[11px] text-rose-400 backdrop-blur-md">
              <Heart className="h-3 w-3" />
              {t("valentineTitle")}
            </span>
            <h2 className="section-title mt-3">{t("valentineTitle")}</h2>
            <p className="section-copy mx-auto mt-2">{t("valentineDescription")}</p>

            <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-3xl border border-white/8 bg-white/[0.02] p-2 backdrop-blur-xl">
              <span className="pl-3 text-sm text-white/40">@</span>
              <input
                value={valentineUsername}
                onChange={(e) => setValentineUsername(e.target.value)}
                placeholder="username"
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
              />
              <button onClick={async () => {
                if (!valentineUsername.trim()) return;
                try {
                  await api.sendValentine({ toUsername: valentineUsername.trim(), text: "💌" });
                  toast("valentine", "Valentine sent!");
                  setValentineUsername("");
                } catch (e: any) {
                  toast("error", e.message || "Error");
                }
              }} className="rounded-2xl bg-rose-500/20 px-4 py-2.5 text-xs font-medium text-rose-400 transition hover:bg-rose-500/30">
                <Heart className="inline h-3.5 w-3.5" /> {t("send")}
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── FOOTER ─── */}
      <footer className="mt-24 border-t border-white/[0.06] pt-8 text-center">
        <p className="text-xs text-white/30">{t("footer")}</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-white/20">
          <span>AnonAZ v0.1</span>
          <span>·</span>
          <span>Next.js + Tailwind + Framer Motion</span>
        </div>
      </footer>
    </main>
  );
}
