"use client";

import { useEffect, useRef } from "react";
import { FRAGMENTO } from "./malha.frag";

/**
 * Campo animado em WebGL, atrás de uma seção.
 *
 * ── O que ele NÃO faz ─────────────────────────────────────────────────────
 * Não carrega biblioteca nenhuma. O que a peça precisa é um triângulo de tela
 * cheia com um shader — isso é WebGL cru, e puxar three.js para desenhar um
 * triângulo custaria mais que a página inteira. Mesmo raciocínio já aplicado
 * no `vitral.tsx` do projeto da Landgraf.
 *
 * ── As quatro travas, e a razão de cada uma ───────────────────────────────
 * Este site é aberto no celular, no 4G, por quem veio do Instagram. Um laço
 * de GPU rodando sem parar é caro em bateria e derruba a rolagem.
 *
 *   1. ABA ESCONDIDA para. `visibilitychange` cancela o laço.
 *   2. FORA DA TELA para. Um IntersectionObserver só deixa rodar enquanto a
 *      seção está visível — que é a maior economia das quatro, porque esta
 *      seção fica no pé da página.
 *   3. MOVIMENTO REDUZIDO desenha UM quadro e para. Quem pediu menos
 *      movimento continua vendo a arte, parada.
 *   4. SEM WEBGL não quebra: o canvas fica transparente e o fundo da seção,
 *      que já é uma cor sólida, aparece por baixo.
 *
 * `devicePixelRatio` é limitado a 2: num telefone com 3x, renderizar em 3x é
 * pagar 2,25 vezes mais pixels por uma diferença que ninguém enxerga num
 * campo desfocado.
 */

/** Um triângulo que cobre a tela — mais barato que dois triângulos de um quad. */
const VERTICE = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/**
 * A paleta do ateliê no lugar do cinza do gerador.
 *
 * Do mais escuro ao mais claro, com o vermelho como ponto mais alto: é ele
 * que aparece só de vez em quando, quando uma bolha passa. Vermelho em área
 * grande aqui viraria alerta.
 */
const CORES = [
  [0.078, 0.075, 0.063], // preto  #141310
  [0.235, 0.318, 0.259], // verde-escuro #3C5142
  [0.369, 0.478, 0.388], // verde  #5E7A63
  [0.659, 0.184, 0.11], // vermelho #A82F1C
];

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string) {
  const s = gl.createShader(tipo);
  if (!s) return null;
  gl.shaderSource(s, fonte);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    /* Contexto perdido reprova a compilação sem registro nenhum — o log vem
       `null`. Não é erro de shader e não deve gritar no console: é o caminho
       normal de quem já soltou o contexto. Erro de verdade tem texto. */
    const log = gl.getShaderInfoLog(s);
    if (log) console.error("[malha] shader não compilou:", log);
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function Malha({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return; // trava 4

    /* Trava 5: contexto JÁ perdido.
       A limpeza deste efeito solta o contexto de propósito — o navegador
       guarda poucos, e navegar para outra página e voltar vazaria um por
       visita. Mas `getContext` devolve SEMPRE o mesmo objeto para um canvas,
       inclusive depois de perdido. Se o efeito rodar de novo sobre o mesmo
       elemento (o StrictMode monta, limpa e monta outra vez em
       desenvolvimento), o que chega aqui é o contexto morto, e todo comando
       seguinte falha em silêncio — canvas vazio sobre a seção.

       Saindo agora, o que fica é a seção preta que já estava desenhada, que é
       o mesmo destino de quem não tem WebGL. Nunca um buraco. */
    if (gl.isContextLost()) return;

    const vs = compilar(gl, gl.VERTEX_SHADER, VERTICE);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTO);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[malha] programa não ligou:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (nome: string) => gl.getUniformLocation(prog, nome);
    const uCores = u("u_colors");
    const uScene = u("u_scene");
    const uShape = u("u_shape");
    const uSurface = u("u_surface");
    const uFinish = u("u_finish");
    const uTransform = u("u_transform");
    const uSpace = u("u_space");
    const uCursor = u("u_cursor");

    // Oito vec3, das quais as quatro primeiras são usadas.
    const cores = new Float32Array(24);
    CORES.forEach((c, i) => cores.set(c, i * 3));
    gl.uniform3fv(uCores, cores);

    gl.uniform4f(uShape, 1.16, 0.34, 0.5, 0.0);
    gl.uniform4f(uSurface, 2.4, 1.16, 0.0, 1.0);
    gl.uniform4f(uFinish, 0.0, 0.0, 0.0, 0.09);
    gl.uniform4f(uTransform, 1453.0, 0.0, 0.0, 0.0);
    gl.uniform4f(uSpace, 0.0, 0.0, 0.0, 0.0);
    gl.uniform4f(uCursor, 0.0, 2.0, 0.65, 0.46); // cursor desligado

    let largura = 0;
    let altura = 0;
    function medir() {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (w === largura && h === altura) return;
      largura = w;
      altura = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    function desenhar(segundos: number) {
      if (!gl) return;
      medir();
      gl.uniform4f(uScene, largura, altura, segundos * 0.73, CORES.length);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    let quadro = 0;
    let visivel = false;
    const inicio = performance.now();

    function laco(agora: number) {
      desenhar((agora - inicio) / 1000);
      quadro = requestAnimationFrame(laco);
    }

    function avaliar() {
      const deveRodar = visivel && !document.hidden && !reduzido.matches;

      if (deveRodar) {
        if (!quadro) quadro = requestAnimationFrame(laco);
        return;
      }

      if (quadro) {
        cancelAnimationFrame(quadro);
        quadro = 0;
      }

      // Parado, mas com UM quadro desenhado — e isto vale também quando o
      // laço nunca chegou a começar. A primeira versão só desenhava ao
      // CANCELAR o laço, então quem tem movimento reduzido ligado (o laço
      // nunca começa) ficava com o canvas em branco: exatamente a pessoa para
      // quem o quadro estático existe.
      if (visivel) desenhar(0);
    }

    const observador = new IntersectionObserver(
      ([e]) => {
        visivel = e?.isIntersecting ?? false;
        avaliar();
      },
      { rootMargin: "120px" }
    );
    observador.observe(canvas);

    document.addEventListener("visibilitychange", avaliar);
    reduzido.addEventListener("change", avaliar);
    const aoRedimensionar = () => {
      if (!quadro) desenhar(0);
    };
    window.addEventListener("resize", aoRedimensionar);

    return () => {
      if (quadro) cancelAnimationFrame(quadro);
      observador.disconnect();
      document.removeEventListener("visibilitychange", avaliar);
      reduzido.removeEventListener("change", avaliar);
      window.removeEventListener("resize", aoRedimensionar);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      // Solta o contexto: um navegador guarda poucos, e uma navegação de
      // cliente para cá e de volta vazaria um por visita.
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
    />
  );
}
