import type { Metadata } from "next";
import { Cormorant_Garamond, Poppins, Parisienne } from "next/font/google";
import "./globals.css";

// Tipografia Montanhal: Cormorant Garamond (títulos, serifada elegante),
// Poppins (corpo) e Parisienne (detalhes em caligrafia, remetendo ao logo).
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Clínica Montanhal Estética | Estética Facial, Corporal & Injetáveis em Sapopemba – SP",
  description:
    "+10 anos transformando autoestima. Limpeza de pele, peeling, corporais, injetáveis e SPA no Jardim Planalto (Sapopemba), SP. Agende a sua avaliação pelo WhatsApp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${poppins.variable} ${parisienne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
