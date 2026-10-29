/**
 * Verificación del correo de la cuenta.
 *
 * Flujo completo:
 *   1. Al crear la cuenta, registrarse() llama a sendEmailVerification de
 *      Firebase y envía un correo con un enlace (plantilla editable en la
 *      consola: Authentication > Templates > Email verification).
 *   2. Mientras el enlace no se abra, el estudiante NO puede llegar a la
 *      bienvenida: Stack.Protected en _layout.tsx solo deja existir esta
 *      pantalla mientras emailVerified sea false.
 *   3. Al tocar "Ya verifiqué mi correo" recargamos la cuenta con reload();
 *      si Firebase confirma la verificación, el layout muestra la bienvenida
 *      sin necesidad de navegar a mano.
 */
import { useState } from 'react';

import { Aviso } from '../../components/aviso';
import { Boton } from '../../components/boton';
import { PantallaHoja } from '../../components/pantalla-hoja';
import { useSesion } from '../../context/sesion';
import { mensajeDeError } from './lib/errores-firebase';

export default function PantallaVerificarCorreo() {
  const { usuario, enviarCorreoVerificacion, recargarUsuario, cerrarSesion } = useSesion();

  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [reenviado, setReenviado] = useState(false);
  const [sinVerificar, setSinVerificar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [comprobando, setComprobando] = useState(false);

  async function manejarReenvio() {
    setErrorGeneral(null);
    setSinVerificar(false);
    setEnviando(true);
    try {
      await enviarCorreoVerificacion();
      setReenviado(true);
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
    } finally {
      setEnviando(false);
    }
  }

  async function manejarComprobacion() {
    setErrorGeneral(null);
    setReenviado(false);
    setComprobando(true);
    try {
      // recargarUsuario devuelve el resultado de Firebase. Si quedó en
      // true, no hacemos nada más: el guard del layout cambia solo y
      // aparece la bienvenida.
      const verificado = await recargarUsuario();
      setSinVerificar(!verificado);
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
    } finally {
      setComprobando(false);
    }
  }

  return (
    <PantallaHoja
      titulo={'Verifica\ntu correo'}
      bajada={`Enviamos un enlace de verificación a ${usuario?.email ?? 'tu correo'}. Ábrelo para activar tu cuenta.`}>
      {errorGeneral ? <Aviso tipo="error" mensaje={errorGeneral} /> : null}
      {reenviado ? (
        <Aviso tipo="exito" mensaje="Correo reenviado. Si no llega en unos minutos, revisa la carpeta de spam." />
      ) : null}
      {/*
        Aparece solo tras comprobar y seguir sin verificar: recuerda que el
        enlace se abre en el navegador y luego hay que volver a la app.
      */}
      {sinVerificar ? (
        <Aviso
          tipo="error"
          mensaje="Tu correo todavía no está verificado. Abre el enlace del correo que te enviamos y vuelve a intentarlo."
        />
      ) : null}

      <Boton texto="Ya verifiqué mi correo" onPress={manejarComprobacion} cargando={comprobando} />
      <Boton variante="secundario" texto="Reenviar correo" onPress={manejarReenvio} cargando={enviando} />
      <Boton variante="secundario" texto="Cerrar sesión" onPress={() => cerrarSesion()} />
    </PantallaHoja>
  );
}
