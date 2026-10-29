/**
 * Layout raíz: es lo primero que se ejecuta al abrir la app.
 *
 * Responsabilidades:
 *   1. Cargar las fuentes.
 *   2. Envolver la app en el ProveedorSesion (para que todas las pantallas
 *      conozcan al usuario).
 *   3. Decidir qué pantallas existen según haya o no sesión (Stack.Protected).
 *   4. Mantener visible la pantalla de carga (splash) hasta tener todo listo.
 */
import { BigShoulders_800ExtraBold } from '@expo-google-fonts/big-shoulders';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
 
import { colores } from './../../constants/tema';
import { ProveedorSesion, useSesion } from '../../context/sesion';
 
// Se ejecuta al importar el módulo: evita que el splash se oculte solo.
SplashScreen.preventAutoHideAsync();
 
export default function LayoutRaiz() {
  // useFonts de cualquier paquete @expo-google-fonts sirve para cargar fuentes
  // de distintas familias a la vez.
  const [fuentesListas] = useFonts({
    BigShoulders_800ExtraBold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
 
  return (
    <ProveedorSesion>
      <Navegacion fuentesListas={fuentesListas} />
    </ProveedorSesion>
  );
}
 
/**
 * Está separado de LayoutRaiz porque useSesion solo funciona DENTRO del
 * ProveedorSesion, y LayoutRaiz es justamente quien lo crea.
 */
function Navegacion({ fuentesListas }: { fuentesListas: boolean }) {
  const { usuario, correoVerificado, cargando } = useSesion();
  const listo = fuentesListas && !cargando;
 
  useEffect(() => {
    // Cuando hay fuentes y Firebase ya respondió, quitamos el splash.
    if (listo) SplashScreen.hideAsync();
  }, [listo]);
 
  // Mientras tanto no dibujamos nada: el splash sigue cubriendo la pantalla.
  if (!listo) return null;
 
  return (
    <Stack
      screenOptions={{
        headerShown: false, // cada pantalla dibuja su propio encabezado
        contentStyle: { backgroundColor: colores.tinta },
        animation: 'slide_from_right',
      }}>
      {/*
        Stack.Protected: si `guard` es false, esas rutas "no existen".
        Si alguien está en una ruta que deja de existir (por ejemplo, cierra
        sesión estando en la bienvenida), Expo Router lo lleva a la primera
        ruta disponible. Así no hace falta escribir redirecciones a mano.
      */}
      {/*
        Bienvenida: solo para cuentas con sesión activa Y correo verificado.
      */}
      <Stack.Protected guard={!!usuario && correoVerificado}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>

      {/*
        Sesión iniciada pero correo sin verificar: esta es la única ruta
        disponible, así que el estudiante no puede avanzar a la bienvenida
        hasta abrir el enlace que le enviamos por correo.
      */}
      <Stack.Protected guard={!!usuario && !correoVerificado}>
        <Stack.Screen name="verificar-correo" />
      </Stack.Protected>

      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
        <Stack.Screen name="recuperar" />
      </Stack.Protected>
    </Stack>
  );
}
