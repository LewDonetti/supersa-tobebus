// Serviços da Montanhal Estética — Facial, Corporal e Injetáveis (+ SPA).
// Lista baseada no conteúdo público do Instagram/Google. Confirmar/ajustar com a cliente.
export type Service = { title: string; desc: string; img: string; alt: string };

export const facial: Service[] = [
  {
    title: "Limpeza de pele profunda",
    desc: "Higienização, extração e revitalização para uma pele limpa, macia e saudável.",
    img: "/img/facial-limpeza.webp",
    alt: "Limpeza de pele profunda na Montanhal Estética",
  },
  {
    title: "Peeling (o dos famosos)",
    desc: "Renovação celular que uniformiza o tom, suaviza manchas e devolve o viço à pele.",
    img: "/img/facial-peeling.webp",
    alt: "Peeling facial na Montanhal Estética",
  },
  {
    title: "Dermaplaning",
    desc: "Esfoliação que remove células mortas e pelos finos, deixando a pele lisa e iluminada.",
    img: "/img/facial-dermaplaning.webp",
    alt: "Dermaplaning facial na Montanhal Estética",
  },
  {
    title: "Microagulhamento & Lavieen",
    desc: "Estímulo de colágeno e tecnologia a laser para textura, firmeza e qualidade da pele.",
    img: "/img/facial-microagulhamento.webp",
    alt: "Microagulhamento e Lavieen na Montanhal Estética",
  },
];

export const corporal: Service[] = [
  {
    title: "Redução de medidas",
    desc: "Protocolos corporais que modelam o contorno e ajudam a conquistar a sua melhor versão.",
    img: "/img/corporal-medidas.webp",
    alt: "Redução de medidas corporal na Montanhal Estética",
  },
  {
    title: "Celulite & flacidez",
    desc: "Tratamentos que melhoram a textura da pele, firmeza e aparência da celulite.",
    img: "/img/corporal-celulite.webp",
    alt: "Tratamento de celulite e flacidez na Montanhal Estética",
  },
  {
    title: "HIPRO (ultrassom)",
    desc: "Tecnologia de ultrassom focada para firmeza e resultados reais no corpo.",
    img: "/img/corporal-massagem.webp",
    alt: "HIPRO ultrassom corporal na Montanhal Estética",
  },
];

export const injetaveis: Service[] = [
  {
    title: "Toxina botulínica",
    desc: "Suaviza linhas de expressão preservando a naturalidade — aquele detalhe que transforma.",
    img: "/img/injetaveis-botox.webp",
    alt: "Aplicação de toxina botulínica na Montanhal Estética",
  },
  {
    title: "Preenchimento",
    desc: "Harmonização e volume com técnica e segurança, realçando a sua beleza natural.",
    img: "/img/injetaveis-preenchimento.webp",
    alt: "Preenchimento facial na Montanhal Estética",
  },
];

// SPA Montanhal — experiência de bem-estar.
export const spa: { title: string; desc: string }[] = [
  { title: "Massagem relaxante", desc: "Dos pés à cabeça, para aliviar tensões e renovar as energias." },
  { title: "Pedras quentes & ventosas", desc: "Técnicas que relaxam a musculatura e ativam a circulação." },
  { title: "Revitalização facial", desc: "Um cuidado que devolve o viço e o frescor à sua pele." },
  { title: "Hidromassagem", desc: "Com ozônio e cromoterapia, para um relaxamento profundo." },
];
