/**
 * Contexto de sesión: el único lugar de la app que habla con Firebase Auth.
 *
 * Las pantallas no importan Firebase directamente; llaman a las funciones de
 * este contexto (iniciarSesion, registrarse, etc.). Así, si mañana se cambia
 * Firebase por otro proveedor, solo se reescribe este archivo.
 */
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';
 
import { auth } from '../config/firebase';
 
type ValorSesion = {
  /** Usuario conectado, o null si nadie ha iniciado sesión. */
  usuario: User | null;
  /** Nombre del perfil (displayName), siempre actualizado tras el registro. */
  nombre: string | null;
  /** true mientras Firebase revisa si hay una sesión guardada. */
  cargando: boolean;
  /**
   * true cuando Firebase confirma que el correo de la cuenta fue verificado.
   * La navegación (Stack.Protected) exige esto para mostrar la bienvenida.
   */
  correoVerificado: boolean;
  iniciarSesion: (correo: string, clave: string) => Promise<void>;
  registrarse: (nombre: string, correo: string, clave: string) => Promise<void>;
  /** Reenvía el correo de verificación a la cuenta que tiene la sesión activa. */
  enviarCorreoVerificacion: () => Promise<void>;
  /**
   * Vuelve a consultar la cuenta a Firebase (reload) y actualiza
   * `correoVerificado`. Devuelve true si el correo quedó verificado.
   */
  recargarUsuario: () => Promise<boolean>;
  enviarCorreoRecuperacion: (correo: string) => Promise<void>;
  cambiarClave: (claveActual: string, claveNueva: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};
 
const ContextoSesion = createContext<ValorSesion | null>(null);
 
/** Hook para leer la sesión desde cualquier pantalla. */
export function useSesion(): ValorSesion {
  // `use` es la forma moderna (React 19) de leer un contexto.
  const valor = use(ContextoSesion);
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de <ProveedorSesion>.');
  }
  return valor;
}
 
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  // Copia del dato emailVerified en el estado: reload() actualiza los campos
  // del MISMO objeto user sin cambiar su referencia, y si la referencia no
  // cambia, React no vuelve a renderizar (el guard del layout no se enteraría).
  const [correoVerificado, setCorreoVerificado] = useState(false);
  // Nombre del perfil guardado aparte: updateProfile modifica el mismo objeto
  // `user` sin cambiar su referencia, así que React no detectaría el cambio
  // si las pantallas leyeran usuario.displayName directamente.
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    // onAuthStateChanged se dispara al arrancar (con la sesión guardada o null)
    // y cada vez que alguien inicia o cierra sesión. Es la fuente de verdad:
    // la navegación (Stack.Protected en _layout.tsx) depende de este estado.
    const cancelarSuscripcion = onAuthStateChanged(auth, (usuarioFirebase) => {
      setUsuario(usuarioFirebase);
      setCorreoVerificado(usuarioFirebase?.emailVerified ?? false);
      setNombre(usuarioFirebase?.displayName ?? null);
      setCargando(false);
    });
    // Al desmontar el proveedor dejamos de escuchar para no fugar memoria.
    return cancelarSuscripcion;
  }, []);
 
  async function iniciarSesion(correo: string, clave: string) {
    await signInWithEmailAndPassword(auth, correo.trim(), clave);
    // No navegamos aquí: onAuthStateChanged actualiza `usuario` y el
    // Stack.Protected muestra automáticamente la pantalla de bienvenida.
  }
 
  async function registrarse(nombreCompleto: string, correo: string, clave: string) {
    // Crear la cuenta también inicia la sesión.
    const credencial = await createUserWithEmailAndPassword(auth, correo.trim(), clave);
    // Guardamos el nombre en el perfil de Firebase (campo displayName).
    const nombreLimpio = nombreCompleto.trim();
    await updateProfile(credencial.user, { displayName: nombreLimpio });
    // La bienvenida aún no se muestra: hasta que el correo esté verificado
    // solo existe la pantalla verificar-correo. onAuthStateChanged corre al
    // crear la cuenta (antes de updateProfile), así que el nombre se copia
    // al estado a mano.
    setNombre(nombreLimpio);
    // Enviamos el correo de verificación (sendEmailVerification). Si el envío
    // falla (sin red, cuota agotada) NO bloqueamos el registro: la pantalla
    // de verificación permite reenviar el correo cuando quiera.
    try {
      await sendEmailVerification(credencial.user);
    } catch {
      // Vacío a propósito: la cuenta ya existe; el reenvío se hace desde
      // la pantalla verificar-correo.
    }
  }

  async function enviarCorreoVerificacion() {
    const actual = auth.currentUser;
    if (!actual) throw new Error('No hay una sesión activa.');
    // Firebase envía un correo con un enlace a su página de verificación
    // (plantilla editable en la consola: Authentication > Templates >
    // Email verification). El enlace marca la cuenta como verificada.
    await sendEmailVerification(actual);
  }

  async function recargarUsuario(): Promise<boolean> {
    const actual = auth.currentUser;
    if (!actual) {
      setCorreoVerificado(false);
      return false;
    }
    // reload() vuelve a consultar la cuenta a Firebase: si el usuario abrió
    // el enlace del correo, emailVerified llega en true.
    await actual.reload();
    setCorreoVerificado(actual.emailVerified);
    return actual.emailVerified;
  }

  async function enviarCorreoRecuperacion(correo: string) {
    // Firebase envía un correo con un enlace a su página de restablecimiento.
    // Si el correo no existe, por la protección de enumeración NO lanza error:
    // por eso la pantalla muestra un mensaje neutro.
    await sendPasswordResetEmail(auth, correo.trim());
  }
 
  async function cambiarClave(claveActual: string, claveNueva: string) {
    const actual = auth.currentUser;
    if (!actual?.email) throw new Error('No hay una sesión activa.');
 
    // updatePassword es una operación sensible: Firebase la rechaza con
    // "auth/requires-recent-login" si la sesión no es reciente. Por eso
    // primero confirmamos la identidad con la contraseña actual.
    const credencial = EmailAuthProvider.credential(actual.email, claveActual);
    await reauthenticateWithCredential(actual, credencial);
    await updatePassword(actual, claveNueva);
  }
 
  async function cerrarSesion() {
    await signOut(auth);
  }
 
  return (
    <ContextoSesion
      value={{
        usuario,
        nombre,
        cargando,
        correoVerificado,
        iniciarSesion,
        registrarse,
        enviarCorreoVerificacion,
        recargarUsuario,
        enviarCorreoRecuperacion,
        cambiarClave,
        cerrarSesion,
      }}>
      {children}
    </ContextoSesion>
  );
}
