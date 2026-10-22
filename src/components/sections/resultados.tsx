import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { site } from "@/data/site";

// Resultados reais (Antes & Depois). Substituir pelas fotos aprovadas das clientes.
const casos = [
  { img: "/img/ba-corporal.webp", alt: "Antes e depois de tratamento corporal na Montanhal", tag: "Corporal" },
  { img: "/img/ba-facial.webp", alt: "Antes e depois de tratamento facial na Montanhal", tag: "Facial" },
];

export function Resultados() {
  return (
    <section id="resultados" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-primary">Resultados que falam por si</p>
          <h2 className="mt-1 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            Antes &amp; Depois
          </h2>
          <p className="mt-4 text-muted-foreground">
            Transformações reais de quem confiou na Montanhal. Cuidado, beleza e resultados reais.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          {casos.map((c) => (
            <div key={c.tag} className="group overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-border">
              <div className="relative aspect-[5/4] overflow-hidden">
                <Image
                  src={c.img}
                  alt={c.alt}
                  width={1000}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  {c.tag}
                </span>
                <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
                  <span className="bg-foreground/55 py-2 backdrop-blur-sm">Antes</span>
                  <span className="bg-primary/80 py-2 backdrop-blur-sm">Depois</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Quer ver o que a Montanhal pode fazer por você? Vamos conversar.
          </p>
          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <MessageCircle className="h-5 w-5" /> Agendar pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
