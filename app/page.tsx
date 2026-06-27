"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mic, MicOff, Phone, PhoneOff, Send, MapPin, Sparkles, ArrowRight, X, Play, Loader2, ChevronDown } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/lib/config";

const uid = () => Math.random().toString(36).slice(2, 12);
type Msg = { id: string; content: string; mine: boolean; voice?: boolean };
type Lang = "az" | "ru";

const L: Record<Lang, any> = {
  az: {
    title: "AnonAZ", subtitle: "Anonim çat", desc: "Bütün Azərbaycan üzrə anonim çat", start: "Ünsiyyətə başla",
    mode: "Ünsiyyət növünü seç", text: "Mətn", voice: "Səs",
    from: "Dən", to: "Dək", anyCity: "İstənilən şəhər", anyDist: "İstənilən rayon",
    findText: "Mətn söhbəti üçün axtarılır...", findVoice: "Səsli söhbət üçün axtarılır...",
    cancel: "Ləğv et", found: "Həmsöhbət tapıldı", next: "Növbəti",
    placeholder: "Mesaj yaz...", voiceMsg: "Səsli mesaj", call: "Zəng et", endCall: "Zəngi bitir",
    online: "hazırda söhbət edir", search: "Axtarılır...", err_conn: "Bağlantı xətası",
    textChat: "Mətn söhbəti", voiceChat: "Səsli zəng", filters: "Filtrlər",
  },
  ru: {
    title: "AnonAZ", subtitle: "Анонимный чат", desc: "Анонимный чат по всему Азербайджану", start: "Начать общение",
    mode: "Выбери тип общения", text: "Текст", voice: "Голос",
    from: "От", to: "До", anyCity: "Любой город", anyDist: "Любой район",
    findText: "Поиск собеседника для текстового чата...", findVoice: "Поиск собеседника для голосового чата...",
    cancel: "Отмена", found: "Собеседник найден", next: "Следующий",
    placeholder: "Напиши сообщение...", voiceMsg: "Голосовое", call: "Позвонить", endCall: "Завершить звонок",
    online: "человек сейчас общаются", search: "Поиск...", err_conn: "Ошибка подключения",
    textChat: "Текстовый чат", voiceChat: "Голосовой звонок", filters: "Фильтры",
  },
};

const CITIES: Record<string, string[]> = {
  "26 məktəb": ["26 məktəb"],
  "Bakı": ["Nəsimi", "Nərimanov", "Xətai", "Yasamal", "Səbail", "Qaradağ", "Binəqədi", "Pirallahı", "Xəzər", "Suraxanı", "Sabunçu"],
  "Sumqayıt": ["Mərkəz", "28 May", "Həzi Aslanov"],
  "Gəncə": ["Kəpəz", "Nizami"],
  "Mingəçevir": ["Mərkəz", "Xəzər"],
  "Şirvan": ["Mərkəz"],
  "Lənkəran": ["Mərkəz"],
  "Şəki": ["Mərkəz"],
  "Xırdalan": ["Mərkəz"],
};

const CITY_RU: Record<string, string> = {
  "26 məktəb": "26 məktəb", "Bakı": "Баку", "Sumqayıt": "Сумгаит", "Gəncə": "Гянджа",
  "Mingəçevir": "Мингечевир", "Şirvan": "Ширван", "Lənkəran": "Ленкорань", "Şəki": "Шеки", "Xırdalan": "Хырдалан",
};

function createPC(iceCb: (c: RTCIceCandidate) => void, trackCb: (s: MediaStream) => void) {
  const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
  pc.onicecandidate = (e) => { if (e.candidate) iceCb(e.candidate); };
  pc.ontrack = (e) => { trackCb(e.streams[0]); };
  return pc;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
};

const stagger = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { staggerChildren: 0.08 }
};

