import type { Metadata } from "next";
import { ogImage } from "@/lib/seo";
import Link from "next/link";
import { FaAndroid, FaApple, FaGithub, FaLinux, FaWindows } from "react-icons/fa";
import {
  MdCheck,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdClose,
  MdMemory,
  MdSecurity,
  MdTune,
  MdAutoAwesome,
  MdSpeed,
} from "react-icons/md";
import { SocialLinks } from "@/components/SocialLinks";
import { SiteHeader } from "@/components/SiteHeader";
import { DownloadPanel } from "./DownloadPanel";
import {
  FeatureArt,
  ParticipantArt,
  SharedScreenArt,
  type FeatureArtId,
} from "./FeatureArt";

const SITE_URL = "http://localhost:3000";
const RELEASES_API = "https://api.github.com/repos/eobarretooo/Spectra/releases/latest";

const TITLE = "Baixar o app do Spectra — Windows, macOS, Linux e Android";
const DESCRIPTION =
  "O Spectra como aplicativo: ultra leve, sem overlay nem processos pesados em segundo plano, e com o áudio da transmissão isolado por aplicativo — tire o Spotify, tire o WhatsApp, mande só o som do jogo. Grátis e código aberto.";

const OG_IMAGE = ogImage({
  title: "O Spectra no seu PC e Celular",
  subtitle: "Leve, sem overlay, e você escolhe quais sons saem da máquina.",
  badge: "App Nativo",
});

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "baixar spectra",
    "app de transmitir tela",
    "programa leve para compartilhar tela",
    "transmitir tela com som do sistema",
    "escolher quais sons transmitir",
    "compartilhar tela sem vazar spotify",
    "compartilhar tela sem eco",
    "spectra para pc",
    "spectra windows",
    "spectra android apk",
  ],
  alternates: { canonical: "/app" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: `${SITE_URL}/app`,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Spectra para Computador e Celular",
  url: `${SITE_URL}/app`,
  description: DESCRIPTION,
  applicationCategory: "CommunicationApplication",
  operatingSystem: "Windows, macOS, Linux, Android",
  inLanguage: "pt-BR",
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
};

const BENEFITS: { title: string; body: string; art: FeatureArtId; tag?: string }[] = [
  {
    title: "Pesa menos que os programas de sempre",
    body: "Sem overlay de jogo travando seus FPS, sem rich presence ou processos misteriosos o dia todo. Uma janela rápida que abre para transmitir e fecha quando acabou.",
    art: "weight",
  },
  {
    title: "Você escolhe exatamente quais sons vão",
    body: "Lista em tempo real dos programas tocando áudio. Tire o Spotify e sua música fica só com você. Nos outros programas, o som da tela vai inteiro sem filtro.",
    art: "audio-pick",
  },
  {
    title: "Processa só o que alguém vê",
    body: "Cada espectador recebe dinamicamente a resolução e bitrate que seu tile consome. Economiza banda e processamento do seu computador.",
    art: "quality",
  },
  {
    title: "Som do sistema sem eco",
    body: "No navegador comum, a captura leva o próprio áudio da call gerando loop e eco. No app desktop do Spectra, as vozes dos amigos são isoladas automaticamente.",
    art: "echo",
    tag: "Windows",
  },
  {
    title: "Seletor de tela nativo",
    body: "Seletor rápido integrado ao sistema operacional, com controle de áudio de tela ao lado, sem os diálogos genéricos e lentos de browsers.",
    art: "picker",
  },
  {
    title: "Janela dedicada do Spectra",
    body: "Sem risco de fechar a chamada sem querer ao fechar abas do navegador. Fica na barra de tarefas como qualquer programa profissional.",
    art: "window",
  },
  {
    title: "Atualizações transparentes",
    body: "Baixa em segundo plano direto das releases do GitHub e aplica sem atrapalhar sua gameplay ou conversa.",
    art: "update",
  },
];

