"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors"
      title={theme === "dark" ? t("theme.light") : t("theme.dark")}
      aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
