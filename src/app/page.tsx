import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { Hero } from "@/components/sections/hero";
import { Sobre } from "@/components/sections/sobre";
import { Servicos } from "@/components/sections/servicos";
import { Spa } from "@/components/sections/spa";
import { Resultados } from "@/components/sections/resultados";
import { Depoimentos } from "@/components/sections/depoimentos";
import { Contato } from "@/components/sections/contato";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Sobre />
        <Servicos />
        <Spa />
        <Resultados />
        <Depoimentos />
        <Contato />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
