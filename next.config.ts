import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100% estático: `npm run build` gera a pasta out/
  output: "export",
  // Sem servidor de imagens no export estático: as imagens já são otimizadas
  // (WebP) pelo script `npm run assets`.
  images: { unoptimized: true },
  reactStrictMode: true,
  // 404 única para o site todo (há um root layout por idioma).
  experimental: { globalNotFound: true },
};

export default nextConfig;
