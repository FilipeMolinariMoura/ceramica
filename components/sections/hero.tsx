import Image from "next/image";
import { Eyebrow } from "@/components/eyebrow";
import { InscricaoCta } from "@/components/inscricao-cta";
import { SeisLugares } from "@/components/seis-lugares";
import { fotos } from "@/lib/fotos";
import { CURSO } from "@/lib/constants";

const DADOS = [
  { label: "Início", valor: CURSO.inicio },
  { label: "Encontros", valor: "Terças, 9h30–11h30" },
  { label: "Turma", valor: "6 vagas" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="lg:grid lg:min-h-[94svh] lg:grid-cols-2 lg:items-stretch">
        {/* Foto 1 — tese da página. No mobile, corte vertical no centro da mesa. */}
        <div className="relative order-1 h-[56svh] w-full overflow-hidden sm:h-[64svh] lg:order-2 lg:h-auto lg:min-h-[94svh]">
          <Image
            src={fotos.hero.src}
            alt={fotos.hero.alt}
            fill
            priority
            quality={90}
            placeholder="blur"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="hero-img object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-barro/25 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-lona/20" />
        </div>

        {/* Texto */}
        <div className="order-2 flex items-center lg:order-1 lg:justify-end">
          <div
            data-enter
            className="flex w-full max-w-xl flex-col items-start gap-6 px-6 py-11 sm:px-8 lg:max-w-[34rem] lg:py-16 lg:pr-14"
          >
            <Eyebrow>Primeira turma · Terças de manhã · Pinheiros</Eyebrow>

            <h1 className="font-display text-[2.55rem] font-light leading-[1.05] tracking-[-0.02em] text-barro sm:text-5xl lg:text-[4rem]">
              Um espaço para{" "}
              <em className="font-normal italic text-cobalto">
                criar, experimentar
              </em>{" "}
              e desenvolver sua relação com o barro.
            </h1>

            <p className="max-w-md text-[1.05rem] leading-relaxed text-barro-ink/85">
              Depois de quatro anos ensinando cerâmica, abro minha primeira turma
              em um espaço dedicado a processos criativos. Seis pessoas,
              acompanhamento individual, começando em 4 de agosto.
            </p>

            <InscricaoCta origem="hero" />

            <SeisLugares animate caption="seis lugares · terças de manhã" />

            <dl className="mt-1 flex flex-wrap items-stretch gap-x-6 gap-y-3 border-t border-lona-300 pt-5">
              {DADOS.map((d, i) => (
                <div
                  key={d.label}
                  className={i > 0 ? "border-l border-lona-300 pl-6" : ""}
                >
                  <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-barro/45">
                    {d.label}
                  </dt>
                  <dd className="mt-0.5 font-display text-lg text-barro">
                    {d.valor}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
