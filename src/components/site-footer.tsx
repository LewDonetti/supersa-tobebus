import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { site, nav } from "@/data/site";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="bg-foreground text-background/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-background">
              Montanhal <span className="font-script text-primary">estética</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/60">
              Estética Facial, Corporal &amp; Injetáveis. +10 anos transformando
              autoestima — cada detalhe pensado para revelar a sua melhor versão.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full bg-background/10 p-2.5 transition-colors hover:bg-primary hover:text-primary-foreground">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-background/10 p-2.5 transition-colors hover:bg-primary hover:text-primary-foreground">
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background">Navegação</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-background/60 transition-colors hover:text-primary">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background">Contato</h3>
            <ul className="mt-4 space-y-3.5 text-sm text-background/60">
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{site.phoneDisplay}</a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{site.address}</span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{site.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-background/10 pt-6 text-center text-xs text-background/50">
          © {year} {site.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
