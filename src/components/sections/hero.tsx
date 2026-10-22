"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { MessageCircle, Star, ArrowRight } from "lucide-react";
import { site } from "@/data/site";

const fade: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.1 },
  }),
};

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      {/* brilho decorativo dourado */}
      <div className="pointer-events-none absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-gold/15 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:pb-24 lg:pt-16">
        {/* Texto */}
        <div>
          <motion.p
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {site.tagline} · Sapopemba, SP
          </motion.p>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-6 font-display text-5xl font-semibold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl"
          >
            Realce a sua{" "}
            <span className="text-primary">melhor versão.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground"
          >
            +10 anos de autocuidado, beleza e tecnologia. Cada protocolo é pensado
            para transformar a sua autoestima com resultados reais.{" "}
            <span className="font-script text-3xl text-primary">Você merece esse momento.</span>
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:brightness-105"
            >
              <MessageCircle className="h-5 w-5" /> Agendar pelo WhatsApp
            </a>
            <a
              href="#servicos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
            >
              Conhecer os serviços <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{site.rating.value}</span> no Google
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">200m²</span> · 6 salas · SPA
            </p>
          </motion.div>
        </div>

        {/* Imagem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <div className="absolute -right-4 -top-5 hidden h-24 w-24 rounded-3xl bg-primary lg:block" />
          <div className="absolute -bottom-5 -left-5 hidden h-20 w-20 rounded-full border-[6px] border-primary/30 lg:block" />
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/20 ring-1 ring-black/5">
            <Image
              src="/img/hero.webp"
              alt="Experiência de estética e autocuidado na Montanhal Estética"
              width={1200}
              height={900}
              priority
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
