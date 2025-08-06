let intervalHandle: NodeJS.Timeout | null = null;

export function startCacheWarmer() {
  console.log('[WARM] startCacheWarmer() invoked');

  if (intervalHandle) {
    console.log('[WARM] Warmer already running, skipping setup');
    return;
  }

  const warm = async () => {
    console.log('[WARM] Executing warm() request...');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000); // 90s timeout

    try {
      const res = await fetch('https://craigwatt.co.uk/api/trading212', {
        method: 'GET',
        headers: { 'User-Agent': 'CacheWarmer/1.0' },
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const status = res.status;
      if (status === 200) {
        console.log(`[WARM] Cache warmed successfully at ${new Date().toISOString()}`);
      } else {
        console.warn(`[WARM] Cache warm failed with HTTP ${status}`);
      }
    } catch (err: unknown) {
      clearTimeout(timeout);

      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('[WARM] Cache warm request timed out');
      } else {
        console.warn('[WARM] Cache warm request failed:', err);
      }
    }
  };

  void warm(); // fire-and-forget boot warm

  const baseInterval = 3 * 60 * 1000;
  const jitter = Math.floor(Math.random() * 20_000); // up to 20s jitter
  intervalHandle = setInterval(warm, baseInterval + jitter);
}
