"use client";

import { useEffect, useState } from "react";
import { FaAndroid, FaApple, FaLinux, FaWindows } from "react-icons/fa";
import { MdCheckCircle, MdDownload, MdPhoneIphone } from "react-icons/md";
import { isDesktopApp } from "@/lib/desktop";
import { detectDownloadPlatform, type DownloadPlatform } from "@/lib/downloadTargets";
import { trackDownloadClick } from "@/lib/analytics";

const PLATFORMS: {
  id: DownloadPlatform;
  name: string;
  file: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "win", name: "Windows", file: ".exe", Icon: FaWindows },
  { id: "mac", name: "macOS", file: ".dmg", Icon: FaApple },
  { id: "linux", name: "Linux", file: ".AppImage", Icon: FaLinux },
  { id: "android", name: "Android", file: ".apk", Icon: FaAndroid },
];

type Detected = DownloadPlatform | "unknown" | "in-app" | null;

export function DownloadPanel() {
  const [detected, setDetected] = useState<Detected>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      if (isDesktopApp()) {
        setDetected("in-app");
        return;
      }
      setDetected(detectDownloadPlatform(navigator.userAgent) ?? "unknown");
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (detected === "in-app") {
    return (
      <div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-5 backdrop-blur-md shadow-lg shadow-cyan-500/10">
        <p className="flex items-center gap-2 font-bold text-cyan-300">
          <MdCheckCircle className="h-5 w-5 shrink-0 text-cyan-400" />
          Você já está usando o aplicativo nativo do Spectra
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Ele se atualiza automaticamente em segundo plano quando novas versões são lançadas.
        </p>
      </div>
    );
  }

  const main = PLATFORMS.find((p) => p.id === detected);

  return (
    <div>
      {main ? (
        <a
          href={`/download?platform=${main.id}`}
          onClick={() => trackDownloadClick("app-page", main.id)}
          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 text-base font-bold text-white shadow-xl shadow-cyan-500/25 transition duration-200 hover:from-cyan-400 hover:to-blue-500 hover:scale-[1.02] sm:w-auto"
        >
          <main.Icon className="h-5 w-5 shrink-0" />
          Baixar Spectra para {main.name} ({main.file})
        </a>
      ) : (
        <div className="min-h-[3.75rem]">
          {detected === "unknown" && (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 backdrop-blur-xl">
              <p className="flex items-center gap-2 font-semibold text-white">
                <MdPhoneIphone className="h-5 w-5 shrink-0 text-cyan-400" />
                Acesse direto pelo navegador ou escolha seu sistema abaixo
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                No celular, o Spectra roda com WebRTC nativo no navegador ou como PWA adicionado à tela de início.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Other Platforms Selector */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-500">Todas as plataformas:</span>
        {PLATFORMS.filter((p) => p.id !== detected).map(({ id, name, file, Icon }) => (
          <a
            key={id}
            href={`/download?platform=${id}`}
            onClick={() => trackDownloadClick("app-page", id)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-3.5 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md transition hover:border-cyan-500/40 hover:bg-zinc-800 hover:text-white"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
            {name}
            <span className="font-mono text-[10px] text-zinc-500">{file}</span>
          </a>
        ))}
        <a
          href="https://github.com/eobarretooo/Spectra/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-zinc-900/40 px-3.5 py-2 text-xs font-semibold text-zinc-400 transition hover:border-white/15 hover:text-cyan-300"
        >
          <MdDownload className="h-4 w-4 shrink-0 text-cyan-400" />
          Releases GitHub
        </a>
      </div>
    </div>
  );
}
