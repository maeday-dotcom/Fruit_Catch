let wakeLock: WakeLockSentinel | null = null;

export const isWakeLockSupported = 'wakeLock' in navigator;

export async function requestWakeLock(): Promise<void> {
  if (!isWakeLockSupported) {
    console.warn('Wake Lock API is not supported on this browser.');
    return;
  }
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
  } catch (error) {
    console.warn('Failed to acquire wake lock:', error);
  }
}

export function releaseWakeLock(): void {
  wakeLock?.release();
  wakeLock = null;
}

/** Re-acquires the wake lock after it is dropped by a tab switch (spec section 11: iPadOS version-dependent support). */
export function setupWakeLockReacquire(): void {
  document.addEventListener('visibilitychange', () => {
    if (wakeLock === null && document.visibilityState === 'visible') {
      void requestWakeLock();
    }
  });
}
