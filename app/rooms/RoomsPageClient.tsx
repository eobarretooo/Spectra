"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { fetchPublicRooms, roomActivity, type PublicRoom } from "@/lib/roomsApi";
import { Tooltip } from "@/components/Tooltip";
import { CameraIcon, MicIcon, ScreenIcon, VideoSourceIcon } from "@/components/icons";
import { roomCategory } from "@/lib/roomCategories";
import { SiteHeader } from "@/components/SiteHeader";
import { MdOutlineSearch, MdTune, MdOutlineVideocam } from "react-icons/md";

const POLL_INTERVAL_MS = 8000;

const SORT_OPTIONS = [
  { value: "mic", label: "Mais microfones ativos" },
  { value: "people", label: "Mais pessoas conectadas" },
  { value: "screen", label: "Mais transmissões de tela" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const DEFAULT_SORT: SortValue = "mic";

function sortRooms(rooms: PublicRoom[], sort: SortValue): PublicRoom[] {
  const primary = (room: PublicRoom): number => {
    if (sort === "mic") return roomActivity(room, "micCount");
    if (sort === "screen") return roomActivity(room, "screenCount");
    return room.peopleCount;
  };
  return [...rooms].sort(
    (a, b) =>
      primary(b) - primary(a) ||
      b.peopleCount - a.peopleCount ||
      a.createdAt - b.createdAt
  );
}

function formatActiveFor(createdAt: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
  if (seconds < 60) return "há poucos segundos";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
  const days = Math.floor(hours / 24);
  return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}

function RoomStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) {
  const active = value > 0;
  return (
    <Tooltip content={`${value} ${label.toLowerCase()}`}>
      <span
        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
          active
            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
            : "border-white/5 bg-zinc-950/40 text-zinc-500"
        }`}
      >
        {icon}
        <span>{value}</span>
      </span>
    </Tooltip>
  );
}

export function RoomsPageClient() {
  const [rooms, setRooms] = useState<PublicRoom[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>(DEFAULT_SORT);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const data = await fetchPublicRooms(controller.signal);
        if (cancelled) return;
        setRooms(data);
        setError(null);
      } catch {
        if (!cancelled) setError("Não foi possível carregar as salas públicas.");
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(
    () =>
      sortRooms(rooms ?? [], sort).filter((r) =>
        r.handle.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [rooms, sort, search]
  );

  return (
    <div className="relative min-h-screen flex-1 overflow-x-clip bg-[#07080d] text-zinc-100">
      <SiteHeader />

      {/* Ambient Glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 h-[36rem] bg-[radial-gradient(60%_60%_at_50%_20%,rgba(6,182,212,0.15),transparent_75%)]"
        />
      </div>

      <main className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Explorar Comunidade
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Salas Públicas do{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                Spectra
              </span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Salas ativas agora transmitindo jogos, código e conversas abertas. Entre para assistir ou interagir.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-5 py-2.5 text-xs font-semibold text-zinc-200 backdrop-blur-xl transition hover:border-white/20 hover:bg-zinc-800"
          >
            ← Voltar ao Início
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MdOutlineSearch className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome da sala..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <MdTune className="h-4 w-4 text-cyan-400" />
              Ordenar por:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="rounded-2xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-xs font-semibold text-white outline-none focus:border-cyan-400"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-zinc-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room List Content */}
        <div className="mt-8">
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
              {error}
            </div>
          )}

          {!error && rooms === null && (
            <div className="flex items-center justify-center py-20 text-sm text-zinc-500">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mr-3" />
              Carregando salas ativas…
            </div>
          )}

          {!error && rooms !== null && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-zinc-900/40 py-20 text-center">
              <MdOutlineVideocam className="h-10 w-10 text-zinc-600" />
              <p className="mt-3 text-sm font-semibold text-zinc-300">
                {rooms.length === 0
                  ? "Nenhuma sala pública ativa no momento."
                  : "Nenhuma sala encontrada para essa pesquisa."}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Você pode ser o primeiro a abrir uma sala pública agora!
              </p>
              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
              >
                Criar uma sala
              </Link>
            </div>
          )}

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((room) => {
              const category = roomCategory(room.category);
              return (
                <li
                  key={room.handle}
                  className="group flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-900/80 p-5 backdrop-blur-xl shadow-lg transition duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <Tooltip content={room.handle}>
                          <p className="truncate text-base font-bold text-white group-hover:text-cyan-300 transition">
                            {room.handle}
                          </p>
                        </Tooltip>
                      </div>

                      {category && (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${category.className}`}
                        >
                          {category.label}
                        </span>
                      )}
                    </div>

                    {room.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                        {room.description}
                      </p>
                    )}

                    <p className="mt-2 text-[11px] font-mono text-zinc-500">
                      {room.peopleCount} {room.peopleCount === 1 ? "pessoa" : "pessoas"} · ativa{" "}
                      {formatActiveFor(room.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1.5">
                      <RoomStat
                        icon={<MicIcon className="h-3 w-3" />}
                        value={roomActivity(room, "micCount")}
                        label="Microfones"
                      />
                      <RoomStat
                        icon={<ScreenIcon className="h-3 w-3" />}
                        value={roomActivity(room, "screenCount")}
                        label="Telas"
                      />
                      <RoomStat
                        icon={<CameraIcon className="h-3 w-3" />}
                        value={roomActivity(room, "cameraCount")}
                        label="Câmeras"
                      />
                      <RoomStat
                        icon={<VideoSourceIcon className="h-3 w-3" />}
                        value={roomActivity(room, "videoSourceCount")}
                        label="Vídeos"
                      />
                    </div>

                    <Link
                      href={`/watch/${room.handle}`}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
                    >
                      Entrar →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
}
