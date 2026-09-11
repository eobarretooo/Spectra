import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { WorkshopPanel } from "./WorkshopPanel";
import { pageMetadata } from "@/lib/seo";

const TITLE = "Descobrir temas — Spectra";
const DESCRIPTION =
  "Temas de sala feitos pela comunidade do Spectra. Use qualquer um de graça, ou crie o seu.";

export const metadata: Metadata = pageMetadata({
  path: "/workshop",
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["temas spectra", "descobrir temas", "tema de sala", "personalizar sala"],
  card: {
    title: "Temas para a sua sala",
    subtitle: "Feitos pela comunidade. Usar é grátis para qualquer conta.",
    tone: "theme",
    badge: "Descobrir",
  },
});

export default function WorkshopPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#07080d] text-zinc-100">
      <SiteHeader />
      <WorkshopPanel />
    </div>
  );
}
