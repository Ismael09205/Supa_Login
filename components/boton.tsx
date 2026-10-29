/**
 * Botón con tres variantes:
 *  - primario:   amarillo de seguridad. Una sola vez por pantalla.
 *  - secundario: contorno azul, para acciones alternativas.
 *  - enlace:     solo texto, para navegar ("¿Olvidaste tu contraseña?").
 *
 * El primario tiene una "base" oscura debajo y al presionarlo baja 4 px,
 * como una tecla física. La respuesta visual confirma que el toque se registró.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
 
import { colores, espacio, fuentes, radio } from '../constants/tema';
 
type Props = {
  texto: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'enlace';
  /** Muestra un indicador y bloquea el botón mientras se espera a Firebase. */
  cargando?: boolean;
  deshabilitado?: boolean;
};
 
const PROFUNDIDAD = 4;
 
export function Boton({
  texto,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
}: Props) {
  const inactivo = cargando || deshabilitado;
 
  if (variante === 'enlace') {
    return (
      <Pressable onPress={onPress} disabled={inactivo} hitSlop={8} accessibilityRole="link">
        {({ pressed }) => (
          <Text style={[styles.enlace, pressed && { opacity: 0.55 }]}>{texto}</Text>
        )}
      </Pressable>
    );
  }
 
  const esPrimario = variante === 'primario';
 
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={styles.envoltura}>
      {({ pressed }) => (
        <>
          {/* Base que da la sensación de relieve (solo en el primario). */}
          {esPrimario && <View style={styles.base} />}
          <View
            style={[
              styles.cara,
              esPrimario ? styles.caraPrimaria : styles.caraSecundaria,
              // Al presionar, la cara baja hasta tocar la base.
              esPrimario && { transform: [{ translateY: pressed ? PROFUNDIDAD : 0 }] },
              !esPrimario && pressed && { backgroundColor: colores.tinta + '12' },
              inactivo && { opacity: 0.7 },
            ]}>
            {cargando ? (
              <ActivityIndicator color={esPrimario ? colores.tintaProfunda : colores.tinta} />
            ) : (
              <Text style={[styles.texto, !esPrimario && { color: colores.tinta }]}>{texto}</Text>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}
 
const styles = StyleSheet.create({
  envoltura: {
    marginTop: espacio.s,
    paddingBottom: PROFUNDIDAD,
  },
  base: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: PROFUNDIDAD,
    bottom: 0,
    borderRadius: radio.control,
    backgroundColor: colores.tintaProfunda,
  },
  cara: {
    minHeight: 56,
    borderRadius: radio.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.l,
  },
  caraPrimaria: {
    backgroundColor: colores.senal,
  },
  caraSecundaria: {
    borderWidth: 1.5,
    borderColor: colores.tinta,
    backgroundColor: 'transparent',
  },
  texto: {
    color: colores.tintaProfunda,
    fontFamily: fuentes.textoFuerte,
    fontSize: 16,
  },
  enlace: {
    color: colores.tinta,
    fontFamily: fuentes.textoFuerte,
    fontSize: 15,
    textDecorationLine: 'underline',
    textDecorationColor: colores.senal,
  },
});
