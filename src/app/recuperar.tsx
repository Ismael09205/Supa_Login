/**
 * Recuperar contraseña.
 *
 * Flujo completo:
 *   1. El estudiante escribe su correo y toca "Enviar enlace".
 *   2. Firebase envía un correo (plantilla editable en la consola:
 *      Authentication > Templates > Password reset).
 *   3. El enlace abre una página de Firebase donde se escribe la contraseña nueva.
 *   4. El estudiante vuelve a la app e inicia sesión con esa contraseña.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
 
import { Aviso } from '../../components/aviso';
import { Boton } from '../../components/boton';
import { CampoTexto } from '../../components/campo-texto';
import { PantallaHoja } from '../../components/pantalla-hoja';
import { useSesion } from '../../context/sesion';
import { mensajeDeError } from './lib/errores-firebase';
import { validarCorreo } from './lib/validaciones';
 
export default function PantallaRecuperar() {
  const { enviarCorreoRecuperacion } = useSesion();
  // Recibimos el correo que el usuario ya había escrito en el login (si lo hizo).
  const params = useLocalSearchParams<{ correo?: string }>();
 
  const [correo, setCorreo] = useState(params.correo ?? '');
  const [errorCampo, setErrorCampo] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
 
  async function manejarEnvio() {
    const error = validarCorreo(correo);
    setErrorCampo(error);
    setErrorGeneral(null);
    if (error) return;
 
    setEnviando(true);
    try {
      await enviarCorreoRecuperacion(correo);
      setEnviado(true);
    } catch (e) {
      setErrorGeneral(mensajeDeError(e));
    } finally {
      // Aquí sí usamos finally: la pantalla sigue montada en ambos casos.
      setEnviando(false);
    }
  }
 
  return (
    <PantallaHoja
      conVolver
      titulo={'Recupera\ntu acceso'}
      bajada="Te enviaremos un enlace para que crees una contraseña nueva.">
      {/*
        Mensaje neutro a propósito: no confirmamos si el correo existe.
        Decir "ese correo no está registrado" permitiría a un atacante
        averiguar qué correos tienen cuenta (enumeración de usuarios).
      */}
      {enviado ? (
        <Aviso
          tipo="exito"
          mensaje={`Si ${correo.trim()} tiene una cuenta, en unos minutos recibirás el enlace. Revisa también la carpeta de spam.`}
        />
      ) : null}
      {errorGeneral ? <Aviso tipo="error" mensaje={errorGeneral} /> : null}
 
      <CampoTexto
        etiqueta="Correo de tu cuenta"
        placeholder="nombre.apellido@epn.edu.ec"
        value={correo}
        onChangeText={(texto) => {
          setCorreo(texto);
          setEnviado(false); // si cambia el correo, el aviso anterior ya no aplica
        }}
        error={errorCampo}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        onSubmitEditing={manejarEnvio}
      />
 
      {enviado ? (
        <>
          <Boton texto="Volver a iniciar sesión" onPress={() => router.back()} />
          <Boton variante="secundario" texto="Enviar otra vez" onPress={manejarEnvio} cargando={enviando} />
        </>
      ) : (
        <Boton texto="Enviar enlace" onPress={manejarEnvio} cargando={enviando} />
      )}
    </PantallaHoja>
  );
}