const COMPARISON = {
  spectra: [
    "Abre quando você vai transmitir e fecha quando acabou — zero bloatware",
    "Você marca, app por app, quais sons ficam fora da transmissão",
    "Vídeo e voz ponto a ponto (P2P WebRTC Mesh) de ultra baixa latência",
    "Codificação adaptativa até 4K e 120 FPS",
    "Funciona sem instalar nada pelo navegador, ou com app dedicado para PC e Android",
    "Código 100% aberto e auditável no GitHub oficial",
  ],
  others: [
    "Iniciam com o Windows e gastam gigabytes de RAM em segundo plano",
    "O som do sistema vai inteiro (vaza Spotify, WhatsApp e chamadas privadas)",
    "Overlays intrusivos e lojas embutidas drenando a GPU durante jogos",
    "Transmissões em 60fps ou 1080p presas atrás de assinaturas mensais caras",
  ],
};

const MUTED_APPS = [
  { name: "Spectra", checked: true, locked: true },
  { name: "Spotify", checked: true },
  { name: "WhatsApp", checked: true },
  { name: "Navegador", checked: false },
  { name: "Steam / Jogo", checked: false },
];

const PARTICIPANTS = [
  { name: "Você", gradient: "from-emerald-700 to-teal-900" },
  { name: "Maria", gradient: "from-fuchsia-700 to-purple-900", speaking: true },
  { name: "João", gradient: "from-sky-700 to-indigo-900" },
  { name: "Gabriel", gradient: "from-amber-600 to-orange-900" },
];

const PLATFORM_ROWS = [
  {
    name: "Windows",
    file: ".exe",
    Icon: FaWindows,
    color: "text-sky-400",
    note: "Instalador nativo com suporte a captura WASAPI e isolamento de som por aplicativo exclusivo.",
  },
  {
    name: "macOS",
    file: ".dmg",
    Icon: FaApple,
    color: "text-zinc-200",
    note: "Binário universal: roda nativamente em Apple Silicon (M1/M2/M3/M4) e Intel com aceleração Metal.",
  },
  {
    name: "Linux",
    file: ".AppImage",
    Icon: FaLinux,
    color: "text-amber-400",
    note: "Pacote universal sem dependências de distro: dê permissão de execução (chmod +x) e abra.",
  },
  {
    name: "Android",
    file: ".apk",
    Icon: FaAndroid,
    color: "text-emerald-400",
    note: "App nativo com WebRTC acelerado por hardware para assistir e falar em salas de qualquer lugar.",
  },
];

const FAQ = [
  {
    q: "Preciso do app para usar o Spectra?",
    a: "Não. O site funciona 100% no navegador (Edge, Chrome, Firefox, Safari) sem nenhuma instalação prévia. O app para PC e Android existe para quem busca recursos avançados como isolamento de áudio por aplicativo, menor consumo de hardware e janela dedicada.",
  },
  {
    q: "O app deixa processos rodando em segundo plano?",
    a: "Não. Diferente do Discord ou outros mensageiros, o Spectra não possui serviços de segundo plano, inicialização forçada ou telemetria invasiva. Fechou a janela, o processo é finalizado instantaneamente.",
  },
  {
    q: "É gratuito?",
    a: "Sim. O aplicativo é totalmente gratuito e de código aberto. O Spectra Pro oferece recursos adicionais como badges exclusivas e resoluções até 4K/120fps, sem bloquear as funções essenciais de compartilhamento de tela.",
  },
  {
    q: "Como funciona o isolamento de áudio?",
    a: "No Windows, o Spectra lê as sessões de áudio ativas via WASAPI. Você marca quais programas (ex: Spotify, Discord, navegador) devem ser ignorados: você continua ouvindo a música no fone, mas seus espectadores ouvem apenas o som do jogo.",
  },
  {
    q: "O Windows exibiu um aviso do SmartScreen. É seguro?",
    a: "Sim. Como o projeto é independente e de código aberto sem certificado corporativo pago de assinatura de código, o Windows avisa na primeira execução. Você pode conferir todo o código-fonte e compilações diretamente no repositório GitHub oficial.",
  },
  {
    q: "Como baixar para Android?",
    a: "Você pode baixar o arquivo APK diretamente da seção de Releases do GitHub do projeto e instalar em qualquer smartphone ou tablet Android, ou adicionar o Spectra à tela de início como PWA.",
  },
];

const sectionClass = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";
const h2Class = "text-2xl font-bold tracking-tight text-white sm:text-3xl";

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(RELEASES_API, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "spectra-app-page",
      },
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const release = (await res.json()) as { tag_name?: string };
    return release.tag_name ?? null;
  } catch {
    return null;
  }
}

