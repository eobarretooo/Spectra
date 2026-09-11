// The pure decisions behind the /download route: which platform a visitor is
// on, and which release asset belongs to it.
//
// Split out of the route handler so it can be tested directly — a route file
// may only export HTTP methods and segment config, so anything here would
// otherwise be unreachable from a test. And this is the half worth testing:
// getting it wrong hands someone an installer their machine cannot run,
// which is a worse failure than the download simply not working.

/** The platforms that can be downloaded. */
export type DownloadPlatform = "win" | "mac" | "linux" | "android";

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

// Which file belongs to which platform, by extension.
const ASSET_PATTERN: Record<DownloadPlatform, RegExp> = {
  win: /\.exe$/i,
  mac: /\.dmg$/i,
  linux: /\.AppImage$/i,
  android: /\.apk$/i,
};

/**
 * Best-effort platform detection from a user agent.
 */
export function detectDownloadPlatform(userAgent: string): DownloadPlatform | null {
  if (/Android/i.test(userAgent)) return "android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return null;
  if (/Windows NT/i.test(userAgent)) return "win";
  if (/Mac OS X|Macintosh/i.test(userAgent)) return "mac";
  if (/Linux|X11/i.test(userAgent)) return "linux";
  return null;
}

/** Validates an explicit ?platform= override. */
export function parseDownloadPlatform(raw: string | null | undefined): DownloadPlatform | null {
  return raw === "win" || raw === "mac" || raw === "linux" || raw === "android" ? raw : null;
}

/** The asset for `platform` in a release's asset list, or null if absent. */
export function findReleaseAsset(
  assets: readonly ReleaseAsset[] | undefined,
  platform: DownloadPlatform
): ReleaseAsset | null {
  return assets?.find((asset) => ASSET_PATTERN[platform].test(asset.name)) ?? null;
}
