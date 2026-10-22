"use client";

import { useState } from "react";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { site } from "@/data/site";

// Chave gratuita do Web3Forms (crie em web3forms.com com o e-mail da clínica).
// Enquanto vazia, o envio por e-mail cai no WhatsApp para não perder o lead.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

const assuntos = ["Agendar avaliação", "Estética Facial", "Estética Corporal", "Injetáveis", "SPA", "Outro"];
const trust = ["Respondemos rápido", "Sem compromisso", "Atendimento acolhedor"];

export function Contato() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    assunto: assuntos[0],
    mensagem: "",
  });

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(d.length - 4)}`;
    if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 0) return `(${d}`;
    return "";
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Informe o seu nome.";
    if (form.telefone.replace(/\D/g, "").length < 10) e.telefone = "Telefone válido com DDD.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido.";
    if (form.mensagem.trim().length < 3) e.mensagem = "Escreva uma mensagem.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const waMessage = () =>
    `*Novo contato pelo site Montanhal Estética*%0A%0A` +
    `*Nome:* ${encodeURIComponent(form.nome)}%0A` +
    `*Telefone:* ${encodeURIComponent(form.telefone)}%0A` +
    (form.email ? `*E-mail:* ${encodeURIComponent(form.email)}%0A` : "") +
    `*Assunto:* ${encodeURIComponent(form.assunto)}%0A%0A` +
    `${encodeURIComponent(form.mensagem)}`;

  const sendWhats = () => {
    if (!validate()) return;
    window.open(`https://wa.me/${site.whatsappNumber}?text=${waMessage()}`, "_blank", "noopener");
  };

  const sendEmail = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (!WEB3FORMS_KEY) {
      // Sem chave configurada → não perde o lead: envia pelo WhatsApp.
      window.open(`https://wa.me/${site.whatsappNumber}?text=${waMessage()}`, "_blank", "noopener");
      setSent(true);
      return;
    }
    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Contato pelo site — ${form.assunto}`,
          from_name: "Site Montanhal Estética",
          ...form,
        }),
      });
      setSent(true);
    } catch {
      window.open(`https://wa.me/${site.whatsappNumber}?text=${waMessage()}`, "_blank", "noopener");
      setSent(true);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/20";

  return (
    <section id="contato" className="bg-gradient-to-b from-background to-secondary/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-script text-3xl text-primary">Vamos agendar?</p>
          <h2 className="mt-1 font-display text-4xl font-semibold text-foreground sm:text-5xl">
            Vamos cuidar de você
          </h2>
          <p className="mt-4 text-muted-foreground">
            Escolha o canal que preferir — respondemos rápido e com todo o carinho.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {trust.map((t) => (
              <span key={t} className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground/70 shadow-sm">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-[2rem] bg-card shadow-2xl shadow-primary/10 ring-1 ring-border">
          <div className="grid lg:grid-cols-5">
            {/* Painel */}
            <aside className="relative overflow-hidden bg-foreground p-8 text-background sm:p-10 lg:col-span-2">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/25 blur-2xl" />
              <span className="inline-flex rounded-lg bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                Montanhal Estética
              </span>
              <h3 className="mt-5 font-display text-3xl font-semibold leading-snug">
                Agende a sua avaliação na Montanhal
              </h3>

              <ul className="mt-8 space-y-5">
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/10 text-primary"><Phone className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-background/40">WhatsApp</p>
                    <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary">{site.phoneDisplay}</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/10 text-primary"><MapPin className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-background/40">Endereço</p>
                    <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary">{site.address}</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/10 text-primary"><Clock className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-background/40">Horário</p>
                    <p className="font-medium">{site.hours}</p>
                  </div>
                </li>
              </ul>

              <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 py-3.5 font-semibold text-white transition-transform hover:-translate-y-0.5">
                <MessageCircle className="h-5 w-5" /> Chamar no WhatsApp
              </a>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="mt-4 block text-sm text-background/50 hover:text-primary">{site.instagramHandle}</a>
            </aside>

            {/* Formulário */}
            <div className="p-6 sm:p-10 lg:col-span-3">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25d366]/15 text-[#1ebe5a]">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">Recebemos o seu contato!</h3>
                  <p className="mt-2 max-w-sm text-muted-foreground">Em breve a gente te chama no WhatsApp pra agendar. Obrigada 💛</p>
                  <button type="button" onClick={() => setSent(false)} className="mt-6 text-sm font-semibold text-primary hover:underline">Enviar outra mensagem</button>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-2xl font-semibold text-foreground">Solicite a sua avaliação</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Leva menos de um minuto. Campos com * são obrigatórios.</p>
                  <form onSubmit={sendEmail} className="mt-6 space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nome completo *" error={errors.nome}>
                        <input className={inputCls} placeholder="Seu nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
                      </Field>
                      <Field label="Telefone / WhatsApp *" error={errors.telefone}>
                        <input className={inputCls} inputMode="numeric" placeholder="(11) 99999-9999" value={form.telefone} onChange={(e) => set("telefone", maskPhone(e.target.value))} />
                      </Field>
                    </div>
                    <Field label="E-mail (opcional)" error={errors.email}>
                      <input className={inputCls} type="email" placeholder="voce@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </Field>
                    <Field label="Assunto">
                      <select className={inputCls} value={form.assunto} onChange={(e) => set("assunto", e.target.value)}>
                        {assuntos.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </Field>
                    <Field label="Mensagem *" error={errors.mensagem}>
                      <textarea rows={4} maxLength={600} className={`${inputCls} resize-none`} placeholder="Conte o que você gostaria de fazer..." value={form.mensagem} onChange={(e) => set("mensagem", e.target.value)} />
                    </Field>

                    <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                      <button type="button" onClick={sendWhats} className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full bg-[#25d366] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#25d366]/25 transition-all hover:-translate-y-0.5">
                        <MessageCircle className="h-5 w-5" /> Agendar pelo WhatsApp
                      </button>
                      <button type="submit" className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:brightness-105">
                        Enviar mensagem
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="mx-auto mt-6 max-w-6xl overflow-hidden rounded-[2rem] border border-border">
          <iframe
            title="Localização da Montanhal Estética"
            src="https://www.google.com/maps?q=Cl%C3%ADnica+Montanhal+Est%C3%A9tica+Av+Sapopemba+9802+Jardim+Planalto+Sao+Paulo&output=embed"
            width="100%"
            height="360"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-foreground">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-[#e5484d]">{error}</p>}
    </div>
  );
}
