import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/section";
import { reais, servicoPorSlug } from "@/lib/agenda";
import { ARTISTA, LINHA, SERVICO_AULA_AVULSA, SITE } from "@/lib/constants";
import { OBRAS } from "@/lib/obras";

/**
 * A ABERTURA.
 *
 * ── O que estava errado ───────────────────────────────────────────────────
 * A versão anterior abria com "BELA CERÂMICA" em versalete vermelho e, logo
 * abaixo, uma foto larga de uma mesa de aula. Estava correta: dizia o nome,
 * o preço e tinha dois botões. E podia ser de qualquer ateliê do bairro —
 * literalmente, porque nada ali era dela. O nome de um negócio não é uma
 * ideia, e foto de mesa coletiva é o estoque visual de toda escola de barro
 * do país.
 *
 * ── O que ela é ───────────────────────────────────────────────────────────
 * Uma artista com exposição individual apoiada pela Funarte, residência na
 * Bahia e uma série em curso. O portfólio dela estava num PDF na pasta de
 * downloads e nada disso aparecia no site. A abertura agora é a OBRA — uma
 * peça das Flores de Luto, o que ela faz hoje — e a frase que descreve ao
 * mesmo tempo o trabalho e a aula.
 *
 * ── A composição ──────────────────────────────────────────────────────────
 * É a do cartaz que ele mandou: creme, um retângulo de cor chapado, e a
 * imagem pousada por cima FUGINDO de um canto. O que faz a colagem funcionar
 * é o desalinho — bloco e foto encaixados viram moldura, e moldura é o que a
 * referência justamente não tem.
 *
 * O preço continua na primeira dobra, porque o problema que este site existe
 * para resolver é o aluguel do ateliê. Poesia em cima, número embaixo.
 */
export async function HeroHome() {
  const servico = await servicoPorSlug(SERVICO_AULA_AVULSA);
  const preco = servico ? reais(servico.precoCentavos) : null;

  /* A peça que abre é a mais recente — a capa da série em curso. Buscada
     pelo id e não por índice: reordenar o acervo não pode trocar o hero. */
  const capa = OBRAS.find((o) => o.id === "flores-de-luto-2026")!;

  return (
    <section className="bg-papel pt-[6.5rem] pb-14 sm:pt-[8rem] sm:pb-20">
      <Container className="grid items-end gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        <div data-enter className="flex flex-col items-start gap-6">
          <p className="rotulo">
            {SITE.nome} · desde {ARTISTA.projetoDesde}
          </p>

          <h1 className="cartaz font-display text-preto">
            O barro
            <br />
            guarda
            <br />
            <em className="italic text-vermelho">o gesto</em>
          </h1>

          <p className="max-w-md text-[1.05rem] leading-relaxed text-grafite">
            {LINHA.apoio}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/aulas#agenda"
              className="inline-flex h-[3.1rem] items-center justify-center bg-vermelho px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-branco transition-[background-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:bg-vermelho-escuro active:translate-y-px"
            >
              Marcar uma aula{preco ? ` · ${preco}` : ""}
            </Link>
            <Link
              href="/obras"
              className="inline-flex h-[3.1rem] items-center justify-center border border-preto/25 px-7 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-preto transition-[background-color,color,border-color,translate] duration-[var(--t-toque)] ease-[var(--ease-firme)] hover:border-preto active:translate-y-px"
            >
              Ver a obra
            </Link>
          </div>
        </div>

        {/* A colagem. O bloco é o papel de baixo; a foto é o recorte por cima.
            `lg:mb-2` só acerta a linha de base com a coluna de texto. */}
        <figure className="flex flex-col lg:mb-2">
          {/* `--bloco` já é `barro` por padrão na classe; a foto só precisa
              fugir. O bloco mantém a altura da imagem porque `translate` não
              mexe no fluxo — o vermelho sobra como uma faixa embaixo e à
              esquerda, que é exatamente o recorte de papel do cartaz. */}
          <div className="sobreimpressao w-full">
            <div className="fuga relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={capa.foto}
                alt={capa.alt}
                fill
                priority
                placeholder="blur"
                quality={92}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="hero-img object-cover object-center"
              />
            </div>
          </div>

          <figcaption className="ficha-parede mt-4 text-preto/55">
            <em className="text-preto">{capa.titulo}</em>, {capa.ano} · Série
            Flores de Luto
            <br />
            {capa.tecnica} · {capa.dimensoes}
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
