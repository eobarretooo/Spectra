import { FaDiscord } from "react-icons/fa6";

// Only official Spectra community link
const LINKS = [
  {
    label: "discord.gg/spectra",
    href: "https://discord.gg/p8ZRn2SKm",
    Icon: FaDiscord,
    hover: "hover:border-[#5865F2]/50 hover:text-[#5865F2] dark:hover:text-[#a5adff]",
  },
];

// This used to also carry the attribution line Google requires in exchange
// for hiding the reCAPTCHA badge. Turnstile neither plants a badge nor asks
// for attribution, so the footer is back to being only the follow links.

/**
 * Row of follow links. `title` is the line above them — pass null on a
 * surface that already says what they are.
 */
export function SocialLinks({
  title = "Acompanhe o Spectra",
  className = "",
}: {
  title?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      {title && (
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {LINKS.map(({ label, href, Icon, hover }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-600 transition dark:border-zinc-700 dark:text-zinc-400 ${hover}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
