import Image from "next/image";
import { MessageCircle, Sparkles, Flame, Droplets, Flower2 } from "lucide-react";
import { spa } from "@/data/services";
import { site } from "@/data/site";

const icons = [Flower2, Flame, Sparkles, Droplets];

export function Spa() {
  return (
    <section id="spa" className="relative overflow-hidden bg-foreground py-16 text-background lg:py-24">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-gold/10 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        {/* Texto */}
        <div>
          <p className="font-script text-3xl text-primary">Um momento só seu</p>
          <h2 className="mt-1 font-display text-4xl font-semibold text-background sm:text-5xl">
            SPA Montanhal
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-background/70">
            Uma experiência de bem-estar pensada para relaxar o corpo e a mente.
            Cuidado, aconchego e sofisticação em cada detalhe.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {spa.map((item, i) => {
              const Icon = icons[i % icons.length];
              return (
                <div key={item.title} className="flex gap-4 rounded-2xl bg-background/5 p-5 ring-1 ring-background/10">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-background">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-background/60">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <MessageCircle className="h-5 w-5" /> Reservar meu momento
          </a>
        </div>

        {/* Imagem */}
        <div className="relative">
          <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-3xl bg-primary/30 lg:block" />
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-background/10">
            <Image
              src="/img/spa.webp"
              alt="Ambiente do SPA Montanhal — relaxamento e bem-estar"
              width={1200}
              height={800}
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
