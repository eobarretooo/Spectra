import type { Metadata } from "next";
import { ogImage } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { BadgesPanel } from "./BadgesPanel";

const TITLE = "Badges e Conquistas do Spectra — O que cada selo significa";
const DESCRIPTION =
  "Descubra todas as badges do Spectra e como desbloquear cada uma: Staff, Spectra Pro, Bug Hunter, Contribuidor de Código, Android Pioneer e Early Adopter.";

const OG_IMAGE = ogImage({
  title: "Badges do Spectra",
  subtitle: "Conquistas exclusivas e marcas de perfil no Spectra.",
  badge: "Badges",
});

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "badges spectra",
    "selos spectra",
    "conquistas spectra",
    "bug hunter",
    "early adopter",
    "android pioneer",
    "spectra pro",
  ],
  alternates: { canonical: "/badges" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/badges",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Deliberately no badge list in this file. The catalogue is a database
// collection (see the API's /badges), and a copy here would be a second
// source of truth that goes stale the day somebody adds one — the panel
// reads the live one.
export default function BadgesPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#07080d]">
      <SiteHeader />
      <BadgesPanel />
    </div>
  );
}
