"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--color-branco)",
          color: "var(--color-preto)",
          border: "1px solid var(--color-linha)",
          borderRadius: "0.9rem",
          fontFamily: "var(--font-hanken), system-ui, sans-serif",
        },
      }}
      {...props}
    />
  );
}
