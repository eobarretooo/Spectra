import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { FriendsPanel } from "./FriendsPanel";

export const metadata: Metadata = {
  title: "Amigos — Spectra",
  description: "Seus amigos no Spectra, pedidos de amizade e contas bloqueadas.",
  // Nothing here is public: the page renders one person's own graph and is
  // useless — and empty — to anybody else, including a crawler.
  robots: { index: false, follow: false },
};

export default function FriendsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#07080d] text-zinc-100">
      <SiteHeader />
      <FriendsPanel />
    </div>
  );
}