export default async function AppPage() {
  const version = await fetchLatestVersion();

  return (
    <>
      <SiteHeader />
      <div className="relative min-h-screen flex-1 overflow-hidden bg-[#07080d] text-zinc-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Ambient Glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[36rem] bg-[radial-gradient(60%_60%_at_50%_20%,rgba(6,182,212,0.18),transparent_75%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12),transparent_70%)]"
        />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-20">
          <div className={`${sectionClass} grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16`}>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
                <MdAutoAwesome className="h-3.5 w-3.5 text-cyan-400" />
                Windows · macOS · Linux · Android
                {version && (
                  <span className="ml-1 rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                    {version}
                  </span>
                )}
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
                Leve na máquina, com o som{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                  do jeito que você quer
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Mesma sala, mesmo link, mesma conta. O Spectra como app oferece o que nenhum outro programa entrega:
                captura nativa de alta fidelidade e escolha individual de quais sons saem do seu computador.
              </p>
              <div className="mt-8">
                <DownloadPanel />
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-zinc-400">
                {["100% Gratuito", "Sem cadastro obrigatório", "Código Aberto no GitHub"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <MdCheck className="h-4 w-4 text-cyan-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop Mockup Preview */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-zinc-400">spectra/sala-jogos</span>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-400">
                  120 FPS · 4K
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4">
                <div className="col-span-2">
                  <SharedScreenArt />
                </div>
                {PARTICIPANTS.map((participant) => (
                  <ParticipantArt key={participant.name} {...participant} />
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-zinc-900/40 px-4 py-3 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-1 font-semibold text-cyan-300">
                  <MdTune className="h-3.5 w-3.5" />
                  Som: 2 apps isolados
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-zinc-500">
                  <MdMemory className="h-3.5 w-3.5 text-zinc-400" />
                  0 processos em 2º plano
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className={`${sectionClass} py-16 border-t border-white/5`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Vantagens do App Nativo
            </span>
            <h2 className={`mt-2 ${h2Class}`}>O que você ganha instalando o Spectra</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              A janela executa com aceleração gráfica total e acesso direto aos subsistemas de áudio da sua máquina,
              sem interferir na performance dos seus jogos.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ title, body, art, tag }) => (
              <div
                key={title}
                className="group rounded-3xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-xl shadow-lg transition duration-300 hover:-translate-y-1.5 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
              >
                <FeatureArt id={art} />
                <div className="mt-5 flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white group-hover:text-cyan-300 transition">
                    {title}
                  </h3>
                  {tag && (
                    <span className="shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                      {tag}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Audio Isolation Showcase */}
        <section className={`${sectionClass} py-16`}>
          <div className="grid gap-10 rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-8 shadow-2xl backdrop-blur-2xl sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                <MdTune className="h-4 w-4 text-cyan-400" />
                Tecnologia Exclusiva Spectra
              </div>
              <h2 className={`mt-4 ${h2Class}`}>Nada vaza sem você autorizar</h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Nos outros programas de compartilhamento, o áudio é tudo ou nada: seus amigos ouvem seu jogo, suas conversas
                paralelas e suas músicas ao mesmo tempo. No Spectra, você marca exatamente quem fica de fora.
              </p>
              <ul className="mt-6 space-y-3.5 text-sm text-zinc-300">
                <li className="flex items-start gap-3">
                  <MdCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong className="text-white font-semibold">Tire o Spotify:</strong> Ouça sua playlist sem ninguém na sala escutar.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MdCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong className="text-white font-semibold">Tire o WhatsApp:</strong> Ouça áudios privados sem a transmissão ouvir junto.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MdCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>
                    <strong className="text-white font-semibold">Sem eco de voz:</strong> O som da própria chamada é isolado na raiz.
                  </span>
                </li>
              </ul>
              <p className="mt-6 text-xs text-zinc-500">
                * Escolha individual por aplicativo disponível para Windows via WASAPI Loopback.
              </p>
            </div>

            {/* Interactive Audio Panel Simulator */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="font-bold text-white text-sm">Painel de Isolamento de Áudio</p>
                  <p className="text-[11px] text-zinc-400">Apps ativos no sistema operacional agora</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Ativo
                </span>
              </div>

              <ul className="mt-4 space-y-2">
                {MUTED_APPS.map(({ name, checked, locked }) => (
                  <li
                    key={name}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition ${
                      checked
                        ? "border border-cyan-500/30 bg-cyan-500/10 text-white"
                        : "border border-white/5 bg-zinc-900/50 text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {checked ? (
                        <MdCheckBox className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <MdCheckBoxOutlineBlank className="h-5 w-5 text-zinc-600" />
                      )}
                      <span className="font-medium text-xs sm:text-sm">{name}</span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider rounded-md px-2 py-0.5 ${
                        checked
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {locked ? "Sempre Isolado" : checked ? "Isolado (Fora)" : "Transmitindo"}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                <span className="text-zinc-400">Status da Transmissão:</span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Som do Jogo Ativo (48kHz)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className={`${sectionClass} py-16`}>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Comparativo Direto
            </span>
            <h2 className={`mt-2 ${h2Class}`}>Um programa de transmissão, não um cliente pesado</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Veja a diferença entre um aplicativo enxuto focado em desempenho contra plataformas inchadas.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* Spectra */}
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <img src="/spectra-logo.svg" alt="Spectra" className="h-6 w-6" />
                <h3 className="text-lg font-bold text-white">No Spectra</h3>
              </div>
              <ul className="mt-6 space-y-3.5">
                {COMPARISON.spectra.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-200">
                    <MdCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Others */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-bold text-zinc-400">Nos programas de call de sempre</h3>
              <ul className="mt-6 space-y-3.5">
                {COMPARISON.others.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-500">
                    <MdClose className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4 Platforms Grid */}
        <section className={`${sectionClass} py-16`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Compatibilidade Total
            </span>
            <h2 className={`mt-2 ${h2Class}`}>Suporte nativo para todas as plataformas</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_ROWS.map(({ name, file, Icon, color, note }) => (
              <div
                key={name}
                className="group rounded-3xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-xl shadow-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/80 shadow-md">
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{name}</h3>
                    <p className="font-mono text-xs text-zinc-500">{file}</p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-zinc-400">{note}</p>
                <div className="mt-5 border-t border-white/5 pt-3">
                  <Link
                    href={name === "Android" ? "/download?platform=android" : `/download?platform=${name.toLowerCase().slice(0, 3)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    Baixar {file} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
            <MdSecurity className="h-4 w-4 shrink-0 text-cyan-400" />
            Todos os binários são gerados diretamente via GitHub Actions de código aberto.
          </p>
        </section>

        {/* FAQ Section */}
        <section className={`${sectionClass} py-16`}>
          <h2 className={h2Class}>Perguntas frequentes</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-md backdrop-blur-xl transition hover:border-white/20"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                  {q}
                  <span className="shrink-0 text-xl font-light text-cyan-400 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400 sm:text-sm">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className={`${sectionClass} pb-20`}>
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-zinc-900/90 to-zinc-950 p-10 text-center shadow-2xl backdrop-blur-2xl sm:p-14">
            <h2 className={`text-3xl font-extrabold text-white sm:text-4xl`}>
              Baixe o Spectra e comece agora
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              Sua conta, histórico de amigos e salas continuam os mesmos. O aplicativo substitui a aba com o máximo
              em performance e controle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <DownloadPanel />
              <a
                href="https://github.com/eobarretooo/Spectra"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-6 py-4 text-base font-semibold text-zinc-200 backdrop-blur-xl transition duration-200 hover:border-white/20 hover:bg-zinc-800 hover:text-white"
              >
                <FaGithub className="h-5 w-5" />
                Código no GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Clean Footer (No Adsterra Bloat) */}
        <footer className={`${sectionClass} pb-16 text-center text-xs text-zinc-500`}>
          <SocialLinks className="mb-8" />
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/termos" className="hover:text-zinc-300 transition">
              Termos de uso
            </Link>
            <span>•</span>
            <Link href="/badges" className="hover:text-zinc-300 transition">
              Badges
            </Link>
            <span>•</span>
            <Link href="/pro" className="hover:text-zinc-300 transition">
              Spectra Pro
            </Link>
            <span>•</span>
            <a
              href="https://github.com/eobarretooo/Spectra"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition"
            >
              GitHub Oficial
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
