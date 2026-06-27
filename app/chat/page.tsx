"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Users, Loader2, ArrowRight, UserPlus, MessageCircleMore,
  Heart, Shuffle, X, ChevronRight, LogIn
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

type ChatMessage = {
  from: string;
  text: string;
  time: string;
  own?: boolean;
};

type ChatState = "idle" | "waiting" | "chat" | "disconnected";

import { SOCKET_URL } from "@/lib/config";

function ChatContent() {
  const { t, language } = useI18n();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [nickname, setNickname] = useState("");
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [partnerNickname, setPartnerNickname] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSearch = useCallback(() => {
    if (!socket) return;
    setConnecting(true);
    setChatState("waiting");
    setMessages([]);
    setPartnerTyping(false);
    socket.emit("chat:find", { nickname: nickname || `anon_${Math.random().toString(36).slice(2, 8)}` });
  }, [socket, nickname]);

  const cancelSearch = useCallback(() => {
    socket?.emit("chat:cancel");
    setChatState("idle");
    setConnecting(false);
  }, [socket]);

  const nextPartner = useCallback(() => {
    socket?.emit("chat:next");
    setMessages([]);
    setPartnerTyping(false);
    setChatState("idle");
    setPartnerNickname("");
  }, [socket]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !socket) return;
    socket.emit("chat:message", { text: input.trim() });
    setMessages((prev) => [...prev, { from: socket.id || "me", text: input.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), own: true }]);
    setInput("");
  }, [input, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat:waiting", () => {
      setConnecting(false);
    });

    socket.on("chat:paired", ({ partnerId, partnerNickname: pn }: { partnerId: string; partnerNickname: string }) => {
      setConnecting(false);
      setChatState("chat");
      setPartnerNickname(pn);
    });

    socket.on("chat:cancelled", () => {
      setConnecting(false);
      setChatState("idle");
    });

    socket.on("chat:message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, { ...msg, own: false }]);
    });

    socket.on("chat:typing", ({ typing }: { typing: boolean }) => {
      setPartnerTyping(typing);
    });

    socket.on("chat:partner_left", () => {
      setChatState("disconnected");
      setPartnerTyping(false);
      setPartnerNickname("");
    });

    socket.on("chat:disconnected", () => {
      setMessages([]);
      setChatState("idle");
    });

    return () => {
      socket.off("chat:waiting");
      socket.off("chat:paired");
      socket.off("chat:cancelled");
      socket.off("chat:message");
      socket.off("chat:typing");
      socket.off("chat:partner_left");
      socket.off("chat:disconnected");
    };
  }, [socket]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-4xl flex-col px-4 pb-4 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-1.5 text-xs font-medium text-accent/90 backdrop-blur-md">
          <MessageCircleMore className="h-3 w-3" />
          {language === "ru" ? "Анонимный чат" : "Anonim çat"}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
          <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            {language === "ru" ? "Случайный собеседник" : "Təsadüfi həmsöhbət"}
          </span>
        </h1>
        <p className="mt-2 text-sm text-white/40">
          {language === "ru" ? "Нажми кнопку и начни анонимное общение" : "Düyməyə bas və anonim ünsiyyətə başla"}
        </p>
      </motion.div>

      {/* Chat area */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-black/40 backdrop-blur-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <div className="flex items-center gap-2">
            {chatState === "chat" && partnerNickname ? (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  {partnerNickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">@{partnerNickname}</div>
                  {partnerTyping && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-emerald-400">
                      {t("typing")}
                    </motion.span>
                  )}
                </div>
              </>
            ) : chatState === "waiting" ? (
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                {language === "ru" ? "Поиск собеседника..." : "Həmsöhbət axtarılır..."}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-white/30">
                <Users className="h-4 w-4" />
                {language === "ru" ? "Ожидание" : "Gözləmə"}
              </div>
            )}
          </div>

          {chatState === "chat" && (
            <motion.button
              onClick={nextPartner}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
            >
              <Shuffle className="h-3.5 w-3.5" />
              {language === "ru" ? "Далее" : "Növbəti"}
            </motion.button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hidden">
          {chatState === "idle" && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/20 text-accent">
                <MessageCircleMore className="h-8 w-8" />
              </div>
              <p className="text-sm text-white/30">
                {language === "ru" ? "Введите ник и начните общение" : "Nik daxil edin və ünsiyyətə başlayın"}
              </p>
            </div>
          )}

          {chatState === "disconnected" && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
                {language === "ru" ? "Собеседник отключился" : "Həmsöhbət ayrıldı"}
              </div>
              <motion.button
                onClick={() => { setChatState("idle"); }}
                whileHover={{ scale: 1.03 }}
                className="primary-button gap-2 text-xs"
              >
                <UserPlus className="h-4 w-4" />
                {language === "ru" ? "Найти нового" : "Yeni tap"}
              </motion.button>
            </div>
          )}

          {chatState === "waiting" && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute h-full w-full animate-spin rounded-full border-2 border-transparent border-t-accent" />
                <div className="absolute h-3/4 w-3/4 animate-spin rounded-full border-2 border-transparent border-b-accent/60" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                <Users className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm text-white/40">
                {language === "ru" ? "Ищем собеседника..." : "Həmsöhbət axtarılır..."}
              </p>
              <button onClick={cancelSearch} className="secondary-button gap-2 text-xs text-red-400">
                <X className="h-3.5 w-3.5" />
                {language === "ru" ? "Отмена" : "Ləğv et"}
              </button>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-2 flex ${msg.own ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.own ? "rounded-br-md bg-accent/20 text-white" : "rounded-bl-md bg-white/8 text-white/85"
                }`}>
                  <p>{msg.text}</p>
                  <p className={`mt-0.5 text-[10px] ${msg.own ? "text-white/30 text-right" : "text-white/25"}`}>{msg.time}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        {(chatState === "idle" || chatState === "chat") && (
          <div className="border-t border-white/[0.06] px-4 py-3">
            {chatState === "idle" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                  <span className="text-sm text-white/30">@</span>
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startSearch()}
                    placeholder={language === "ru" ? "Твой ник (необязательно)" : "Nik (istəyə bağlı)"}
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                    maxLength={20}
                  />
                </div>
                <motion.button
                  onClick={startSearch}
                  disabled={connecting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="primary-button gap-2 disabled:opacity-40 sm:w-auto"
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircleMore className="h-4 w-4" />}
                  {language === "ru" ? "Начать чат" : "Çata başla"}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                <input
                  value={input}
                  onChange={(e) => { setInput(e.target.value); socket?.emit("chat:typing", { typing: e.target.value.length > 0 }); }}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={t("sendPlaceholder")}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Shuffle, text: language === "ru" ? "Случайный подбор собеседника" : "Təsadüfi seçim" },
          { icon: MessageCircleMore, text: language === "ru" ? "Анонимное общение без регистрации" : "Qeydiyyatsız anonim ünsiyyət" },
          { icon: Heart, text: language === "ru" ? "Полная конфиденциальность" : "Tam məxfilik" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <item.icon className="h-4 w-4" />
            </div>
            <p className="text-xs leading-relaxed text-white/50">{item.text}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-2 border-transparent border-t-accent" />
          <div className="h-2 w-2 rounded-full bg-accent" />
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
