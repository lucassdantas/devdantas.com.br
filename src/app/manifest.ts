import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

/** Nome e ícones quando o site é salvo na tela inicial do celular. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.brand,
    short_name: site.brand,
    start_url: "/",
    display: "browser",
    background_color: "#FFFFFF",
    theme_color: "#0B6CB5",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
