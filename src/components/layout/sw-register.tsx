"use client";

import * as React from "react";

/** Registra o service worker do PWA (silencioso; nunca bloqueia a UI). */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Instalação do PWA é um extra — falhar aqui não deve afetar o app.
    });
  }, []);

  return null;
}
