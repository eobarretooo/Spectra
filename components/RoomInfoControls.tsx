"use client";

import { useEffect, useRef, useState } from "react";
import { signalingClient } from "@/lib/signalingClient";
import {
  ROOM_CATEGORIES,
  MAX_ROOM_DESCRIPTION_LENGTH,
  roomCategory,
} from "@/lib/roomCategories";
import { Tooltip, Popover } from "./Tooltip";
import { ChevronDownIcon } from "./icons";

// How long the description input waits after the last keystroke before
// saving. Long enough that typing a sentence is one write rather than one per
// letter, short enough that clicking away right after typing doesn't feel
// like a race (the blur handler commits immediately anyway).
const SAVE_DEBOUNCE_MS = 700;

// The room's blurb and category, in the room header right of the
// public/private badge (see WatchRoom). Two shapes in one component because
// they are the same information either way: an owner/admin gets the editable
// controls, everyone else gets the same text read-only — and neither renders
// at all when there's nothing to say and nobody who can say it.
export function RoomInfoControls({
  description,
  category,
  canEdit,
}: {
  description: string;
  category: string | null;
  canEdit: boolean;
}) {
  const [draft, setDraft] = useState(description);
  const [categoryOpen, setCategoryOpen] = useState(false);
  // What the server last told us. Used to tell "the description changed
  // somewhere else" apart from "this input has unsaved keystrokes" — without
  // it, the echo of our own save (or another admin's edit) would overwrite
  // whatever is being typed right now.
  const serverValueRef = useRef(description);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (description === serverValueRef.current) return;
    const previousServerValue = serverValueRef.current;
    serverValueRef.current = description;
    // Only adopt the incoming value if this input has no edits of its own —
    // otherwise another admin's change would eat what's half-typed here.
    setDraft((current) => (current === previousServerValue ? description : current));
  }, [description]);

  // Nothing left to fire once this unmounts (leaving the room, losing admin).
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function scheduleSave(value: string) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNow(value), SAVE_DEBOUNCE_MS);
  }

  function saveNow(value: string) {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const trimmed = value.trim();
    // The server ignores a no-op too, but not sending it at all keeps the
    // blur-after-typing case from being a second write for the same text.
    if (trimmed === serverValueRef.current) return;
    signalingClient.setRoomInfo({ description: trimmed });
  }

  const active = roomCategory(category);

  if (!canEdit) {
    // Nothing set and nothing this viewer can do about it — no empty chips.
    if (!description && !active) return null;
    return (
      <div className="flex min-w-0 items-center gap-2">
        {active && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${active.className}`}
          >
            {active.label}
          </span>
        )}
        {description && (
          <Tooltip content={description} placement="bottom">
            <p className="min-w-0 truncate text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </Tooltip>
        )}
      </div>
    );
  }

  return (
    // flex-1 so the input claims the space between the room's badges and the
    // control group on the right, instead of collapsing to its placeholder —
    // but capped, since a description is a line, not a paragraph, and the
    // header still belongs to the controls.
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <Popover
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        placement="bottom-start"
        tooltip="Categoria da sala"
        content={
          <div className="flex w-52 max-w-[calc(100vw-1rem)] flex-col gap-0.5 rounded-2xl border border-white/10 bg-[#0c101c]/95 p-1.5 shadow-2xl backdrop-blur-xl">
            {/* Deliberately first: taking a category off is as ordinary as
                putting one on, and hiding it behind "Outros" would be a
                different thing entirely. */}
            <button
              type="button"
              onClick={() => {
                signalingClient.setRoomInfo({ category: null });
                setCategoryOpen(false);
              }}
              className={`rounded-xl px-2.5 py-1.5 text-left text-sm transition hover:bg-white/5 text-zinc-300 hover:text-white ${category === null ? "font-semibold text-cyan-300" : ""
                }`}
            >
              Sem categoria
            </button>
            {ROOM_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  signalingClient.setRoomInfo({ category: c.id });
                  setCategoryOpen(false);
                }}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-sm transition hover:bg-white/5 text-zinc-300 hover:text-white ${category === c.id ? "font-semibold text-cyan-300" : ""
                  }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.className}`} />
                {c.label}
              </button>
            ))}
          </div>
        }
      >
        <button
          type="button"
          onClick={() => setCategoryOpen((o) => !o)}
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${active
            ? active.className
            : "border border-white/10 bg-white/5 text-zinc-400 hover:border-cyan-500/30 hover:bg-white/10 hover:text-white"
            }`}
        >
          {active ? active.label : "Categoria"}
          <ChevronDownIcon className="h-3 w-3 shrink-0 opacity-70" />
        </button>
      </Popover>

      <input
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          scheduleSave(e.target.value);
        }}
        onBlur={() => saveNow(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        maxLength={MAX_ROOM_DESCRIPTION_LENGTH}
        placeholder="Descrição da sala..."
        aria-label="Descrição da sala"
        className="min-w-0 max-w-96 flex-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-200 outline-none placeholder:text-zinc-500 transition focus:border-cyan-500/50 focus:bg-white/10 focus:shadow-[0_0_10px_rgba(6,182,212,0.15)]"
      />
    </div>
  );
}
