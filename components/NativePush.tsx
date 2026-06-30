"use client";

import { useEffect } from "react";
import { registerDevice } from "@/app/(app)/push-actions";

/**
 * Registra el dispositivo para push cuando la app corre dentro del shell nativo
 * (Capacitor). En el navegador web no hace NADA (isNativePlatform === false), así
 * que es seguro montarlo en el layout logueado: para los usuarios web es inerte.
 *
 * Pide permiso, obtiene el token nativo (FCM en Android, APNs→FCM en iOS) y lo
 * guarda contra el usuario actual en device_tokens. Al tocar una notificación,
 * navega al deep-link que venga en data.url.
 */
export function NativePush() {
  useEffect(() => {
    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      const { PushNotifications } = await import("@capacitor/push-notifications");

      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive !== "granted") return;

      await PushNotifications.removeAllListeners();

      await PushNotifications.addListener("registration", (token) => {
        void registerDevice(token.value, Capacitor.getPlatform());
      });
      await PushNotifications.addListener("registrationError", (err) => {
        console.error("[push] registrationError", err);
      });
      await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (action) => {
          const data = (action.notification?.data ?? {}) as Record<string, string>;
          const url = data.url;
          if (typeof url === "string" && url) window.location.href = url;
        },
      );

      await PushNotifications.register();
    })().catch((e) => console.error("[push] init", e));
  }, []);

  return null;
}
