# Checklist de envío a las tiendas (App Store / Play)

Basado en los rechazos reales de Save2App y Livinzy. La app es un shell Capacitor
sobre la web (ver `MOBILE.md`). Marcá cada ítem antes de enviar.

## Requisitos de producto (código)
- [x] **Borrar cuenta in-app** (Apple 5.1.1(v) + Play) — `/profile` → "Eliminar mi
  cuenta", triple confirmación. Borra el usuario de auth → cascadea lo personal;
  el contenido institucional queda anonimizado (author → NULL).
- [x] **Login solo por invitación** — no hay alta abierta de cuentas en la app.
- [ ] **Sin IAP ni CTAs de compra en la app** (Apple 2.1(b)/3.1.3, 3.1.1). El shell
  carga colequium.com y puede navegar a la landing con **"Planes"/pricing**. Antes
  de iOS: agregar `appendUserAgent` en `capacitor.config.ts` (iOS) y que el server
  oculte pricing y el alta "para tu colegio" cuando detecte ese user-agent. El
  registro/cobro B2B va SIEMPRE en la web, nunca en la app.

## Build iOS (re-aplicar si se regenera `ios/`)
- [ ] `ios/App/App/Info.plist`: `UIBackgroundModes → remote-notification` (push),
  `ITSAppUsesNonExemptEncryption = false` (export compliance → responder "No").
- [ ] Xcode → target App → Signing & Capabilities → **+ Push Notifications**.
- [ ] Declarar `*UsageDescription` para CUALQUIER API privada que se agregue
  (cámara, ubicación, etc.). Hoy la app no usa ninguna además de push.
- [ ] Verificar el privacy manifest `.xcprivacy` (Capacitor lo genera).
- [ ] Correr `npx cap sync ios` ANTES de compilar (a Livinzy le rebotó por no hacerlo).

## Fichas de tienda
- [ ] **Screenshots reales** (Apple 2.3.3): muro, calendario, mensajes en uso. NO
  splash/login/mockups vacíos. Frame de iPhone OK si adentro va la pantalla real.
- [ ] **Age Rating** (Apple 2.3.6): declarar **mensajería** y **contenido generado
  por usuarios** (posts/comentarios).
- [ ] **App Review Notes** (Apple 2.1): credenciales demo + pasos.
  Demo: `familia6b@laslomas.demo` / `colequium123`.
- [ ] **Privacy / política**: URL de privacidad y data safety (Play) completos.

## No aplican (confirmado)
- Sign in with Apple: solo si se usa otro SSO. Colequium = email+password → no.
- App Tracking Transparency: solo con tracking cross-app para ads → no (B2B).
