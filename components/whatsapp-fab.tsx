"use client";

import * as React from "react";
import { WHATSAPP_DUVIDA } from "@/lib/constants";

function WhatsappGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
      <path d="M17.47 14.38c-.29-.15-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.14-.19.29-.74.93-.91 1.12-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.89-2.15-.24-.57-.48-.49-.65-.5-.17-.01-.36-.01-.55-.01-.19 0-.51.07-.77.36-.26.29-1.01.99-1.01 2.41 0 1.42 1.04 2.79 1.18 2.98.15.19 2.04 3.12 4.95 4.38.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.7-.7 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34zM12.02 21.5h-.01a9.44 9.44 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.45 9.45 0 0 1-1.45-5.03c0-5.23 4.26-9.48 9.5-9.48 2.54 0 4.92.99 6.71 2.78a9.42 9.42 0 0 1 2.78 6.71c0 5.23-4.26 9.48-9.5 9.48zM20.52 3.49A11.36 11.36 0 0 0 12.02.5C5.75.5.66 5.59.66 11.86c0 2.01.53 3.97 1.53 5.7L.56 23.5l6.09-1.6a11.34 11.34 0 0 0 5.37 1.37h.01c6.27 0 11.36-5.09 11.36-11.36 0-3.04-1.18-5.9-3.34-8.05z" />
    </svg>
  );
}

export function WhatsappFab() {
  const [visivel, setVisivel] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={WHATSAPP_DUVIDA}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tirar uma dúvida com a Isabela pelo WhatsApp"
      data-visivel={visivel}
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-0 overflow-hidden rounded-full bg-barro py-3 pl-3 pr-3 text-lona-100 shadow-lift transition-all duration-300 hover:bg-cobalto data-[visivel=false]:pointer-events-none data-[visivel=false]:translate-y-4 data-[visivel=false]:opacity-0 sm:hover:pr-5"
    >
      <WhatsappGlyph />
      <span className="max-w-0 whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-[10rem] group-hover:opacity-100 sm:group-hover:ml-2">
        Tenho uma dúvida
      </span>
    </a>
  );
}
