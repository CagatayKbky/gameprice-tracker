import type { ReactNode } from "react";
import { NOINDEX_METADATA } from "@/lib/seo/page-metadata";

export const metadata = NOINDEX_METADATA;

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return children;
}