export default function Home() {
  const [userId, setUserId] = useState("");
  const [lang, setLang] = useState<Lang>("ru");
  const [mode, setMode] = useState<"text" | "voice" | null>(null);
  const [city, setCity] = useState("any");
  const [district, setDistrict] = useState("");
  const [ageFrom, setAgeFrom] = useState(18);
  const [ageTo, setAgeTo] = useState(60);
  const [step, setStep] = useState<"mode" | "searching" | "chat">("mode");
  const [room, setRoom] = useState<any>(null);
  const [partner, setPartner] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callTimer = useRef<NodeJS.Timeout | null>(null);
  const [remoteAudio, setRemoteAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const t = L[lang];

  const cityName = useMemo(() => (c: string) => lang === "ru" && CITY_RU[c] ? CITY_RU[c] : c, [lang]);

  useEffect(() => { setUserId(localStorage.getItem("uid") || uid()); }, []);
  useEffect(() => { if (userId) localStorage.setItem("uid", userId); }, [userId]);

  // Socket connection
  useEffect(() => {
    const s = io(BACKEND_URL);
    socketRef.current = s;

    s.on("partner_found", (data: any) => {
      setPartner(data.user2_id === userId ? data.user1_id : data.user2_id);
      setStep("chat");
      setRoom(data);
      if (mode === "voice") initVoiceCall(data.user2_id === userId);
    });

    s.on("new_message", (msg: Msg) => {
      setMsgs((prev) => {
        if (prev.some((p) => p.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    s.on("signal", (data: { type: string; payload: any }) => {
      if (data.type === "offer") handleOffer(data.payload);
      else if (data.type === "answer") handleAnswer(data.payload);
      else if (data.type === "ice") handleIce(data.payload);
    });

    s.on("partner_left", () => {
      endCall();
      setRoom(null); setPartner(null); setMsgs([]);
      setStep("mode");
    });

    s.on("search_cancelled", () => {});

    s.on("connect_error", () => {
      setError(t.err_conn);
    });

    return () => { s.disconnect(); };
  }, [userId, mode]);

  // Online count
  useEffect(() => {
    const int = setInterval(async () => {
      try {
        const r = await fetch("http://localhost:4000/api/online");
        const d = await r.json();
        setOnlineCount(d.count);
      } catch {}
    }, 5000);
    return () => clearInterval(int);
  }, []);

  const districts = city !== "any" ? CITIES[city] : [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const sendSignal = (type: string, payload: any) => {
    if (!room?.id || !socketRef.current) return;
    socketRef.current.emit("signal", { roomId: room.id, type, payload });
  };

  const handleOffer = async (sdp: string) => {
    const pc = createPC(
      (c) => sendSignal("ice", JSON.stringify(c.toJSON())),
      (s) => { setRemoteAudio(true); if (audioRef.current) audioRef.current.srcObject = s; }
    );
    pcRef.current = pc;
    await pc.setRemoteDescription(JSON.parse(sdp));
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    sendSignal("answer", JSON.stringify(ans));
  };

  const handleAnswer = async (sdp: string) => {
    if (pcRef.current) await pcRef.current.setRemoteDescription(JSON.parse(sdp));
  };

  const handleIce = async (ice: string) => {
    if (pcRef.current) await pcRef.current.addIceCandidate(JSON.parse(ice));
  };

  const initVoiceCall = async (isJoiner: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = createPC(
        (c) => sendSignal("ice", JSON.stringify(c.toJSON())),
        (s) => { setRemoteAudio(true); if (audioRef.current) audioRef.current.srcObject = s; }
      );
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      if (!isJoiner) {
        const o = await pc.createOffer();
        await pc.setLocalDescription(o);
        sendSignal("offer", JSON.stringify(o));
      }
      setInCall(true);
      let sec = 0;
      callTimer.current = setInterval(() => { sec++; setCallDuration(sec); }, 1000);
    } catch {
      alert(lang === "az" ? "Mikrofon əlçatan deyil" : "Микрофон не доступен");
    }
  };

  const endCall = () => {
    if (pcRef.current) pcRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    if (callTimer.current) clearInterval(callTimer.current);
    pcRef.current = null; localStreamRef.current = null;
    setInCall(false); setCallDuration(0); setRemoteAudio(false);
  };

  const startSearch = async (m: "text" | "voice") => {
    setError("");
    setMode(m);
    setStep("searching");
    if (socketRef.current) {
      socketRef.current.emit("find_partner", {
        userId,
        mode: m,
        city: city !== "any" ? city : null,
        district: district || null,
        ageFrom,
        ageTo,
      });
    }
  };

  const cancelSearch = () => {
    if (socketRef.current) socketRef.current.emit("cancel_search");
    setStep("mode");
  };

  const sendMsg = async () => {
    if (!input.trim() || !room?.id || !socketRef.current) return;
    const text = input.trim();
    setInput("");
    socketRef.current.emit("send_message", { roomId: room.id, content: text });
  };

  const next = async () => {
    endCall();
    if (room?.id && socketRef.current) socketRef.current.emit("next", room.id);
    setRoom(null); setPartner(null); setMsgs([]);
    setStep("searching");
    setTimeout(() => startSearch(mode || "text"), 300);
  };

  const startRec = async () => {
    if (!room || recording) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorder.current = mr; audioChunks.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      mr.onstop = async () => {
        s.getTracks().forEach((t) => t.stop());
        const b = new Blob(audioChunks.current, { type: "audio/webm" }); if (b.size > 500000) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
          if (room?.id && socketRef.current) {
            socketRef.current.emit("send_message", {
              roomId: room.id,
              content: "VOICE:" + (reader.result as string).split(",")[1],
            });
          }
        };
        reader.readAsDataURL(b);
      };
      mr.start(); setRecording(true);
    } catch { alert(lang === "az" ? "Mikrofon əlçatan deyil" : "Микрофон не доступен"); }
  };

  const stopRec = () => { if (mediaRecorder.current && recording) { mediaRecorder.current.stop(); setRecording(false); } };
  const playVoice = (b64: string) => { try { new Audio("data:audio/webm;base64," + b64).play(); } catch {} };
  const secToTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.15,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-16 z-50 max-w-[360px] -translate-x-1/2 rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-3 text-center text-sm text-white backdrop-blur-xl"
          >
            {error}
            <button onClick={() => setError("")} className="ml-2 align-middle text-lg text-white/60 hover:text-white">&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language switcher */}
      <div className="fixed right-4 top-4 z-10 flex gap-1.5">
        {(["az", "ru"] as Lang[]).map((l) => (
          <motion.button
            key={l}
            onClick={() => setLang(l)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              lang === l
                ? "border-accent/50 bg-accent text-white shadow-lg shadow-accent/25"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            {l.toUpperCase()}
          </motion.button>
        ))}
      </div>

      {/* Mode Selection */}
      {step === "mode" && (
        <motion.div {...fadeUp} className="relative z-10 flex flex-1 items-center justify-center p-5">
          <div className="flex w-full max-w-sm flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-3 text-5xl"
              >
                <Sparkles className="mx-auto h-12 w-12 text-accent" />
              </motion.div>
              <h1 className="bg-gradient-to-r from-violet-300 via-accent to-purple-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                {t.title}
              </h1>
              <p className="mt-2 text-sm text-white/50">{t.desc}</p>
              {onlineCount > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-400"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  {onlineCount} {t.online}
                </motion.p>
              )}
            </motion.div>

            <motion.div {...stagger} className="flex flex-col gap-3">
              <motion.button
                {...fadeUp}
                onClick={() => startSearch("text")}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 text-left transition-all hover:border-accent/30 hover:bg-accent/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-white">{t.text} {lang === "az" ? "Söhbət" : "чат"}</div>
                  <div className="mt-0.5 text-xs text-white/40">{lang === "az" ? "Mətn yaz, səsli mesaj göndər" : "Пиши текст, отправляй голосовые"}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-white/20 transition group-hover:text-accent group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                {...fadeUp}
                onClick={() => startSearch("voice")}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/[0.08] to-transparent p-5 text-left transition-all hover:shadow-[0_0_30px_-8px_rgba(139,92,246,0.3)]"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent/[0.06] to-transparent"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                  <Mic className="h-7 w-7" />
                </div>
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">{t.voice} {lang === "az" ? "Zəng" : "звонок"}</span>
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">NEW</span>
                  </div>
                  <div className="mt-0.5 text-xs text-white/40">{lang === "az" ? "Canlı səsli danışıq" : "Живой голосовой разговор"}</div>
                </div>
                <ArrowRight className="relative z-10 h-5 w-5 text-white/20 transition group-hover:text-accent group-hover:translate-x-1" />
              </motion.button>
            </motion.div>

            {/* Filters */}
            <motion.div {...fadeUp} className="overflow-hidden rounded-2xl border border-white/[0.06]">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-xs text-white/50 transition hover:text-white/80"
              >
                <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {t.filters}</span>
                <ChevronDown className={`h-4 w-4 transition ${filtersOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {filtersOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/[0.06] px-4 py-3"
                  >
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] uppercase text-white/30">{t.from}</label>
                        <input type="number" min={14} max={99} value={ageFrom} onChange={(e) => setAgeFrom(Number(e.target.value))}
                          className="field !rounded-xl !px-3 !py-2 text-xs" />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] uppercase text-white/30">{t.to}</label>
                        <input type="number" min={14} max={99} value={ageTo} onChange={(e) => setAgeTo(Number(e.target.value))}
                          className="field !rounded-xl !px-3 !py-2 text-xs" />
                      </div>
                    </div>
                    <select value={city} onChange={(e) => { setCity(e.target.value); setDistrict(""); }}
                      className="field mt-2 !rounded-xl !px-3 !py-2 text-xs">
                      <option value="any">{t.anyCity}</option>
                      {Object.keys(CITIES).map((c) => <option key={c} value={c}>{c === "26 məktəb" ? "🏫 26 məktəb" : "🏙️ " + cityName(c)}</option>)}
                    </select>
                    {city !== "any" && city !== "26 məktəb" && (
                      <select value={district} onChange={(e) => setDistrict(e.target.value)}
                        className="field mt-2 !rounded-xl !px-3 !py-2 text-xs">
                        <option value="">📍 {t.anyDist}</option>
                        {districts.map((d) => <option key={d} value={d}>📍 {d}</option>)}
                      </select>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Searching */}
      {step === "searching" && (
        <motion.div {...fadeUp} className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/10 border-t-accent shadow-lg shadow-accent/20"
          >
            <Loader2 className="h-6 w-6 text-accent" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-base font-medium text-white/70"
          >
            {mode === "voice" ? t.findVoice : t.findText}
          </motion.p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2.5 w-2.5 rounded-full bg-accent"
                animate={{ scale: [0, 1, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <motion.button
            onClick={cancelSearch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="secondary-button !rounded-xl !px-6 !py-2.5 text-xs"
          >
            &larr; {t.cancel}
          </motion.button>
        </motion.div>
      )}

      {/* Chat mode */}
      {step === "chat" && mode === "text" && (
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] py-3">
            <div className="flex items-center gap-2.5">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2.5 w-2.5 rounded-full bg-emerald-400"
              />
              <span className="text-sm text-white/60">{t.found}</span>
            </div>
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="primary-button !rounded-xl !px-5 !py-2 text-xs"
            >
              {t.next}
            </motion.button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto py-3">
            <AnimatePresence>
              {msgs.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.mine ? "rounded-br-md bg-accent/20 text-white" : "rounded-bl-md bg-white/8 text-white/85"
                  }`}>
                    {m.voice ? (
                      <button onClick={() => playVoice(m.content)}
                        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10">
                        <Play className="h-3.5 w-3.5" /> {t.voiceMsg} ({Math.round(m.content.length / 10000)}c)
                      </button>
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-white/[0.06] py-3">
            <motion.button
              onClick={recording ? stopRec : startRec}
              whileTap={{ scale: 0.9 }}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                recording ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </motion.button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              placeholder={t.placeholder}
              className="field !rounded-xl !py-2.5 text-sm"
            />
            <motion.button
              onClick={sendMsg}
              whileTap={{ scale: 0.9 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/25 transition hover:bg-violet-500"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Voice chat mode */}
      {step === "chat" && mode === "voice" && (
        <motion.div {...fadeUp} className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6">
          <audio ref={audioRef} autoPlay />
          <div className="text-sm text-white/50">{t.found}</div>

          <motion.div
            animate={inCall ? { scale: [1, 1.05, 1], boxShadow: ["0 0 30px rgba(34,197,94,0.2)", "0 0 60px rgba(34,197,94,0.4)", "0 0 30px rgba(34,197,94,0.2)"] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-5xl"
          >
            <Mic className={`h-12 w-12 ${inCall ? "text-emerald-400" : "text-white/30"}`} />
          </motion.div>

          {inCall && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold tabular-nums text-white">
              {secToTime(callDuration)}
            </motion.div>
          )}

          {remoteAudio && (
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {lang === "az" ? "Siz eşidilirsiniz" : "Собеседник слышит вас"}
            </motion.div>
          )}

          <div className="flex gap-4">
            {inCall ? (
              <motion.button
                onClick={endCall}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600"
              >
                <PhoneOff className="h-7 w-7" />
              </motion.button>
            ) : (
              <motion.button
                onClick={() => initVoiceCall(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
              >
                <Phone className="h-7 w-7" />
              </motion.button>
            )}
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              <ArrowRight className="h-7 w-7" />
            </motion.button>
          </div>

          <div className="text-xs text-white/40">{inCall ? t.endCall : t.call}</div>
        </motion.div>
      )}
    </div>
  );
}
