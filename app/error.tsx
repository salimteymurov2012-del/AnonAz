"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function Error({
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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Ошибка страницы</h2>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Во время загрузки этой страницы произошла ошибка. Попробуй повторить ещё раз.
        </p>
        <div className="mt-6 flex justify-center">
          <button onClick={() => reset()} className="primary-button gap-2">
            <RefreshCcw className="h-4 w-4" />
            Обновить страницу
          </button>
        </div>
      </div>
    </div>
  );
}
