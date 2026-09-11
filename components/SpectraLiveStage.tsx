"use client";

import { useState } from "react";
import { MdTune, MdHeadset, MdMic, MdGraphicEq, MdVolumeUp, MdVolumeOff, MdSpeed } from "react-icons/md";

export function SpectraLiveStage() {
  const [activeMute, setActiveMute] = useState<Record<string, boolean>>({
    discord: true,
    spotify: false,
    game: false,
  });

  const [simulatingSpeech, setSimulatingSpeech] = useState(true);

  function toggleApp(key: string) {
    setActiveMute((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/30 bg-zinc-950/80 shadow-[0_0_50px_-15px_rgba(6,182,212,0.2)] backdrop-blur-xl transition duration-300 hover:border-cyan-500/50">
      {/* Top ambient glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

      {/* Header bar of the simulated stage */}
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/90 px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-xs font-semibold text-zinc-300">
            spectra/sala-arena
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400">
            <span className="spectra-live-dot h-1.5 w-1.5 rounded-full bg-red-500" />
            120 FPS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
            4K HDR
          </span>
          <span className="font-mono text-[10px] text-zinc-400">12ms P2P</span>
        </div>
      </div>

      <div className="p-4">
        {/* Main shared screen video canvas simulation */}
        <div className="relative aspect-video overflow-hidden rounded-xl border border-cyan-500/25 bg-gradient-to-br from-zinc-950 via-slate-900 to-indigo-950 shadow-inner">
          {/* Cyber grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:14px_14px]" />

          {/* Center visual representation */}
          <div className="absolute inset-x-4 top-3 bottom-10 flex flex-col justify-between rounded-lg border border-white/10 bg-black/40 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="font-mono text-[11px] font-medium text-white/90">
                  Transmitindo: Valorant.exe
                </span>
              </div>
              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                <MdSpeed className="h-3.5 w-3.5" />
                DirectX 12 / WASAPI
              </span>
            </div>

            {/* Simulated Live Audio Equalizer */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300">
                <span>Mixagem P2P Estéreo 48kHz</span>
                <span>Bitrate: 58.4 Mbps</span>
              </div>
              <div className="flex h-7 items-end gap-1 rounded bg-black/50 p-1.5">
                {[30, 60, 90, 45, 80, 100, 75, 40, 95, 65, 85, 50, 100, 70, 40, 60, 85, 30].map(
                  (val, idx) => (
                    <span
                      key={idx}
                      className="spectra-eq-bar flex-1 rounded-full bg-gradient-to-t from-cyan-500 to-violet-400"
                      style={{
                        height: `${val}%`,
                        animationDelay: `${idx * 70}ms`,
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Bottom stream overlay pill */}
          <div className="absolute inset-x-3 bottom-2 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-0.5 font-medium text-zinc-300 backdrop-blur-md">
              <MdGraphicEq className="h-3 w-3 text-cyan-400" />
              Som do Jogo Ativo
            </span>
            <span className="rounded-full bg-black/70 px-2 py-0.5 font-mono text-zinc-400 backdrop-blur-md">
              Criptografia E2EE
            </span>
          </div>
        </div>

        {/* 3 Participant Tiles */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { name: "Você", gradient: "from-teal-900 to-emerald-950", speaking: simulatingSpeech },
            { name: "Maria", gradient: "from-purple-900 to-violet-950", speaking: false },
            { name: "Gabriel", gradient: "from-blue-900 to-indigo-950", speaking: true },
          ].map((user) => (
            <div
              key={user.name}
              className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-br ${user.gradient} transition-all duration-300 ${
                user.speaking
                  ? "border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                  : "border-white/10"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white shadow backdrop-blur-md">
                {user.name.slice(0, 1)}
              </span>
              <span className="absolute bottom-1 left-1.5 rounded bg-black/60 px-1 py-0.2 text-[9px] font-medium text-white/90">
                {user.name}
              </span>
              {user.speaking && (
                <span className="absolute right-1.5 bottom-1 flex h-2.5 items-end gap-[1.5px]">
                  {[0.5, 1, 0.7].map((h, i) => (
                    <span
                      key={i}
                      className="spectra-eq-bar w-[2px] rounded-full bg-cyan-300"
                      style={{ height: `${h * 100}%`, animationDelay: `${i * 140}ms` }}
                    />
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Audio Isolator Demo (The Killer Feature) */}
        <div className="mt-4 rounded-xl border border-white/10 bg-zinc-900/60 p-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <MdTune className="h-4 w-4 text-cyan-400" />
              Isolamento de Áudio por App (Exclusivo Spectra)
            </span>
            <button
              type="button"
              onClick={() => setSimulatingSpeech((prev) => !prev)}
              className="text-[10px] font-medium text-cyan-400 hover:underline cursor-pointer"
            >
              {simulatingSpeech ? "Pausar Velo" : "Testar Voz"}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            Clique para alternar o que seus amigos ouvem na transmissão:
          </p>

          <div className="mt-2.5 flex flex-col gap-1.5">
            {[
              { id: "game", name: "Valorant (Jogo)", volume: "100%", locked: false },
              { id: "spotify", name: "Spotify (Música)", volume: "45%", locked: false },
              { id: "discord", name: "Discord / Voz Externa", volume: "Mudo", locked: true },
            ].map((app) => {
              const isMuted = activeMute[app.id];
              return (
                <div
                  key={app.id}
                  onClick={() => toggleApp(app.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition select-none ${
                    isMuted
                      ? "border border-red-500/20 bg-red-500/10 text-zinc-400"
                      : "border border-cyan-500/30 bg-cyan-500/10 text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isMuted ? (
                      <MdVolumeOff className="h-4 w-4 text-red-400" />
                    ) : (
                      <MdVolumeUp className="h-4 w-4 text-cyan-400" />
                    )}
                    <span className="font-medium">{app.name}</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                      isMuted
                        ? "bg-red-500/20 text-red-300"
                        : "bg-cyan-500/20 text-cyan-300"
                    }`}
                  >
                    {isMuted ? "ISOLADO (FORA)" : `TRANSMITINDO (${app.volume})`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
