import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest (see get-metadata-route.js's naming for
// the "manifest" special case) — layout.tsx's `metadata.manifest` is what
// actually links it into <head>, since Next doesn't do that automatically
// just from this file existing.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spectra — Transmissão de Tela em Alta Definição",
    short_name: "Spectra",
    description:
      "Transmita sua tela, câmera e voz com ultra baixa latência, direto do navegador. Crie uma sala em instantes sem cadastro.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b10",
    theme_color: "#0a0b10",
    icons: [
      {
        src: "/spectra-logo.svg",
        sizes: "500x500",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
