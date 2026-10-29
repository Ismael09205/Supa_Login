/**
 * Validaciones del lado del cliente.
 * Sirven para dar respuesta inmediata sin gastar una petición a Firebase.
 * No reemplazan la validación del servidor: Firebase vuelve a validar todo.
 * Cada función devuelve un mensaje de error o null si el valor es válido.
 */
 
// Patrón simple: algo@algo.dominio. La validación estricta la hace Firebase.
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
 
/** Firebase exige 6 caracteres como mínimo; en el taller pedimos 8. */
export const LONGITUD_MINIMA_CLAVE = 8;
 
export function validarCorreo(correo: string): string | null {
  if (!correo.trim()) return 'Escribe tu correo.';
  if (!PATRON_CORREO.test(correo.trim())) return 'Revisa el formato del correo.';
  return null;
}
 
export function validarClave(clave: string): string | null {
  if (!clave) return 'Escribe una contraseña.';
  if (clave.length < LONGITUD_MINIMA_CLAVE) {
    return `Usa al menos ${LONGITUD_MINIMA_CLAVE} caracteres.`;
  }
  return null;
}
 
export function validarConfirmacion(clave: string, confirmacion: string): string | null {
  if (!confirmacion) return 'Repite la contraseña.';
  if (clave !== confirmacion) return 'Las contraseñas no coinciden.';
  return null;
}
 
export function validarNombre(nombre: string): string | null {
  if (nombre.trim().length < 3) return 'Escribe tu nombre (mínimo 3 letras).';
  return null;
}
