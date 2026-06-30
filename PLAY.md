# Kit de envío — Google Play

Android ya está funcional (push, ícono, sesión, borrado de cuenta). Esto es lo que
falta para subirlo a Play Console.

## 1) Generar el AAB firmado (Android Studio)
1. Asegurate de tener el ícono nuevo: `npx cap sync android` ya corrido, y **▶ Run**
   una vez para confirmar que la app abre con la manzana.
2. **Build → Generate Signed App Bundle / APK → Android App Bundle**.
3. **Create new…** keystore (la primera vez):
   - Guardá el archivo `.jks` y las contraseñas en lugar seguro (p. ej. la carpeta
     `secrets/`, NUNCA en el repo). **Si lo perdés, no podés actualizar la app.**
4. Elegí **release** y generá el `.aab`.
5. **Play App Signing**: dejá que Google gestione la clave de firma de la app (es lo
   recomendado y viene activado). Vos guardás solo la **clave de subida** (el `.jks`).

## 2) Ficha de la tienda (Store listing)
- **Nombre:** Colequium
- **Descripción corta (≤80):** La comunidad escolar, conectada: avisos, calendario y mensajes.
- **Descripción larga:**
  > Colequium conecta al colegio con las familias y los docentes en un solo lugar.
  > Recibí los avisos importantes, el calendario de eventos, las tareas y los mensajes
  > del colegio con notificaciones en tu teléfono. Cada persona ve lo que le
  > corresponde según su rol. Para usar Colequium, tu colegio debe invitarte.
  >
  > • Avisos y comunicados, con confirmación de lectura.
  > • Calendario de eventos e invitaciones con confirmación de asistencia.
  > • Mensajes directos con el colegio.
  > • Tareas y circulares para firmar.
  > • Notificaciones configurables y disponible en varios idiomas.

## 3) Screenshots (capturá desde tu teléfono — la app ya funciona)
Mínimo 2 (recomendado 4-6), teléfono. Pantallas sugeridas, **app real en uso**:
Avisos (muro con contenido), Calendario, un aviso/tarea abierto, Mensajes, Perfil.
(Evitá login/splash vacío.)

## 4) Política de privacidad
URL: **https://colequium.com/privacidad** (ya publicada).

## 5) Seguridad de los datos (Data safety)
- **Recopila datos:** Sí.
- **Tipos:** Información personal (nombre, correo); Mensajes (in-app); ID del
  dispositivo (token push). Datos académicos del alumno los administra el colegio.
- **Se comparten con terceros:** No para sus fines; sí proveedores que procesan por
  nuestra cuenta (Supabase, Firebase/Google, Resend, Vercel).
- **Fines:** funcionalidad de la app y comunicación. **No** publicidad, **no**
  tracking de terceros.
- **Cifrado en tránsito:** Sí (HTTPS).
- **El usuario puede pedir la eliminación:** Sí — **borrado de cuenta in-app**
  (Perfil → Eliminar mi cuenta). Declarar también la URL de la política.

## 6) Clasificación de contenido (cuestionario IARC)
Declarar con honestidad:
- **Comunicación de usuarios / mensajería:** Sí (mensajes directos).
- **Contenido generado por usuarios:** Sí (avisos, comentarios).
- Sin violencia, sexo, drogas, juego ni compras. Resultado esperado: apto para
  todos / +3, según el cuestionario.

## 7) Público objetivo
- La app la usan adultos (familias, docentes, staff). Los alumnos acceden con
  autorización del colegio. Definir el público objetivo en consecuencia (no es una
  app dirigida a niños para descarga abierta; el acceso es por invitación del colegio).

## 8) Antes de publicar
- Subí el `.aab` a **Internal testing** primero, instalalo desde el link y probá
  login + push + borrado en el build de release.
- Después promové a Production.
