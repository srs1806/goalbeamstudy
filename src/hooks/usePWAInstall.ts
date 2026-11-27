import { useEffect, useState, useCallback } from 'react';
import { getAppAssetUrl, getScreenHref } from '../utils/seoMetadata';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __goalbeamDeferredPrompt?: BeforeInstallPromptEvent | null;
    __goalbeamPwaOfflineReady?: boolean;
  }
}

function getOfflineCacheRoutes(): string[] {
  const routes = [
    getScreenHref('dashboard'),
    getAppAssetUrl('index.html'),
    getScreenHref('chapters'),
    getScreenHref('practice'),
    getScreenHref('planner'),
    getScreenHref('resources'),
    getScreenHref('aura-ai'),
    getScreenHref('insights'),
    getScreenHref('focus'),
    getScreenHref('leaderboard'),
    getScreenHref('settings'),
    getAppAssetUrl('site.webmanifest'),
    getAppAssetUrl('icon.svg'),
    getAppAssetUrl('favicon.png'),
    getAppAssetUrl('favicon-192x192.png'),
    getAppAssetUrl('favicon-512x512.png'),
    getAppAssetUrl('pwa-maskable-512x512.png'),
    getAppAssetUrl('apple-touch-icon.png'),
    getAppAssetUrl('logo.png'),
  ];
  const isStaticHost =
    typeof window !== 'undefined' && /\.github\.io$/i.test(window.location.hostname || '');
  if (!isStaticHost) {
    routes.push('/api/leaderboard', '/api/app-updates');
  }
  return Array.from(new Set(routes));
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window !== 'undefined' ? window.__goalbeamDeferredPrompt || null : null
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [offlineReady, setOfflineReady] = useState<boolean>(() =>
    typeof window !== 'undefined' ? Boolean(window.__goalbeamPwaOfflineReady) : false
  );
  const [isPreparingOffline, setIsPreparingOffline] = useState(false);

  const prepareOfflineEverything = useCallback(async () => {
    setIsPreparingOffline(true);
    try {
      if ('caches' in window) {
        const cache = await caches.open('goalbeam-offline-shell-v1');
        const cacheTargets = getOfflineCacheRoutes();
        await Promise.all(
          cacheTargets.map((url) =>
            fetch(url, { credentials: 'same-origin' })
              .then(async (res) => {
                if (res && res.ok) {
                  await cache.put(url, res.clone());
                  if (url === '/api/leaderboard') {
                    try {
                      const json = await res.clone().json();
                      if (Array.isArray(json?.users)) {
                        localStorage.setItem(
                          'goalbeam_leaderboard_offline_cache_v1',
                          JSON.stringify({
                            users: json.users,
                            updatedAt: json.updatedAt || new Date().toISOString(),
                          })
                        );
                      }
                    } catch {}
                  }
                }
              })
              .catch(() => {})
          )
        );
      }
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update().catch(() => {});
      }
      window.__goalbeamPwaOfflineReady = true;
      setOfflineReady(true);
      return true;
    } catch {
      return false;
    } finally {
      setIsPreparingOffline(false);
    }
  }, []);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };

    checkStandalone();

    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);
    setIsMobile(/android|iphone|ipad|ipod|mobile/.test(ua));

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    if (window.__goalbeamDeferredPrompt) {
      setDeferredPrompt(window.__goalbeamDeferredPrompt);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => {
          setOfflineReady(true);
        })
        .catch(() => {});
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const bipEvent = e as BeforeInstallPromptEvent;
      window.__goalbeamDeferredPrompt = bipEvent;
      setDeferredPrompt(bipEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__goalbeamDeferredPrompt = null;
      setDeferredPrompt(null);
      void prepareOfflineEverything();
    };

    const handleOfflineReady = () => {
      window.__goalbeamPwaOfflineReady = true;
      setOfflineReady(true);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('goalbeam:pwa-offline-ready', handleOfflineReady);
    mediaQuery.addEventListener?.('change', handleMediaChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('goalbeam:pwa-offline-ready', handleOfflineReady);
      mediaQuery.removeEventListener?.('change', handleMediaChange);
    };
  }, [prepareOfflineEverything]);

  const install = useCallback(async () => {
    const promptEvent = deferredPrompt || window.__goalbeamDeferredPrompt;
    if (!promptEvent) return false;

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        window.__goalbeamDeferredPrompt = null;
        setDeferredPrompt(null);
        void prepareOfflineEverything();
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
    return false;
  }, [deferredPrompt, prepareOfflineEverything]);

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    isMobile,
    isInIframe,
    offlineReady,
    isPreparingOffline,
    install,
    prepareOfflineEverything,
  };
}
