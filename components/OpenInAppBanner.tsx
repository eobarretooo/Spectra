"use client";

import { useEffect, useState } from "react";
import { MdOutlineDesktopWindows } from "react-icons/md";
import { requestAppHandoff } from "@/lib/appHandoff";
import { isDesktopApp } from "@/lib/desktop";
import { detectDownloadPlatform } from "@/lib/downloadTargets";
import {
  getStoredOpenInAppDismissed,
  getStoredOpenRoomsInApp,
  setStoredOpenInAppDismissed,
} from "@/lib/mediaPreferences";
import { DownloadAppButton } from "./DownloadAppButton";

// The offer, for somebody the site has never seen use the app.
//
// It sits *inside* the room on purpose, and that is the whole shape of the
// feature: a stranger should not be stopped at the door and asked about
// software they may not own. They get the room. The offer sits above it, and
// only if they take it does anything change.
//
// Once taken and confirmed (see RoomAppGate, which watches for this tab
// actually losing the screen), the question moves in front of the door and
// this banner stops appearing — there is nothing left for it to find out.
export function OpenInAppBanner() {
  // Every decision here depends on localStorage and on whether we are inside
  // the app, neither of which exists during the server render — so the banner
  // renders nothing until after mount rather than hydrating into a mismatch.
  const [visible, setVisible] = useState(false);

  // Deferred by a tick rather than set synchronously in the effect body:
  // setting state there forces a second render pass before the browser
  // paints, which is the cascading-render pattern React 19 warns about.
  useEffect(() => {
    const id = setTimeout(() => {
      // Already in the app: there is nothing to hand off to.
      if (isDesktopApp()) return;
      // No mobile build exists (see electron-builder.yml), so on a phone this
      // would offer something that cannot be installed.
      if (!detectDownloadPlatform(navigator.userAgent)) return;
      // The installation is already known, so the gate asks before the room
      // is even joined and this would be the second offer on one screen.
      if (getStoredOpenRoomsInApp()) return;
      if (getStoredOpenInAppDismissed()) return;
      setVisible(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-zinc-950/90 to-zinc-950/90 px-3 py-2.5 text-xs sm:text-sm backdrop-blur-xl sm:px-4">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        <MdOutlineDesktopWindows className="h-4 w-4 shrink-0 text-cyan-400" />
      </div>
      <span className="text-zinc-200 font-medium">
        Isole o áudio e elimine o eco da sua transmissão utilizando o <strong className="text-cyan-400 font-bold">app oficial do Spectra</strong>!
      </span>
      <span className="ml-auto flex items-center gap-2">
        <DownloadAppButton source="room-banner" />
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            requestAppHandoff();
          }}
          className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition duration-200 hover:bg-cyan-500 hover:text-zinc-950 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
        >
          Abrir no app
        </button>
        <button
          type="button"
          onClick={() => {
            setStoredOpenInAppDismissed(true);
            setVisible(false);
          }}
          className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
        >
          Agora não
        </button>
      </span>
    </div>
  );
}
