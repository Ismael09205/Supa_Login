/**
 * Cambiar contraseña (solo con sesión iniciada).
 *
 * Pedimos la contraseña actual por dos razones:
 *   1. Firebase exige un inicio de sesión reciente para cambiar la clave
 *      (si no, lanza auth/requires-recent-login). Con la clave actual
 *      reautenticamos al usuario en el momento.
 *   2. Si alguien toma un teléfono desbloqueado, no puede cambiar la clave
 *      sin conocer la actual.
 */
import { router } from 'expo-router';
import { useState } from 'react';
 
import { Aviso } from '../../../components/aviso';
import { Boton } from '../../../components/boton';
import { CampoTexto } from '../../../components/campo-texto';
import { PantallaHoja } from '../../../components/pantalla-hoja';
import { useSesion } from '../../../context/sesion';
import { mensajeDeError } from '../lib/errores-firebase';
import { LONGITUD_MINIMA_CLAVE, validarClave, validarConfirmacion } from '../lib/validaciones';
 
type Errores = Partial<Record<'actual' | 'nueva' | 'confirmacion', string | null>>;
 
export default function PantallaCambiarClave() {
  const { cambiarClave } = useSesion();
 
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [listo, setListo] = useState(false);
  const [enviando, setEnviando] = useState(false);
 
  async function manejarCambio() {
    const nuevosErrores: Errores = {
      actual: actual ? null : 'Escribe tu contraseña actual.',
      nueva:
        validarClave(nueva) ??
        (nueva === actual ? 'La nueva contraseña debe ser distinta de la actual.' : null),
      confirmacion: validarConfirmacion(nueva, confirmacion),
    };
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    if (Object.values(nuevosErrores).some(Boolean)) return;
 
    setEnviando(true);
    try {
      await cambiarClave(actual, nueva);
      setListo(true);
      // Limpiamos los campos: no conviene dejar contraseñas en memoria visible.
      setActual('');
      setNueva('');
      setConfirmacion('');
    } catch (error) {
      setErrorGeneral(
        // En esta pantalla, "credencial inválida" significa clave actual incorrecta.
        mensajeDeError(error, {
          'auth/invalid-credential': 'La contraseña actual no es correcta.',
          'auth/wrong-password': 'La contraseña actual no es correcta.',
        }),
      );
    } finally {
      setEnviando(false);
    }
  }
 
  return (
    <PantallaHoja
      conVolver
      titulo={'Cambia tu\ncontraseña'}
      bajada={`Confirma la actual y elige una nueva de al menos ${LONGITUD_MINIMA_CLAVE} caracteres.`}>
      {listo ? (
        <Aviso
          tipo="exito"
          mensaje="Contraseña actualizada. La próxima vez que inicies sesión usa la nueva."
        />
      ) : null}
      {errorGeneral ? <Aviso tipo="error" mensaje={errorGeneral} /> : null}
 
      <CampoTexto
        etiqueta="Contraseña actual"
        value={actual}
        onChangeText={setActual}
        error={errores.actual}
        esClave
        textContentType="password"
        autoComplete="current-password"
      />
      <CampoTexto
        etiqueta="Contraseña nueva"
        value={nueva}
        onChangeText={setNueva}
        error={errores.nueva}
        esClave
        textContentType="newPassword"
        autoComplete="new-password"
      />
      <CampoTexto
        etiqueta="Repite la contraseña nueva"
        value={confirmacion}
        onChangeText={setConfirmacion}
        error={errores.confirmacion}
        esClave
        textContentType="newPassword"
        autoComplete="new-password"
        onSubmitEditing={manejarCambio}
      />
 
      {listo ? (
        <Boton texto="Volver a la bienvenida" onPress={() => router.back()} />
      ) : (
        <Boton texto="Guardar contraseña" onPress={manejarCambio} cargando={enviando} />
      )}
    </PantallaHoja>
  );
}
