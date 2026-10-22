import Image from "next/image";
import { site } from "@/data/site";

const valores = [
  { t: "Autoestima", d: "Cada atendimento é pensado para você se sentir ainda mais confiante." },
  { t: "Tecnologia & técnica", d: "Protocolos modernos para resultados reais e seguros." },
  { t: "Bem-estar", d: "Ambiente acolhedor e um SPA para relaxar do início ao fim." },
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function Sobre() {
  return (
    <section id="sobre" className="bg-secondary/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Imagem do espaço */}
          <div className="relative">
            <div className="absolute -left-4 -top-4 hidden h-24 w-24 rounded-3xl bg-primary/20 lg:block" />
            <div className="absolute -bottom-4 -right-4 hidden h-20 w-20 rounded-full border-[6px] border-primary/25 lg:block" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-border">
              <Image
                src="/img/espaco.webp"
                alt="O espaço da Montanhal Estética — 200m², acolhedor e sofisticado"
                width={1000}
                height={800}
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </div>

          {/* Texto */}
          <div>
            <p className="font-script text-3xl text-primary">Sobre a Montanhal</p>
            <h2 className="mt-1 font-display text-4xl font-semibold text-foreground sm:text-5xl">
              +10 anos transformando autoestima
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              A Montanhal Estética nasceu em {site.since} e hoje é uma clínica completa, com{" "}
              <strong className="font-semibold text-foreground">200m²</strong>,{" "}
              <strong className="font-semibold text-foreground">6 salas de atendimento</strong> e{" "}
              <strong className="font-semibold text-foreground">SPA</strong>, no Jardim Planalto
              (Sapopemba), em São Paulo.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Unimos técnica, tecnologia e acolhimento para cuidar de você em cada detalhe.{" "}
              <span className="font-script text-2xl text-primary">Transformando vidas através das mãos.</span>
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {valores.map((v) => (
                <div key={v.t} className="rounded-2xl bg-card p-5 ring-1 ring-border">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Check />
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{v.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.d}</p>
                </div>
              ))}
            </div>

            {/* CEO */}
            <div className="mt-8 flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-border">
              <Image
                src="/img/equipe.webp"
                alt="Dra. Gabriela e equipe da Montanhal Estética"
                width={160}
                height={128}
                className="h-16 w-20 shrink-0 rounded-xl object-cover"
              />
              <div>
                <p className="font-display text-base font-semibold text-foreground">{site.ceo}</p>
                <p className="text-sm text-muted-foreground">{site.ceoRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
