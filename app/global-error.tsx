"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-white antialiased">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <div className="glass w-full rounded-3xl p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Что-то пошло не так</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Произошла критическая ошибка приложения. Попробуй перезагрузить страницу или вернуться на главную.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => reset()} className="primary-button gap-2">
                <RotateCcw className="h-4 w-4" />
                Попробовать снова
              </button>
              <Link href="/" className="secondary-button">
                На главную
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
