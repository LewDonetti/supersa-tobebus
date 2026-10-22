"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { site, nav } from "@/data/site";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <a href="#inicio" className="flex items-center gap-2.5" aria-label={site.name}>
          <Image
            src="/img/logo-montanhal.png"
            alt={site.name}
            width={1322}
            height={1313}
            priority
            className="h-12 w-auto sm:h-14"
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-xl font-semibold text-foreground">
              Montanhal
            </span>
            <span className="-mt-1 font-script text-base text-primary">estética</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-105 sm:inline-flex"
          >
            <MessageCircle className="h-4 w-4" />
            Agendar
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex items-center justify-center rounded-xl bg-primary/10 p-2.5 text-primary lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <SheetTitle className="px-4 pt-4 font-display text-xl text-primary">
                Montanhal Estética
              </SheetTitle>
              <nav className="mt-4 flex flex-col gap-1 px-4">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 font-medium text-foreground/80 hover:bg-primary/10 hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
                >
                  <MessageCircle className="h-5 w-5" /> Agendar pelo WhatsApp
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
