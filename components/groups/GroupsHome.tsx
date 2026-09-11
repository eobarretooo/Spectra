"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import useNtPopups from "ntpopups";
import { MdAdd, MdChevronRight } from "react-icons/md";
import { GroupIcon } from "@/components/groups/GroupIcon";
import { GroupName } from "@/components/groups/GroupName";
import { useAuth } from "@/lib/AuthContext";
import { groupPath, inviteCodeFromInput, invitePath } from "@/lib/groupLinks";
import { useMyGroups } from "@/lib/useGroups";

// /groups — every group this person is in, and the two ways to get another.
// Laid out like the site's other list pages (see /amigos): a title, a line
// under it, and rows in bordered cards.

const primaryButton =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-zinc-950 transition duration-200 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40";
const secondaryButton =
  "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-200 backdrop-blur-md transition duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

const ROLE_LABEL = { owner: "Dono", admin: "Admin", member: "Membro" } as const;

export function GroupsHome() {
  const { openPopup } = useNtPopups();
  const { account, loading } = useAuth();
  const { groups } = useMyGroups();
  const canCreate = Boolean(account);
  const hasGroups = Boolean(groups && groups.length > 0);

  function createGroup() {
    if (canCreate) void openPopup("create_group", { data: {} });
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#07080d] text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Seus grupos
              </h1>
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 sm:text-sm">
              {hasGroups
                ? `${groups!.length} ${groups!.length === 1 ? "comunidade ativa" : "comunidades ativas"}`
                : "Crie ou participe de comunidades com salas de voz e chat contínuo."}
            </p>
          </div>
          {hasGroups && (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => void openPopup("join_group", { data: {} })}
                className={secondaryButton}
              >
                Entrar com convite
              </button>
              <button
                type="button"
                onClick={createGroup}
                disabled={!canCreate}
                title={canCreate ? undefined : "Crie uma conta para criar grupos"}
                className={primaryButton}
              >
                <MdAdd className="h-4 w-4" />
                Novo grupo
              </button>
            </div>
          )}
        </div>

        {!loading && !account && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 backdrop-blur-xl">
            <p className="text-xs text-zinc-300">
              Para criar e gerenciar seus próprios grupos com voz e canais, faça login ou crie sua conta no Spectra.
            </p>
            <Link
              href="/"
              className="ml-3 shrink-0 rounded-xl bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-cyan-400"
            >
              Criar conta
            </Link>
          </div>
        )}

        {groups === null ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 py-12 text-center text-zinc-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
            <p className="text-xs">Carregando grupos...</p>
          </div>
        ) : hasGroups ? (
          <ul className="mt-6 flex flex-col gap-3">
            {groups!.map((group) => (
              <li key={group.id}>
                <Link
                  href={groupPath(group.id)}
                  className={`group flex items-center gap-3.5 rounded-2xl border border-white/10 bg-zinc-900/80 p-3.5 backdrop-blur-xl shadow-xl transition duration-200 hover:-translate-y-0.5 hover:border-cyan-500/40 hover:bg-zinc-900 ${
                    group.suspended ? "opacity-60" : ""
                  }`}
                >
                  <GroupIcon
                    name={group.name}
                    iconUrl={group.iconUrl}
                    seed={group.id}
                    size={44}
                    className="rounded-xl border border-white/10 shadow-md"
                  />
                  <span className="min-w-0 flex-1">
                    <GroupName
                      name={group.name}
                      flags={group.flags}
                      className={`flex w-full text-sm font-semibold transition group-hover:text-cyan-400 ${
                        group.unread ? "text-white" : "text-zinc-200"
                      }`}
                    />
                    <div className="mt-1 flex items-center gap-2">
                      {group.suspended ? (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          Suspenso
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            group.role === "owner"
                              ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                              : group.role === "admin"
                                ? "border border-purple-500/30 bg-purple-500/10 text-purple-400"
                                : "border border-white/10 bg-white/5 text-zinc-400"
                          }`}
                        >
                          {ROLE_LABEL[group.role]}
                        </span>
                      )}
                      {group.unread && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-cyan-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                          novas mensagens
                        </span>
                      )}
                    </div>
                  </span>
                  {!group.suspended && group.mentions > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                      {group.mentions}
                    </span>
                  )}
                  <MdChevronRight className="h-5 w-5 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-400" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <section className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 backdrop-blur-xl shadow-2xl transition hover:border-cyan-500/30">
              <div>
                <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-400">
                  Criar Comunidade
                </span>
                <h2 className="mt-3 text-lg font-bold text-white">Criar um novo grupo</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  Um espaço exclusivo com salas de voz, compartilhamento de tela e chat para reunir amigos ou time.
                </p>
              </div>
              <button
                type="button"
                onClick={createGroup}
                disabled={!canCreate}
                title={canCreate ? undefined : "Crie uma conta para criar grupos"}
                className={`${primaryButton} self-start`}
              >
                <MdAdd className="h-4 w-4" />
                Criar grupo agora
              </button>
            </section>
            <section className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 backdrop-blur-xl shadow-2xl transition hover:border-purple-500/30">
              <div>
                <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-400">
                  Acessar com Convite
                </span>
                <h2 className="mt-3 text-lg font-bold text-white">Entrar em um grupo</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                  Cole o link ou código de convite que alguém compartilhou com você.
                </p>
              </div>
              <JoinByInvite />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/** The invite field, inline — pasting a link here beats opening a popup to paste it into. */
function JoinByInvite() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const code = inviteCodeFromInput(value);
    if (!code) {
      setError("Isso não parece um link de convite válido.");
      return;
    }
    router.push(invitePath(code));
  }

  return (
    <form onSubmit={submit} className="mt-auto flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder="spectra.live/invite/…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950/90 px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 outline-none transition focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
        />
        <button type="submit" disabled={!value.trim()} className={secondaryButton}>
          Entrar
        </button>
      </div>
      {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
    </form>
  );
}
