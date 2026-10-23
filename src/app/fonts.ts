import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

// Hospedadas localmente pelo next/font (sem requisição ao Google no navegador).
export const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
export const mono = JetBrains_Mono({ subsets: ["latin"], weight: "500", variable: "--font-mono", display: "swap" });
