"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WorldMap } from "@/components/WorldMap";
import { GlobeIcon } from "@/components/icons";
import { ThemeMenuButton } from "@/components/ThemeToggle";
import { UpdateAppButton } from "@/components/UpdateAppButton";
import { usePublicRoomMarkers } from "@/lib/usePublicRoomMarkers";
import { useGroupMapMarkers } from "@/lib/useGroupMapMarkers";

// What the map shows: everything, or one of its two kinds of pin. Live rooms
// (green) come and go with the people in them; groups (blue) stay where their
// owners put them.
type MapFilter = "all" | "rooms" | "groups";

export function RoomsMapClient() {
  // The same pins the location picker inside a room shows (see
  // ManageRoomModal) — one definition of what a room looks like on a map.
  const { rooms, markers: roomMarkers, error } = usePublicRoomMarkers();
  // And the groups placed on the map (see the group settings' map tab).
  const { groups, markers: groupMarkers, error: groupError } = useGroupMapMarkers();
  const [filter, setFilter] = useState<MapFilter>("all");

  const shown = useMemo(
    () =>
      filter === "rooms"
        ? roomMarkers
        : filter === "groups"
          ? groupMarkers
          : // Groups first, so a live room on the same spot draws on top.
            [...groupMarkers, ...roomMarkers],
    [filter, roomMarkers, groupMarkers]
  );

  const loading = rooms === null && groups === null;

  const filterButton = (id: MapFilter, label: string, count: number | null, dot?: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setFilter(id)}
      aria-pressed={filter === id}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition duration-200 ${
        filter === id
          ? "bg-cyan-500 text-zinc-950 shadow-[0_0_14px_rgba(6,182,212,0.35)]"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
      }`}
    >
      {dot && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            background: dot,
            boxShadow: `0 0 6px ${dot}`,
          }}
        />
      )}
      <span>{label}</span>
      {count !== null && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
            filter === id
              ? "bg-black/20 text-zinc-950"
              : "bg-white/10 text-zinc-300"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#07080d] text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/80 px-4 py-3.5 backdrop-blur-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Mapa de salas e grupos
            </h1>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
              Ao Vivo
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            {loading
              ? "Carregando coordenadas..."
              : roomMarkers.length + groupMarkers.length === 0
                ? "Nenhuma sala ou grupo definiu seu local no mapa ainda."
                : "Explore transmissões ativas e comunidades por cidade, estado ou país"}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            Privacidade total: cada alfinete é posicionado manualmente pelo criador. Nenhuma localização é rastreada ou detectada automaticamente.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ThemeMenuButton />
          <UpdateAppButton />
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 backdrop-blur-md transition duration-200 hover:border-cyan-500/40 hover:bg-white/10 hover:text-white"
          >
            <GlobeIcon className="h-4 w-4 text-cyan-400" />
            Ver em lista
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 backdrop-blur-md transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Início
          </Link>
        </div>
      </header>

      {/* Filter and Legend Bar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/60 px-4 py-2 backdrop-blur-md">
        <div
          role="group"
          aria-label="O que mostrar no mapa"
          className="inline-flex gap-1 rounded-xl border border-white/10 bg-zinc-900/90 p-1 shadow-inner backdrop-blur-lg"
        >
          {filterButton("all", "Todos os locais", roomMarkers.length + groupMarkers.length)}
          {filterButton(
            "rooms",
            "Salas ativas",
            rooms === null ? null : roomMarkers.length,
            "#06b6d4"
          )}
          {filterButton(
            "groups",
            "Grupos",
            groups === null ? null : groupMarkers.length,
            "#a855f7"
          )}
        </div>

        <div className="hidden items-center gap-4 text-xs text-zinc-400 sm:flex">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            <span>Salas ativas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
            <span>Grupos e comunidades</span>
          </div>
        </div>
      </div>

      {(error || groupError) && (
        <p className="border-b border-red-500/20 bg-red-950/40 px-4 py-2 text-xs font-medium text-red-400">
          {error ?? groupError}
        </p>
      )}

      {/* The map fills whatever is left of the page */}
      <div className="relative min-h-0 flex-1">
        <WorldMap markers={shown} searchable className="h-full w-full" />
      </div>
    </div>
  );
}
