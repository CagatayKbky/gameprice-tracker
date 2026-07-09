"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

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
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Bir hata oluştu</h1>
      <p className="text-muted mb-6 text-sm">
        Sayfa yüklenirken beklenmeyen bir sorun oluştu. Lütfen tekrar deneyin.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-card-hover"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
