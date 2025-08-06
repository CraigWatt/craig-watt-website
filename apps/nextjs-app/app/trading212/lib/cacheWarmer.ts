let intervalHandle: NodeJS.Timeout | null = null;

export function startCacheWarmer() {
  console.log('[WARM] startCacheWarmer() invoked');

  if (intervalHandle) {
    console.log('[WARM] Warmer already running, skipping setup');
    return;
  }

  const warm = async () => {
    console.log('[WARM] Executing warm() request...');
    try {
      const res = await fetch('https://craigwatt.co.uk/api/trading212', {
        method: 'GET',
        headers: { 'User-Agent': 'CacheWarmer/1.0' },
      });

      const status = res.status;
      if (status === 200) {
        console.log(`[WARM] Cache warmed successfully at ${new Date().toISOString()}`);
      } else {
        console.warn(`[WARM] Cache warm failed with HTTP ${status}`);
      }
    } catch (err) {
      console.warn(`[WARM] Cache warm request failed:`, err);
    }
  };

  const intervalMs = 4 * 60 * 1000;

  void warm(); // fire-and-forget boot warm
  intervalHandle = setInterval(warm, intervalMs);
}
