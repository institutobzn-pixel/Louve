import type { MetadataRoute } from "next";

/**
 * Manifesto do PWA — permite instalar o app na tela inicial do celular
 * sem loja de aplicativos (docs/06). Servido em /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Louve — Gestão de Ministério de Louvor",
    short_name: "Louve",
    description:
      "Escala, repertório, ensaio e comunicação do ministério de louvor.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#09090e",
    theme_color: "#853aee",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
