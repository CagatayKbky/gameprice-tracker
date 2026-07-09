import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatDiscount(discount: number): string {
  return `-%${discount}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getDiscountColor(discount: number): string {
  if (discount >= 75) return "text-emerald-400";
  if (discount >= 50) return "text-green-400";
  if (discount >= 25) return "text-yellow-400";
  return "text-orange-400";
}

export function getSavingsAmount(normal: number, sale: number): number {
  return Math.round((normal - sale) * 100) / 100;
}
