let intervalHandle: NodeJS.Timeout | null = null;

export function startCacheWarmer() {
  if (intervalHandle) return; // Prevent duplicate warmers

  const warm = async () => {
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

// app/api/trading212/route.ts

if (
  typeof window === 'undefined' &&
  process.env.NODE_ENV === 'production'
) {
  import('../../trading212/lib/cacheWarmer')
    .then((mod) => {
      mod.startCacheWarmer();
    })
    .catch((err) => {
      console.error('[WARM] Failed to import cache warmer', err);
    });
}
