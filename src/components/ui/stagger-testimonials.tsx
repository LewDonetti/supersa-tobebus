"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const SQRT_5000 = Math.sqrt(5000);

// Avaliações reais do Studio Caju (Google · 5,0 · 36 avaliações).
type Review = { tempId: number; quote: string; name: string; source: string };

const reviews: Review[] = [
  {
    tempId: 0,
    quote:
      "A Carol faz as unhas como ninguém: extremamente caprichosa, cuidadosa e atenciosa em cada detalhe. O resultado ficou impecável.",
    name: "Amanda Santos",
    source: "Google",
  },
  {
    tempId: 1,
    quote: "Unhas maravilhosas! A fibra de vidro é impecável — e o cabelo também!",
    name: "Lore Angelo",
    source: "Google",
  },
  {
    tempId: 2,
    quote:
      "Meu lugar preferido para autocuidado, beleza e carinho! As melhores unhas de gel, pedicure e tratamento para cabelo.",
    name: "Andreza Croitor",
    source: "Google · Local Guide",
  },
  {
    tempId: 3,
    quote: "Papo gostoso, ambiente acolhedor e aconchegante, cafezinho e música.",
    name: "",
    source: "Avaliação no Google",
  },
  {
    tempId: 4,
    quote: "Excelente profissional do ramo — unha masculina e feminina é top.",
    name: "",
    source: "Avaliação no Google",
  },
  {
    tempId: 5,
    quote: "Estou amando minhas unhas, faz tudo com dedicação.",
    name: "",
    source: "Avaliação no Google",
  },
];

const initials = (name: string) =>
  name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "";

interface TestimonialCardProps {
  position: number;
  review: Review;
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  review,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter
          ? "z-10 bg-primary text-primary-foreground border-primary"
          : "z-0 bg-card text-card-foreground border-border hover:border-primary/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath:
          "polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)",
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px var(--border)" : "0px 0px 0px 0px transparent",
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{ right: -2, top: 48, width: SQRT_5000, height: 2 }}
      />

      {/* Avatar (iniciais) + estrelas */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold",
            isCenter ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary"
          )}
        >
          {initials(review.name) || <Star className="h-5 w-5 fill-current" />}
        </div>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5 fill-current",
                isCenter ? "text-primary-foreground" : "text-primary"
              )}
            />
          ))}
        </div>
      </div>

      <h3
        className={cn(
          "font-display text-base font-medium leading-snug sm:text-lg",
          isCenter ? "text-primary-foreground" : "text-foreground"
        )}
      >
        &ldquo;{review.quote}&rdquo;
      </h3>
      <p
        className={cn(
          "absolute bottom-8 left-8 right-8 mt-2 text-sm italic",
          isCenter ? "text-primary-foreground/80" : "text-muted-foreground"
        )}
      >
        — {review.name || "Cliente"} · {review.source}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [list, setList] = useState(reviews);

  const handleMove = (steps: number) => {
    const newList = [...list];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 560 }}>
      {list.map((review, index) => {
        const position =
          list.length % 2
            ? index - (list.length + 1) / 2
            : index - list.length / 2;
        return (
          <TestimonialCard
            key={review.tempId}
            review={review}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Depoimento anterior"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Próximo depoimento"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
};
