"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef, FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  showShortcut?: boolean;
}

export function SearchBar({ className, autoFocus, showShortcut = true }: SearchBarProps) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pathname === "/search") {
      setQuery(searchParams.get("q") || "");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        {loading ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        )}
        <input
          ref={inputRef}
          type="search"
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-card border border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors text-sm"
        />
        {showShortcut && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] text-muted font-mono">
            ⌘K
          </kbd>
        )}
      </div>
    </form>
  );
}
