/**
 * Plantilla común de todas las pantallas:
 *
 * Centralizar esto en un componente hace que cada pantalla solo se ocupe
 * de su lógica y no repita el manejo del teclado ni de las zonas seguras.
 */
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
 
import { CurvasDeNivel } from '../components/curvas-de-nivel';
import { colores, espacio, fuentes, radio } from '../constants/tema';
 
type Props = {
  /** Línea pequeña sobre el título (por ejemplo, el nombre de la escuela). */
  antetitulo?: string;
  titulo: string;
  bajada?: string;
  /** Muestra el botón "Volver" en el encabezado. */
  conVolver?: boolean;
  /** Contenido extra dentro del encabezado, debajo del título. */
  extraEncabezado?: ReactNode;
  children: ReactNode;
};
 
export function PantallaHoja({
  antetitulo,
  titulo,
  bajada,
  conVolver = false,
  extraEncabezado,
  children,
}: Props) {
  // insets = espacio ocupado por la muesca (notch) y la barra de gestos.
  const insets = useSafeAreaInsets();
 
  return (
    // El teclado tapa los campos; KeyboardAvoidingView empuja el contenido.
    // También se necesita en Android: con edge-to-edge (siempre activo en SDK
    // recientes) el sistema ya no redimensiona la ventana al abrir el teclado.
    <KeyboardAvoidingView style={styles.raiz} behavior="padding">
      {/* Íconos de la barra de estado en blanco, porque el fondo es oscuro. */}
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        // "handled": un toque en un botón funciona aunque el teclado esté abierto.
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        <View style={[styles.encabezado, { paddingTop: insets.top + espacio.m }]}>
          <CurvasDeNivel />
 
          {conVolver && (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={12}
              style={({ pressed }) => [
                styles.volver,
                { top: insets.top + espacio.s },
                pressed && { opacity: 0.6 },
              ]}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M15 5 L8 12 L15 19"
                  stroke={colores.papel}
                  strokeWidth={2.4}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.volverTexto}>Volver</Text>
            </Pressable>
          )}
 
          <View style={styles.bloqueTitulo}>
            {antetitulo ? <Text style={styles.antetitulo}>{antetitulo}</Text> : null}
            {/* accessibilityRole="header" ayuda a los lectores de pantalla. */}
            <Text style={styles.titulo} accessibilityRole="header">
              {titulo}
            </Text>
            {bajada ? <Text style={styles.bajada}>{bajada}</Text> : null}
            {extraEncabezado}
          </View>
        </View>
 
        <View style={[styles.hoja, { paddingBottom: insets.bottom + espacio.xl }]}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: colores.tinta,
  },
  scroll: {
    // flexGrow permite que la hoja ocupe todo el alto aunque haya poco contenido.
    flexGrow: 1,
  },
  encabezado: {
    backgroundColor: colores.tinta,
    paddingHorizontal: espacio.l,
    // El espacio extra abajo queda oculto bajo la hoja (que sube con margen negativo).
    paddingBottom: espacio.xxl + radio.hoja,
    overflow: 'hidden',
    minHeight: 280,
    justifyContent: 'flex-end',
  },
  volver: {
    position: 'absolute',
    left: espacio.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: espacio.s,
    paddingHorizontal: espacio.s,
    // top se calcula en el render con insets.top (depende del teléfono).
  },
  volverTexto: {
    color: colores.papel,
    fontFamily: fuentes.textoMedio,
    fontSize: 15,
  },
  bloqueTitulo: {
    marginTop: espacio.xxl + espacio.l,
    maxWidth: 520,
  },
  antetitulo: {
    color: colores.senal,
    fontFamily: fuentes.textoMedio,
    fontSize: 14,
    letterSpacing: 0.2,
    marginBottom: espacio.s,
  },
  titulo: {
    color: colores.papel,
    fontFamily: fuentes.titular,
    fontSize: 58,
    lineHeight: 56,
    letterSpacing: -0.5,
  },
  bajada: {
    color: colores.papel,
    opacity: 0.78,
    fontFamily: fuentes.texto,
    fontSize: 16,
    lineHeight: 23,
    marginTop: espacio.m,
    maxWidth: 340,
  },
  hoja: {
    flex: 1,
    backgroundColor: colores.papel,
    borderTopLeftRadius: radio.hoja,
    borderTopRightRadius: radio.hoja,
    // La hoja "sube" sobre el encabezado para que parezca apoyada encima.
    marginTop: -radio.hoja,
    paddingHorizontal: espacio.l,
    paddingTop: espacio.xl,
    gap: espacio.m,
  },
});
