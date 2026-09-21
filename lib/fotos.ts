import hero from "@/assets/fotos/hero.jpg";
import sobre from "@/assets/fotos/sobre.jpg";
import incluso from "@/assets/fotos/incluso.jpg";
import isabela from "@/assets/fotos/isabela.jpg";
import quebra from "@/assets/fotos/quebra.jpg";
import prova from "@/assets/fotos/prova.jpg";
import atelie from "@/assets/fotos/atelie.jpg";
import pecaPronta from "@/assets/fotos/peca-pronta.jpg";
import cortando from "@/assets/fotos/cortando.jpg";
import isabelaPeca from "@/assets/fotos/isabela-peca.jpg";
import isabelaPerfil from "@/assets/fotos/isabela-perfil.jpg";
import exposicao from "@/assets/fotos/exposicao.jpg";

/**
 * As fotos do site.
 *
 * ── Trocadas em 21/09/2026 ────────────────────────────────────────────────
 * O Filipe mandou uma pasta com treze fotos, seis delas de fotógrafo. As
 * antigas eram de celular, com luz dura e enquadramento de registro — serviam
 * para provar que a aula existe, não para fazer alguém querer ir. As novas têm
 * o ateliê de verdade, mão no barro em close e a Isabela conduzindo.
 *
 * As CHAVES não mudaram de propósito: `hero`, `sobre`, `incluso`, `isabela`,
 * `quebra` e `prova` já estavam espalhadas por dezenas de lugares, e renomeá-las
 * só para ficar bonito aqui obrigaria a revisar tudo sem ganho nenhum. O que
 * mudou foi a foto atrás de cada uma — e o `alt`, que descrevia a foto antiga
 * e teria ficado mentindo para quem usa leitor de tela.
 *
 * ── EXIF ──────────────────────────────────────────────────────────────────
 * Foram regravadas sem EXIF. Metade veio de celular, e foto de celular carrega
 * GPS: o endereço do ateliê é a casa dela, e ele não precisa viajar dentro de
 * um arquivo do repositório. O upload do painel já faz isso pelo `sharp`;
 * aqui foi feito à mão, na conversão.
 */
export const fotos = {
  hero: {
    src: hero,
    alt: "Vista de cima de uma mesa coletiva: várias mãos trabalham placas de barro entre estiletes, espátulas e tigelas, sobre uma bancada clara.",
  },
  sobre: {
    src: sobre,
    alt: "Close de dois pares de mãos erguendo uma placa de barro para fechar a lateral de uma peça, com um braço tatuado à direita.",
  },
  incluso: {
    src: incluso,
    alt: "Uma mão segura uma forma curva de barro escuro sobre a lona, ao lado de um leque de ferramentas de madeira e uma tigela de terracota.",
  },
  isabela: {
    src: isabela,
    alt: "Isabela Molinari de lenço verde na cabeça, debruçada sobre a bancada, trabalhando uma placa de barro entre potes e pincéis.",
  },
  quebra: {
    src: quebra,
    alt: "Mãos gravando o desenho de um rosto numa placa de barro apoiada numa tábua de madeira, com uma ferramenta fina.",
  },
  prova: {
    src: prova,
    alt: "Duas pessoas trabalhando o barro numa bancada de madeira, diante de uma janela de esquadria turquesa.",
  },

  /* ── Acrescentadas com a pasta nova ──────────────────────────────────── */
  atelie: {
    src: atelie,
    alt: "Isabela Molinari em pé no ateliê, ao fundo uma estante com máscaras de cerâmica e livros, e na mesa peças cilíndricas em construção.",
  },
  pecaPronta: {
    src: pecaPronta,
    alt: "Uma mão segura uma tigela pronta, de esmalte amarelo-esverdeado com pontos escuros, diante de uma prateleira com outras peças.",
  },
  cortando: {
    src: cortando,
    alt: "Isabela cortando uma placa de barro com fio de aço, sobre a bancada com uma esponja amarela e um pote de barbotina.",
  },
  isabelaPeca: {
    src: isabelaPeca,
    alt: "Isabela Molinari contra uma parede clara, de blazer vinho, levando uma pequena peça escura de cerâmica ao rosto.",
  },
  isabelaPerfil: {
    src: isabelaPerfil,
    alt: "Isabela de perfil, de olhos fechados, segurando junto à boca uma forma alongada e curva de barro escuro.",
  },
  exposicao: {
    src: exposicao,
    alt: "Isabela num espaço expositivo iluminado de roxo e laranja, entre esculturas de cerâmica e um painel recortado.",
  },
} as const;
