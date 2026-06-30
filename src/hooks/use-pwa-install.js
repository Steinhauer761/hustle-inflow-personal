import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        // They installed it
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      // Fallback for iOS and other browsers
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        toast.info("To install the app: Tap the Share button at the bottom of your screen, then tap 'Add to Home Screen'.", {
          duration: 8000,
        });
      } else {
        toast.info("Your browser might not support direct installation, or the app is already installed on your device.");
      }
    }
  };

  return { isInstallable, promptInstall };
}