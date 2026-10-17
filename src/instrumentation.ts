export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl =
      process.env.RENDER_EXTERNAL_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://inagerlis-pv-crm.onrender.com';
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://bkina.onrender.com';

    console.log(
      `[Inagerlis KeepAlive] Inicializando centinela autónomo del frontend en Render. Frontend: ${frontendUrl} | Backend: ${backendUrl}`,
    );

    // Intervalo de 9 minutos (540,000 ms) para estar muy por debajo del límite de 15m de Render
    const INTERVALO_MS = 9 * 60 * 1000;

    const pingServidores = async () => {
      const urls = [
        `${frontendUrl.replace(/\/$/, '')}/api/ping`,
        `${backendUrl.replace(/\/$/, '')}/inagerlis/ping`,
      ];

      for (const url of urls) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);

          const res = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Inagerlis-Frontend-KeepAlive/1.0',
            },
          });

          clearTimeout(timeout);

          if (res.ok) {
            console.log(`[Inagerlis KeepAlive] Latido exitoso -> ${url} (HTTP ${res.status})`);
          } else {
            console.warn(`[Inagerlis KeepAlive] Latido -> ${url} respondió con HTTP ${res.status}`);
          }
        } catch (err: any) {
          console.warn(`[Inagerlis KeepAlive] Error en latido -> ${url}: ${err?.message}`);
        }
      }
    };

    // Primer pulso después de 20 segundos de haber iniciado el servidor
    setTimeout(() => {
      void pingServidores();
    }, 20000);

    // Bucle continuo cada 9 minutos
    setInterval(() => {
      void pingServidores();
    }, INTERVALO_MS);
  }
}
