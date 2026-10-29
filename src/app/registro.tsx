/**
 * Pantalla de registro de una cuenta nueva.
 *
 * Ojo: este registro es abierto. Cualquier persona con un correo puede crear
 * una cuenta. El texto "estudiante de la ESFOT" de la bienvenida no verifica
 * nada; para restringir de verdad habría que crear las cuentas desde la consola
 * o validar el dominio en el servidor.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
 
import { Aviso } from '../../components/aviso';
import { Boton } from '../../components/boton';
import { CampoTexto } from '../../components/campo-texto';
import { PantallaHoja } from '../../components/pantalla-hoja';
import { colores, espacio, fuentes } from '../../constants/tema';
import { useSesion } from '../../context/sesion';
import { mensajeDeError } from './lib/errores-firebase';
import {
  LONGITUD_MINIMA_CLAVE,
  validarClave,
  validarConfirmacion,
  validarCorreo,
  validarNombre,
} from './lib/validaciones';
 
type Errores = Partial<Record<'nombre' | 'correo' | 'clave' | 'confirmacion', string | null>>;
 
export default function PantallaRegistro() {
  const { registrarse } = useSesion();
 
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
 
  async function manejarRegistro() {
    const nuevosErrores: Errores = {
      nombre: validarNombre(nombre),
      correo: validarCorreo(correo),
      clave: validarClave(clave),
      confirmacion: validarConfirmacion(clave, confirmacion),
    };
    setErrores(nuevosErrores);
    setErrorGeneral(null);
    // Object.values + some: ¿hay al menos un error?
    if (Object.values(nuevosErrores).some(Boolean)) return;
 
    setEnviando(true);
    try {
      await registrarse(nombre, correo, clave);
      // Al crear la cuenta Firebase inicia sesión y el layout muestra la
      // pantalla de verificación de correo (la bienvenida espera a que
      // el estudiante abra el enlace que Firebase le envía).
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      setEnviando(false);
    }
  }
 
  return (
    <PantallaHoja
      conVolver
      titulo={'Crea tu\ncuenta'}
      bajada="Con esta cuenta entrarás a la app desde cualquier teléfono.">
      {errorGeneral ? <Aviso tipo="error" mensaje={errorGeneral} /> : null}
 
      <CampoTexto
        etiqueta="Nombre"
        placeholder="Como quieres que te saludemos"
        value={nombre}
        onChangeText={setNombre}
        error={errores.nombre}
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
      />
      <CampoTexto
        etiqueta="Correo"
        placeholder="nombre.apellido@epn.edu.ec"
        value={correo}
        onChangeText={setCorreo}
        error={errores.correo}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />
      <CampoTexto
        etiqueta="Contraseña"
        placeholder={`Mínimo ${LONGITUD_MINIMA_CLAVE} caracteres`}
        value={clave}
        onChangeText={setClave}
        error={errores.clave}
        esClave
        // "newPassword" hace que iOS sugiera una contraseña segura.
        textContentType="newPassword"
        autoComplete="new-password"
      />
      <CampoTexto
        etiqueta="Repite la contraseña"
        value={confirmacion}
        onChangeText={setConfirmacion}
        error={errores.confirmacion}
        esClave
        textContentType="newPassword"
        autoComplete="new-password"
        onSubmitEditing={manejarRegistro}
      />
 
      <Boton texto="Crear cuenta" onPress={manejarRegistro} cargando={enviando} />
 
      <View style={styles.pie}>
        <Text style={styles.pieTexto}>¿Ya tienes cuenta?</Text>
        <Boton variante="enlace" texto="Inicia sesión" onPress={() => router.back()} />
      </View>
    </PantallaHoja>
  );
}
 
const styles = StyleSheet.create({
  pie: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: espacio.s - 2,
    marginTop: espacio.m,
  },
  pieTexto: {
    color: colores.lapiz,
    fontFamily: fuentes.texto,
    fontSize: 15,
  },
});
