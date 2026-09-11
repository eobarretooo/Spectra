import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { ProPanel } from "./ProPanel";
import { pageMetadata } from "@/lib/seo";

const TITLE = "Spectra — transmita em 4K/120fps e muito mais!";
const DESCRIPTION =
  "Recursos do Spectra: transmita a sua tela em 2K e 4K, com até 240 quadros por segundo.";

export const metadata: Metadata = pageMetadata({
  path: "/pro",
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "spectra",
    "transmitir tela em 4k",
    "compartilhar tela 240fps",
    "spectra live",
  ],
  card: {
    title: "Transmita em 4K, com 240fps",
    subtitle: "Selo verificado, sem anúncios, perfil personalizado e mais.",
    tone: "pro",
    badge: "Spectra",
  },
});

// Deliberately no price in the metadata or anywhere else in this file. The
// number lives in one place — the plan document the API reads (see its
// premiumPlan.ts) — and a copy of it baked into a page's description is a
// copy nobody remembers to update the day the price changes.
export default function ProPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <ProPanel />
    </div>
  );
}
