;(function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  async function getDeployVersion() {
    try {
      const response = await fetch('/version.json', { cache: 'no-store' });
      if (!response.ok) return 'dev';
      const data = await response.json();
      return data && data.version ? String(data.version) : 'dev';
    } catch (_) {
      return 'dev';
    }
  }

  window.addEventListener('load', async () => {
    try {
      const version = await getDeployVersion();
      const swUrl = '/sw.js?v=' + encodeURIComponent(version);
      const registration = await navigator.serviceWorker.register(swUrl);
      registration.update().catch(() => {});
    } catch (_) {
      // noop
    }
  });
})();
