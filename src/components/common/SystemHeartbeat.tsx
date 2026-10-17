'use client';

import { useEffect } from 'react';
import { API_BASE_URL, API_PREFIX } from '@/services/api';

/**
 * Centinela de Latido Autónomo de Inagerlis
 * 
 * Mantiene despiertos y sincronizados de forma perpetua los servidores de Render
 * (Frontend y Backend) mientras cualquier usuario, cajero o administrador tenga
 * la aplicación abierta en su navegador o PWA, sin depender de servicios de terceros.
 */
export default function SystemHeartbeat() {
  useEffect(() => {
    // Solo en entorno de navegador
    if (typeof window === 'undefined') return;

    const backendPingUrl = `${API_BASE_URL}${API_PREFIX}/ping`;
    const frontendPingUrl = '/api/ping';

    const enviarPulso = async () => {
      // 1. Latido a la API del Frontend (mantiene despierto el servidor de Next.js en Render)
      try {
        await fetch(frontendPingUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: { 'x-heartbeat': 'client-active' },
        });
      } catch {}

      // 2. Latido al Backend (mantiene despierto el servidor NestJS en Render)
      try {
        await fetch(backendPingUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: { 'x-heartbeat': 'client-active' },
        });
      } catch {}
    };

    // Pulso inicial a los 5 segundos de cargar la app
    const initialTimer = setTimeout(() => {
      void enviarPulso();
    }, 5000);

    // Pulso recurrente cada 5 minutos (300,000 ms)
    // Muy por debajo de los 15 minutos de inactividad de Render
    const intervalTimer = setInterval(() => {
      void enviarPulso();
    }, 5 * 60 * 1000);

    // Pulso reactivo cuando el usuario vuelve a enfocar la pestaña o recupera internet
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void enviarPulso();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', enviarPulso);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', enviarPulso);
    };
  }, []);

  return null;
}
