"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";

export default function LoginPage() {
  const { language } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = async () => {
    setLoading(true);
    try {
      await api.login(form);
      toast("success", language === "ru" ? "Вход выполнен!" : "Giriş tamamlandı!");
      router.push("/");
    } catch (e: any) {
      toast("error", e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 text-accent">
            <LogIn className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{language === "ru" ? "Вход" : "Giriş"}</h1>
            <p className="text-xs text-white/40">{language === "ru" ? "Введи свои данные" : "Məlumatlarını daxil et"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-white/40">{language === "ru" ? "Никнейм" : "Nikneym"}</label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3">
              <span className="text-sm text-white/30">@</span>
              <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="username" className="field border-0 bg-transparent px-0" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/40">{language === "ru" ? "Пароль" : "Şifrə"}</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="field pr-10" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading || !form.username || !form.password} className="primary-button w-full gap-2 disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {language === "ru" ? "Войти" : "Daxil ol"}
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-white/30">
          {language === "ru" ? "Нет профиля?" : "Profiliniz yoxdur?"}{" "}
          <button onClick={() => router.push("/register")} className="text-accent hover:underline">
            {language === "ru" ? "Создать" : "Yarat"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
