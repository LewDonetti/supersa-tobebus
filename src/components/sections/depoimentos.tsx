import { Star } from "lucide-react";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { site } from "@/data/site";

export function Depoimentos() {
  return (
    <section id="depoimentos" className="bg-secondary/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-primary">Quem passa pela Montanhal, recomenda</p>
          <h2 className="mt-1 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            O que dizem as nossas clientes
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{site.rating.value}</span> · avaliações no Google
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <StaggerTestimonials />
      </div>
    </section>
  );
}
