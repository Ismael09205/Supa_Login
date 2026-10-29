/**
 * Fondo de curvas de nivel (como un plano topográfico del Pichincha).
 *
 * No es una imagen: las curvas se calculan con matemáticas y se dibujan con
 * react-native-svg. Así pesan casi nada y se ven nítidas en cualquier pantalla.
 *
 * Cómo se construye cada curva:
 *   1. Se toman 64 ángulos alrededor de una "cumbre" (el centro).
 *   2. Para cada ángulo se calcula un radio que ondula con senos: así la
 *      curva no es un círculo perfecto sino un contorno irregular de montaña.
 *   3. Los puntos se unen con curvas Bézier suaves (técnica Catmull-Rom).
 *   4. Se repite con radios cada vez más grandes: cada anillo es una "cota".
 */
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
 
import { colores } from '../constants/tema';
 
// Tamaño del "lienzo" interno. El SVG se escala al tamaño real del contenedor.
const ANCHO = 400;
const ALTO = 560;
 
type Punto = { x: number; y: number };
 
/** Convierte una lista cerrada de puntos en un trazo SVG suave. */
function trazoSuave(puntos: Punto[]): string {
  const n = puntos.length;
  let d = `M ${puntos[0].x.toFixed(1)} ${puntos[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    // Para cada tramo usamos el punto anterior y el siguiente como guía.
    const p0 = puntos[(i - 1 + n) % n];
    const p1 = puntos[i];
    const p2 = puntos[(i + 1) % n];
    const p3 = puntos[(i + 2) % n];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return `${d} Z`;
}
 
/** Genera los anillos alrededor de una cumbre ubicada en (cx, cy). */
function generarCurvas(cx: number, cy: number, anillos: number): string[] {
  const curvas: string[] = [];
  for (let k = 1; k <= anillos; k++) {
    const radioBase = 14 + k * 21;
    const puntos: Punto[] = [];
    for (let i = 0; i < 64; i++) {
      const angulo = (i / 64) * Math.PI * 2;
      // La ondulación crece con el anillo: las cotas bajas son más irregulares.
      const ondulacion =
        Math.sin(angulo * 3 + k * 0.55) * (4 + k * 1.6) +
        Math.sin(angulo * 5 - k * 0.8) * (2 + k * 0.7) +
        Math.cos(angulo * 2 + k * 0.3) * k * 1.3;
      const r = radioBase + ondulacion;
      // Estiramos en X para que la montaña sea alargada, como una cordillera.
      puntos.push({ x: cx + Math.cos(angulo) * r * 1.35, y: cy + Math.sin(angulo) * r });
    }
    curvas.push(trazoSuave(puntos));
  }
  return curvas;
}
 
export function CurvasDeNivel() {
  // useMemo: los trazos se calculan una sola vez y no en cada render.
  const curvas = useMemo(() => generarCurvas(300, 70, 20), []);
  const cumbre = { x: 300, y: 70 };
 
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      // "slice" recorta como object-fit: cover, sin deformar las curvas.
      // "YMin" ancla arriba: la cumbre queda siempre a la vista.
      preserveAspectRatio="xMidYMin slice"
      pointerEvents="none">
      {curvas.map((d, i) => (
        <Path
          key={i}
          d={d}
          fill="none"
          stroke={colores.curva}
          // Cada quinta curva es una "curva maestra", más gruesa, como en los mapas reales.
          strokeWidth={i % 5 === 4 ? 1.8 : 0.9}
        />
      ))}
      {/* Punto de cota en la cumbre: el único detalle amarillo del encabezado. */}
      <Circle cx={cumbre.x} cy={cumbre.y} r={3.5} fill={colores.senal} />
      <Circle cx={cumbre.x} cy={cumbre.y} r={9} fill="none" stroke={colores.senal} strokeWidth={1} />
    </Svg>
  );
}
