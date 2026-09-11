"use client";

import { useState } from "react";
import { MdCheck, MdLock, MdVerified, MdStars, MdInfoOutline, MdAutoAwesome } from "react-icons/md";
import { useAuth } from "@/lib/AuthContext";
import { getUserBadges, useBadgesCatalog, type BadgeDefinition, type BadgeCategory } from "@/lib/badges";
import Link from "next/link";

const RARITY_MAP = {
  mythic: {
    label: "Mítico",
    tagClass: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.35)]",
    glow: "rgba(244, 63, 94, 0.4)",
    badgeBorder: "hover:border-rose-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]",
  },
  legendary: {
    label: "Lendário",
    tagClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.35)]",
    glow: "rgba(6, 182, 212, 0.4)",
    badgeBorder: "hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]",
  },
  epic: {
    label: "Épico",
    tagClass: "bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.35)]",
    glow: "rgba(139, 92, 246, 0.4)",
    badgeBorder: "hover:border-violet-500/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]",
  },
  rare: {
    label: "Raro",
    tagClass: "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.35)]",
    glow: "rgba(14, 165, 233, 0.4)",
    badgeBorder: "hover:border-sky-500/60 hover:shadow-[0_0_30px_rgba(14,165,233,0.25)]",
  },
  exclusive: {
    label: "Exclusivo",
    tagClass: "bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.35)]",
    glow: "rgba(236, 72, 153, 0.4)",
    badgeBorder: "hover:border-pink-500/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.25)]",
  },
} as const;

