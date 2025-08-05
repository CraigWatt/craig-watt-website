// app/trading212/lib/server/cacheWarmer.ts

export function startCacheWarmer() {
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

  warm(); // immediate boot-time warm

  const intervalMs = 4 * 60 * 1000; // every 4 minutes
  setInterval(warm, intervalMs);
}
