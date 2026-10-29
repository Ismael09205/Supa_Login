/**
 * Pantalla de bienvenida (solo con sesión iniciada).
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
 
import { Boton } from '../../../components/boton';
import { PantallaHoja } from '../../../components/pantalla-hoja';
import { colores, espacio, fuentes, radio } from '../../../constants/tema';
import { useSesion } from '../../../context/sesion';
 
/** Convierte la fecha que entrega Firebase (texto) a "27 de octubre de 2026". */
function formatearFecha(fecha?: string): string {
  if (!fecha) return 'Sin registro';
  return new Date(fecha).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
 
export default function PantallaBienvenida() {
  const { usuario, nombre: nombrePerfil, cerrarSesion } = useSesion();
  const [saliendo, setSaliendo] = useState(false);
 
  // Gracias a Stack.Protected esta pantalla nunca se muestra sin usuario,
  // pero TypeScript no lo sabe; por eso el operador ?.
  // Para el saludo basta el primer nombre; la ficha muestra el nombre completo.
  const nombre =
    nombrePerfil?.split(' ')[0] || usuario?.email?.split('@')[0] || 'estudiante';
 
  async function manejarSalida() {
    setSaliendo(true);
    await cerrarSesion();
    // No navegamos: al quedar usuario = null, Stack.Protected lleva al login.
  }
 
  return (
    <PantallaHoja
      titulo={'Bienvenido\na la APP,\nestudiante\nde la ESFOT'}
      extraEncabezado={
        // La única animación de la app: confirma que el ingreso funcionó.
        // Reanimated respeta la opción "reducir movimiento" del sistema.
        <Animated.Text entering={FadeInDown.duration(1000).delay(150)} style={styles.saludo}>
          Hola, {nombre}.
        </Animated.Text>
      }>
      {/* Ficha con los datos de la cuenta que guarda Firebase. */}
      <View style={styles.ficha}>
        <Fila etiqueta="Nombre" valor={nombrePerfil || 'Sin nombre'} />
        <Fila etiqueta="Correo" valor={usuario?.email ?? ''} />
        <Fila etiqueta="Cuenta creada" valor={formatearFecha(usuario?.metadata.creationTime)} />
        <Fila
          etiqueta="Último ingreso"
          valor={formatearFecha(usuario?.metadata.lastSignInTime)}
          ultima
        />
      </View>
 
      <Boton texto="Cambiar contraseña" onPress={() => router.push('/cambiar-clave')} />
      <Boton variante="secundario" texto="Cerrar sesión" onPress={manejarSalida} cargando={saliendo} />
    </PantallaHoja>
  );
}
 
/** Una fila etiqueta-valor de la ficha. Componente local: solo se usa aquí. */
function Fila({ etiqueta, valor, ultima = false }: { etiqueta: string; valor: string; ultima?: boolean }) {
  return (
    <View style={[styles.fila, !ultima && styles.filaSeparada]}>
      <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
      <Text style={styles.filaValor} numberOfLines={1} ellipsizeMode="middle">
        {valor}
      </Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
  saludo: {
    color: colores.senal,
    fontFamily: fuentes.textoMedio,
    fontSize: 18,
    marginTop: espacio.m,
  },
  ficha: {
    backgroundColor: colores.hoja,
    borderRadius: radio.control + 4,
    paddingHorizontal: espacio.m,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espacio.m,
    paddingVertical: espacio.m - 2,
  },
  filaSeparada: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colores.borde,
  },
  filaEtiqueta: {
    color: colores.lapiz,
    fontFamily: fuentes.texto,
    fontSize: 14,
  },
  filaValor: {
    flexShrink: 1,
    color: colores.grafito,
    fontFamily: fuentes.textoMedio,
    fontSize: 15,
    textAlign: 'right',
  },
});
