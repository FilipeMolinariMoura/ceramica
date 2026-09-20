import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/auth";
import { FormularioEntrar } from "@/app/painel/entrar/formulario";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ de?: string }>;
}) {
  // Já logada não precisa ver a tela de entrada de novo.
  if (await usuarioDaSessao()) redirect("/painel");

  const { de } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-papel px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="titulo-secao versalete font-display text-vermelho">
          Bela Cerâmica
        </h1>
        <p className="versalete-larga mt-2 text-[0.6rem] text-preto/45">
          Painel da Isabela
        </p>
        <FormularioEntrar de={de} />
      </div>
    </div>
  );
}
