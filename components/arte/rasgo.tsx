/**
 * A borda rasgada entre duas seções.
 *
 * O cartaz que a Isabela mandou é COLAGEM: papéis cortados e sobrepostos, com
 * a borda irregular à mostra. O site fazia a transição entre seções com uma
 * mudança seca de cor de fundo, que é correta e é de aplicativo.
 *
 * Como usar: primeiro filho da seção DE BAIXO, com `cor` igual ao fundo da
 * seção DE CIMA. O rasgo é o papel de cima terminando.
 *
 *   <section className="creme relative pt-14">
 *     <Rasgo cor="var(--color-preto)" />
 *     ...
 *
 * O traçado é fixo e foi gerado uma vez com ruído de duas frequências — uma
 * ondulação lenta com jitter rápido por cima, que é o que a fibra do papel
 * faz. Gerar no cliente daria uma borda diferente a cada visita, e isso é
 * justamente o que denuncia efeito: papel rasgado não se reconstitui.
 *
 * `preserveAspectRatio="none"` estica os 1200 do viewBox até a largura da
 * tela. O jitter é vertical, então esticar na horizontal só espaça os dentes
 * — não os deforma.
 */
export function Rasgo({
  cor,
  className = "",
}: {
  /** Cor do fundo da seção de cima. Aceita token ou `var()`. */
  cor: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-[14px] w-full sm:h-[20px] ${className}`}
    >
      {/* O traçado nasce preenchendo a metade de baixo; o `scale(1,-1)` o vira
          para que o cheio fique em cima, que é onde está o papel da seção
          anterior. */}
      <g transform="translate(0,24) scale(1,-1)">
        <path
          fill={cor}
          d="M0,24 L0,14.9 L8,14 L16,17.7 L24,14 L32,17.3 L40,16.3 L48,14.3 L56,17.5 L64,14.3 L72,17 L80,14.5 L88,14.6 L96,16.8 L104,19.4 L112,14.5 L120,15 L128,17.6 L136,19.6 L144,16.9 L152,15.6 L160,19.3 L168,12.9 L176,18.2 L184,14.3 L192,13.2 L200,12.9 L208,14.1 L216,17.5 L224,13.2 L232,16 L240,16.4 L248,14.6 L256,15.9 L264,12.8 L272,12.9 L280,14.1 L288,17.5 L296,16 L304,15.5 L312,17.6 L320,17 L328,16.2 L336,19.9 L344,19.5 L352,16.7 L360,19.2 L368,19.1 L376,21.7 L384,20.9 L392,18.1 L400,22.5 L408,17.3 L416,19.4 L424,21.8 L432,17.7 L440,20 L448,16.9 L456,21 L464,21.5 L472,20 L480,21.9 L488,17.8 L496,20 L504,19 L512,18.5 L520,17.2 L528,19.4 L536,19.6 L544,15.9 L552,16.6 L560,12 L568,15.8 L576,14.8 L584,16.6 L592,14.9 L600,10.7 L608,10.8 L616,12.2 L624,7.3 L632,9.8 L640,7.4 L648,6.6 L656,5.8 L664,10.3 L672,5.6 L680,6.2 L688,6.9 L696,10 L704,4.5 L712,6.9 L720,7.5 L728,9.8 L736,9.3 L744,9.7 L752,5.8 L760,6.9 L768,6.6 L776,10.4 L784,11.1 L792,5.8 L800,6.2 L808,6.8 L816,7 L824,9 L832,9.9 L840,7.9 L848,6.4 L856,9.4 L864,9.2 L872,10.7 L880,13.5 L888,11.8 L896,10.7 L904,11.5 L912,11.9 L920,7.7 L928,13.4 L936,12.6 L944,13.1 L952,12.5 L960,9.6 L968,9.5 L976,7.3 L984,10.8 L992,6.7 L1000,6.5 L1008,7.3 L1016,6.8 L1024,7.8 L1032,5.6 L1040,5.1 L1048,6 L1056,5.5 L1064,7.2 L1072,4.8 L1080,10.5 L1088,8.7 L1096,5.5 L1104,6.3 L1112,7 L1120,7.3 L1128,5.8 L1136,10.9 L1144,12.2 L1152,8.9 L1160,9.3 L1168,7 L1176,7.5 L1184,9.5 L1192,9.5 L1200,13.8 L1200,24 Z"
        />
      </g>
    </svg>
  );
}
