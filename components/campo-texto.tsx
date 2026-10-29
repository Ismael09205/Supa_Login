/**
 * Campo de texto con etiqueta, estado de foco, mensaje de error y,
 * si es una contraseña, el botón para mostrarla u ocultarla.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
 
import { colores, espacio, fuentes, radio } from '../constants/tema';
 
type Props = TextInputProps & {
  etiqueta: string;
  error?: string | null;
  /** Si es true, el texto se oculta y aparece el botón Mostrar/Ocultar. */
  esClave?: boolean;
};
 
export function CampoTexto({ etiqueta, error, esClave = false, style, ...props }: Props) {
  const [enfocado, setEnfocado] = useState(false);
  const [claveVisible, setClaveVisible] = useState(false);
 
  // El color del borde comunica el estado: error > foco > reposo.
  const colorBorde = error ? colores.error : enfocado ? colores.tinta : colores.borde;
 
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
 
      <View style={[styles.caja, { borderColor: colorBorde }, enfocado && styles.cajaEnfocada]}>
        <TextInput
          {...props}
          style={[styles.entrada, style]}
          placeholderTextColor={colores.lapiz + '99'}
          secureTextEntry={esClave && !claveVisible}
          // Nunca autocorregir ni poner mayúscula inicial en correos y claves.
          autoCapitalize={props.autoCapitalize ?? 'none'}
          autoCorrect={false}
          accessibilityLabel={etiqueta}
          onFocus={(e) => {
            setEnfocado(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            props.onBlur?.(e);
          }}
        />
        {esClave && (
          <Pressable
            onPress={() => setClaveVisible((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={claveVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            <Text style={styles.alternar}>{claveVisible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        )}
      </View>
 
      {/* accessibilityLiveRegion hace que Android lea el error en voz alta al aparecer. */}
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
 
const styles = StyleSheet.create({
  contenedor: {
    gap: espacio.s - 2,
  },
  etiqueta: {
    color: colores.grafito,
    fontFamily: fuentes.textoMedio,
    fontSize: 14,
  },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.hoja,
    borderWidth: 1.5,
    borderRadius: radio.control,
    paddingHorizontal: espacio.m,
    minHeight: 54,
  },
  cajaEnfocada: {
    // Al enfocar, una línea amarilla abajo refuerza dónde está el cursor.
    borderBottomColor: colores.senal,
    borderBottomWidth: 3,
  },
  entrada: {
    flex: 1,
    color: colores.grafito,
    fontFamily: fuentes.texto,
    fontSize: 16,
    paddingVertical: espacio.m - 2,
  },
  alternar: {
    color: colores.tinta,
    fontFamily: fuentes.textoFuerte,
    fontSize: 14,
    paddingLeft: espacio.s,
  },
  error: {
    color: colores.error,
    fontFamily: fuentes.textoMedio,
    fontSize: 13,
  },
});
