import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: 32, img: 32, text: "text-lg" },
  md: { box: 36, img: 36, text: "text-xl" },
  lg: { box: 48, img: 48, text: "text-2xl" },
  xl: { box: 64, img: 64, text: "text-3xl" },
} as const;

export function Logo({ size = "md", showWordmark = true, className }: LogoProps) {
  const s = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative shrink-0 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg shadow-indigo-500/20"
        style={{ width: s.box, height: s.box }}
      >
        <Image
          src="/logo.png"
          alt="GamePrice"
          width={s.img}
          height={s.img}
          className="object-cover"
          priority
        />
      </span>
      {showWordmark && (
        <span className={cn("font-bold gradient-text tracking-tight", s.text)}>GamePrice</span>
      )}
    </span>
  );
}