export function BadgesPanel() {
  const badges = useBadgesCatalog();
  const { account } = useAuth();
  const owned = account ? getUserBadges(account, true, badges) : [];
  const ownedIds = new Set(owned.map((badge) => badge.id));

  const [activeCategory, setActiveCategory] = useState<BadgeCategory | "my_badges">("all");
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  const filteredBadges = badges.filter((badge) => {
    if (activeCategory === "my_badges") {
      return ownedIds.has(badge.id);
    }
    if (activeCategory === "all") return true;
    return badge.category === activeCategory;
  });

  const progressPercent = badges.length > 0 ? Math.round((ownedIds.size / badges.length) * 100) : 0;

  return (
    <div className="relative min-h-screen flex-1 overflow-x-clip bg-[#07080d] text-zinc-100">
      {/* Dynamic Ambient Background Glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 h-[36rem] bg-[radial-gradient(60%_60%_at_50%_20%,rgba(6,182,212,0.18),transparent_75%)]"
        />
        <div
          className="pointer-events-none absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12),transparent_70%)]"
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.08),transparent_70%)]"
        />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header with Title & Stats */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <MdAutoAwesome className="h-3.5 w-3.5 text-cyan-400" />
              Galeria de Selos & Reconhecimento
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Badges do{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                Spectra
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
              Marcas de distinção e prestígio no perfil de quem as possui. Cada badge representa um marco:
              pioneirismo, apoio ao projeto ou maestria na comunidade.
            </p>
          </div>

          {/* User Progress Meter */}
          <div className="w-full md:w-72 shrink-0 rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <MdStars className="h-4 w-4 text-cyan-400" />
                Seu Progresso
              </span>
              <span className="text-cyan-400">
                {ownedIds.size} de {badges.length} ({progressPercent}%)
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-500 transition-all duration-500"
                style={{ width: `${Math.max(6, progressPercent)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              {account
                ? ownedIds.size > 0
                  ? "Continue participando para colecionar mais selos!"
                  : "Participe da comunidade ou assine o Pro para obter badges."
                : "Entre na sua conta para acompanhar seus selos."}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
          {[
            { id: "all", label: "Todas as Badges" },
            { id: "subscription", label: "Spectra Pro" },
            { id: "community", label: "Comunidade" },
            { id: "achievement", label: "Conquistas" },
            { id: "special", label: "Especiais" },
            { id: "my_badges", label: `Desbloqueadas (${ownedIds.size})` },
          ].map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition duration-200 ${
                  active
                    ? "border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "border border-white/5 bg-zinc-900/50 text-zinc-400 hover:border-white/10 hover:bg-zinc-800/80 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Badges Grid */}
        {filteredBadges.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-zinc-900/40 py-16 text-center">
            <MdLock className="h-10 w-10 text-zinc-600" />
            <p className="mt-3 text-sm font-semibold text-zinc-300">Nenhuma badge encontrada nesta categoria</p>
            <p className="mt-1 text-xs text-zinc-500">Você pode alternar os filtros acima para ver outras badges.</p>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBadges.map((badge) => {
              const isOwned = ownedIds.has(badge.id);
              const rarityInfo = badge.rarity ? RARITY_MAP[badge.rarity] : RARITY_MAP.rare;

              return (
                <li
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 ${rarityInfo.badgeBorder}`}
                  style={{
                    boxShadow: isOwned ? `0 0 24px -6px ${badge.glowColor || "rgba(6,182,212,0.2)"}` : undefined,
                  }}
                >
                  {/* Background Holographic Shimmer */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-20 blur-2xl transition duration-300 group-hover:scale-125 group-hover:opacity-40"
                    style={{ backgroundColor: badge.glowColor || "#06b6d4" }}
                  />

                  <div>
                    {/* Top Row: Rarity Tag & Ownership Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${rarityInfo.tagClass}`}
                      >
                        {rarityInfo.label}
                      </span>

                      {isOwned ? (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          <MdCheck className="h-3.5 w-3.5" />
                          Desbloqueada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full border border-zinc-700/50 bg-zinc-800/40 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500">
                          <MdLock className="h-3 w-3" />
                          Bloqueada
                        </span>
                      )}
                    </div>

                    {/* Badge Icon & Identity */}
                    <div className="mt-6 flex items-center gap-4">
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border transition duration-300 group-hover:scale-110 ${
                          badge.bgClass ?? "bg-zinc-800/60"
                        } ${badge.borderClass ?? "border-white/10"}`}
                        style={{
                          boxShadow: `0 0 20px ${badge.glowColor || "rgba(255,255,255,0.05)"}`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={badge.iconUrl} alt={badge.name} className="h-8 w-8 drop-shadow-md" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                          {badge.name}
                        </h2>
                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action / How To Unlock Hint */}
                  <div className="mt-6 border-t border-white/5 pt-3.5 flex items-center justify-between text-xs text-zinc-400">
                    <span className="truncate pr-2 font-medium text-zinc-300">
                      {badge.howToGet || "Disponível para membros qualificados"}
                    </span>
                    <span className="shrink-0 text-cyan-400 group-hover:underline">
                      Detalhes →
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-zinc-950 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: `0 0 50px -10px ${selectedBadge.glowColor || "rgba(6,182,212,0.3)"}`,
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute right-6 top-6 cursor-pointer rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-5">
              <div
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border ${
                  selectedBadge.bgClass ?? "bg-zinc-900"
                } ${selectedBadge.borderClass ?? "border-white/10"}`}
                style={{
                  boxShadow: `0 0 25px ${selectedBadge.glowColor || "rgba(255,255,255,0.1)"}`,
                }}
              >
                <img src={selectedBadge.iconUrl} alt={selectedBadge.name} className="h-10 w-10" />
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    selectedBadge.rarity ? RARITY_MAP[selectedBadge.rarity].tagClass : ""
                  }`}
                >
                  {selectedBadge.rarity ? RARITY_MAP[selectedBadge.rarity].label : "Exclusivo"}
                </span>
                <h3 className="mt-2 text-2xl font-bold text-white">{selectedBadge.name}</h3>
                <p className="text-sm text-zinc-400">{selectedBadge.description}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-2xl border border-white/5 bg-zinc-900/60 p-5">
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  <MdInfoOutline className="h-4 w-4" />
                  Como Desbloquear
                </h4>
                <p className="mt-1 text-sm text-zinc-300 leading-relaxed">
                  {selectedBadge.howToGet || "Badge concedida automaticamente aos usuários qualificados."}
                </p>
              </div>

              {selectedBadge.id === "pro" && (
                <div className="pt-2">
                  <Link
                    href="/pro"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-500"
                  >
                    Conhecer o Spectra Pro →
                  </Link>
                </div>
              )}

              {selectedBadge.id === "contributor" && (
                <div className="pt-2">
                  <a
                    href="https://github.com/eobarretooo/Spectra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
                  >
                    Ver Repositório no GitHub →
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="cursor-pointer rounded-xl bg-zinc-800 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
