"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function ForkAttribution() {
  const pathname = usePathname();

  // Hide in OBS browser source overlays so streamers don't get overlay bars
  if (pathname?.startsWith("/obs")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-white/10 bg-[#07080d] py-3 px-4 text-center text-xs text-zinc-400 select-none z-30">
      <div className="mx-auto flex items-center justify-center gap-1 flex-wrap">
        <strong className="font-bold text-white">Origem do projeto:</strong>
        <span className="text-zinc-300">Spectra é um fork independente do Go Live. Site original:</span>
        <a
          href="https://golive.nemtudo.me"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-white underline underline-offset-2 hover:text-cyan-400 transition-colors"
        >
          golive.nemtudo.me
        </a>
        <span className="text-zinc-300">.</span>
      </div>
    </footer>
  );
}

