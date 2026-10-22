// Dados da Clínica Montanhal Estética. Edite aqui contatos, marca e navegação.
const waText = encodeURIComponent(
  "Olá! Vim pelo site da Montanhal Estética e gostaria de agendar uma avaliação 💛"
);

// ⚠️ Campos marcados com "confirmar" devem ser validados com a cliente.
export const site = {
  name: "Clínica Montanhal Estética",
  shortName: "Montanhal",
  tagline: "Estética Facial, Corporal & Injetáveis",
  ceo: "Dra. Gabriela Montanhal",
  ceoRole: "Biomédica, esteticista e nutricionista · CEO",
  since: "2015",
  experience: "+10 anos transformando autoestima",
  structure: "200m² · 6 salas de atendimento · SPA",

  whatsappNumber: "5511996688995", // confirmar
  whatsappUrl: `https://wa.me/5511996688995?text=${waText}`,
  phoneDisplay: "(11) 99668-8995", // confirmar
  instagram: "https://www.instagram.com/montanhal_estetica/",
  instagramHandle: "@montanhal_estetica",
  linkBio: "https://linkme.bio/montanhalestetica",

  address: "Av. Sapopemba, 9802 — Jardim Planalto, São Paulo/SP",
  cep: "03988-000",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica+Montanhal+Est%C3%A9tica+Av+Sapopemba+9802",
  rating: { value: "5,0", count: 200 }, // confirmar nota e nº de avaliações no Google
  hours: "Seg a Sáb (confirmar horários)",
} as const;

export const nav = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "SPA", href: "#spa" },
  { label: "Resultados", href: "#resultados" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
] as const;
