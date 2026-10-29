/**
 * Sacudida ("shake") para señalar un error, con Reanimated.
 *
 * La animación corre en el hilo de UI, así que no se traba aunque la
 * JavaScript esté ocupada (por ejemplo, esperando a Firebase).
 *
 * Uso en dos pasos:
 *   1. const { estilo, sacudir } = useSacudida();
 *   2. Envolver el elemento: <Animated.View style={estilo}> ... </Animated.View>
 *   3. Llamar a sacudir() cuando ocurra el error (al fallar el login, etc.).
 */
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * Recorrido horizontal en píxeles: de -12 a +12, con vaivenes cada vez
 * más cortos hasta volver a 0 (como agitando algo con la mano).
 */
const RECORRIDO_PASOS = [-12, 12, -9, 9, -5, 5, 0];
const DURACION_PASO = 60;

export function useSacudida() {
  const desplazamiento = useSharedValue(0);
  // Respeta la opción "reducir movimiento" del sistema (accesibilidad).
  const reducirMovimiento = useReducedMotion();

  // Estilo para el Animated.View que se quiere sacudir.
  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateX: desplazamiento.value }],
  }));

  function sacudir() {
    // Sin movimiento la persona sigue recibiendo el error en rojo
    // (borde del campo, mensaje), solo no vibra visualmente.
    if (reducirMovimiento) return;
    // withSequence encadena los pasos; si se llama otra vez mientras
    // vibra, Reanimated cancela lo anterior y empieza de nuevo.
    // eslint-disable-next-line react-hooks/immutability -- desplazamiento.value es el API estándar de Reanimated (SharedValue); la regla no lo reconoce.
    desplazamiento.value = withSequence(
      ...RECORRIDO_PASOS.map((x) => withTiming(x, { duration: DURACION_PASO })),
    );
  }

  return { estilo, sacudir };
}
