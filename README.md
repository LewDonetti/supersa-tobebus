# Clínica Montanhal Estética — Site

Site institucional da **Clínica Montanhal Estética** (estética facial, corporal e injetáveis + SPA — Sapopemba, São Paulo/SP).

> Status: em análise com o cliente. Deploy previsto na **Vercel**.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Framer Motion** / `motion` (animações)
- `lucide-react` (ícones)

## Rodando

Pré-requisitos: **Node.js 20+**.

```bash
npm install
npm run dev      # http://localhost:3000
```

> Se o npm bloquear scripts de instalação: `npm approve-scripts --allow-scripts-pending`

Outros comandos: `npm run build` · `npm run start` · `npm run lint`.

## Estrutura

```
src/
  app/                 layout.tsx (fontes + SEO), page.tsx (home), globals.css (identidade)
  components/
    ui/                componentes shadcn + stagger-testimonials
    sections/          hero, sobre, servicos, spa, resultados, depoimentos, contato
    site-header.tsx, site-footer.tsx, whatsapp-float.tsx
  data/                site.ts (contatos/marca), services.ts (serviços)
public/img/            logo + fotos (hero, serviços, espaço, SPA, antes/depois)
docs/                  proposta "Projeto do Site" (PDF + HTML-fonte)
```

## Conteúdo (onde editar)

- **Contatos / WhatsApp / endereço / marca:** `src/data/site.ts`
- **Serviços (facial, corporal, injetáveis, SPA):** `src/data/services.ts`
- **Depoimentos:** `src/components/ui/stagger-testimonials.tsx`
- **Cores e fontes:** `src/app/globals.css`

## Identidade

- **Dourado** (`--primary`) como cor principal · **grafite** nos textos · **creme** nos fundos.
- Tipografia: **Cormorant Garamond** (títulos), **Poppins** (corpo), **Parisienne** (caligrafia).
- Logo em `public/img/logo-montanhal.png` (PNG transparente).

## Pendências (confirmar com a cliente)

- **WhatsApp** `(11) 99668-8995`, **horário de funcionamento**, **nota/avaliações no Google** e **e-mail oficial** — ver `src/data/site.ts`.
- **Serviços:** confirmar/ajustar a lista final em `src/data/services.ts`.
- **Depoimentos:** substituir os placeholders pelos depoimentos **reais aprovados** (Google/Instagram).
- **Fotos:** hero, espaço, SPA e procedimentos (facial/corporal/injetáveis) já aplicados. Ainda **pendentes** (usar fotos reais): `equipe.webp` (Dra. Gabriela/equipe) e os **Antes & Depois** reais (`ba-facial.webp`, `ba-corporal.webp`).
- **Formulário:** criar chave gratuita no [web3forms.com](https://web3forms.com) com o e-mail da clínica e definir `NEXT_PUBLIC_WEB3FORMS_KEY` para receber leads por e-mail (o WhatsApp já funciona).

## Deploy (Vercel)

1. Importe o repositório na Vercel (detecta Next.js automaticamente).
2. O link gerado serve para apresentar ao cliente.
