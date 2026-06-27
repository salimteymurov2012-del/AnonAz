"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { useToast } from "@/components/toast";
import { cities } from "@/lib/cities";

const genders = [
  { value: "male", ru: "Парень", az: "Oğlan" },
  { value: "female", ru: "Девушка", az: "Qız" },
  { value: "other", ru: "Другое", az: "Digər" },
];

export default function RegisterPage() {
  const { language } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", gender: "", age: "", city: "", district: "" });

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.register({
        username: form.username,
        password: form.password,
        gender: form.gender || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        city: form.city || undefined,
        district: form.district || undefined,
      });
      toast("success", language === "ru" ? "Профиль создан!" : "Profil yaradıldı!");
      router.push("/");
    } catch (e: any) {
      toast("error", e.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const selectedCity = cities.find((c) => c.nameAz === form.city || c.nameRu === form.city);

  return (
    <div className="mx-auto mt-10 max-w-md px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/20 text-accent">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              {language === "ru" ? "Регистрация" : "Qeydiyyat"}
            </h1>
            <p className="text-xs text-white/40">
              {language === "ru" ? "Шаг" : "Addım"} {step} / 2
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition ${s <= step ? "bg-accent" : "bg-white/8"}`} />
          ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{language === "ru" ? "Никнейм" : "Nikneym"}</label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3">
                <span className="text-sm text-white/30">@</span>
                <input value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="username" className="field border-0 bg-transparent px-0" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{language === "ru" ? "Пароль" : "Şifrə"}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" className="field pr-10" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!form.username || !form.password} className="primary-button w-full gap-2 disabled:opacity-40">
              {language === "ru" ? "Далее" : "Davam"} <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{language === "ru" ? "Пол" : "Cins"}</label>
              <div className="grid grid-cols-3 gap-2">
                {genders.map((g) => (
                  <button key={g.value} onClick={() => update("gender", g.value)}
                    className={`rounded-2xl border px-3 py-2.5 text-xs transition ${
                      form.gender === g.value ? "border-accent/50 bg-accent/10 text-white" : "border-white/8 bg-white/[0.03] text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {language === "ru" ? g.ru : g.az}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{language === "ru" ? "Возраст" : "Yaş"}</label>
              <select value={form.age} onChange={(e) => update("age", e.target.value)} className="field">
                <option value="">—</option>
                {Array.from({ length: 42 }, (_, i) => <option key={i + 18} value={i + 18}>{i + 18}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">{language === "ru" ? "Город" : "Şəhər"}</label>
              <select value={form.city} onChange={(e) => { update("city", e.target.value); update("district", ""); }} className="field">
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.nameAz} value={language === "ru" ? c.nameRu : c.nameAz}>
                    {language === "ru" ? c.nameRu : c.nameAz}
                  </option>
                ))}
              </select>
            </div>
            {selectedCity && (
              <div>
                <label className="mb-1.5 block text-xs text-white/40">{language === "ru" ? "Район" : "Rayon"}</label>
                <select value={form.district} onChange={(e) => update("district", e.target.value)} className="field">
                  <option value="">{language === "ru" ? "Выбрать" : "Seç"}</option>
                  {(language === "ru" ? selectedCity.districtsRu : selectedCity.districtsAz).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={handleRegister} disabled={loading} className="primary-button w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {language === "ru" ? "Создать профиль" : "Profil yarat"}
            </button>
            <button onClick={() => setStep(1)} className="secondary-button w-full text-xs">
              ← {language === "ru" ? "Назад" : "Geri"}
            </button>
          </motion.div>
        )}

        <p className="mt-5 text-center text-xs text-white/30">
          {language === "ru" ? "Уже есть профиль?" : "Profiliniz var?"}{" "}
          <button onClick={() => router.push("/login")} className="text-accent hover:underline">
            {language === "ru" ? "Войти" : "Daxil ol"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
