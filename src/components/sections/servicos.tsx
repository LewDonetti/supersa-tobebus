import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { facial, corporal, injetaveis, type Service } from "@/data/services";
import { site } from "@/data/site";

function Card({ s }: { s: Service }) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="aspect-[4/3] overflow-hidden">
        <Image
          src={s.img}
          alt={s.alt}
          width={440}
          height={330}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h4 className="font-display text-lg font-semibold text-foreground">{s.title}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
      </div>
    </div>
  );
}

function Grupo({ titulo, itens, cols }: { titulo: string; itens: Service[]; cols: string }) {
  return (
    <div className="mt-14">
      <div className="mb-6 flex items-center gap-4">
        <h3 className="font-display text-2xl font-semibold text-primary">{titulo}</h3>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className={`grid gap-6 ${cols}`}>
        {itens.map((s) => (
          <Card key={s.title} s={s} />
        ))}
      </div>
    </div>
  );
}

export function Servicos() {
  return (
    <section id="servicos" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-primary">O que fazemos por você</p>
          <h2 className="mt-1 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            Nossos serviços
          </h2>
          <p className="mt-4 text-muted-foreground">
            Estética facial, corporal e injetáveis — cada protocolo pensado para revelar a sua melhor versão.
          </p>
        </div>

        <Grupo titulo="Estética Facial" itens={facial} cols="sm:grid-cols-2 lg:grid-cols-4" />
        <Grupo titulo="Estética Corporal" itens={corporal} cols="sm:grid-cols-2 lg:grid-cols-3" />
        <Grupo titulo="Injetáveis" itens={injetaveis} cols="sm:grid-cols-2" />

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">Agende a sua avaliação e descubra o protocolo ideal para você.</p>
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
