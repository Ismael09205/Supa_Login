/**
 * Mensaje de resultado (error o éxito) que aparece sobre el formulario.
 * La barra lateral de color permite distinguir el tipo sin leer el texto.
 */
import { StyleSheet, Text, View } from 'react-native';
 
import { colores, espacio, fuentes } from '../constants/tema';
 
type Props = {
  tipo: 'error' | 'exito';
  mensaje: string;
};
 
export function Aviso({ tipo, mensaje }: Props) {
  const esError = tipo === 'error';
  return (
    <View
      // "alert" hace que el lector de pantalla anuncie el mensaje de inmediato.
      accessibilityRole="alert"
      style={[
        styles.caja,
        {
          backgroundColor: esError ? colores.errorFondo : colores.exitoFondo,
          borderLeftColor: esError ? colores.error : colores.exito,
        },
      ]}>
      <Text style={[styles.texto, { color: esError ? colores.error : colores.exito }]}>
        {mensaje}
      </Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
  caja: {
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingVertical: espacio.m - 4,
    paddingHorizontal: espacio.m,
  },
  texto: {
    fontFamily: fuentes.textoMedio,
    fontSize: 14,
    lineHeight: 20,
  },
});
