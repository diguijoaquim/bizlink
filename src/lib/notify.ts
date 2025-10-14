export function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!canNotify()) return false;
  try {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export function showNotification(title: string, options?: NotificationOptions & { onClickUrl?: string }) {
  if (!canNotify() || Notification.permission !== 'granted') return false;
  try {
    const n = new Notification(title, options);
    if (options?.onClickUrl) {
      n.onclick = () => {
        try { window.focus(); } catch {}
        window.location.href = options.onClickUrl!;
      };
    }
    return true;
  } catch {
    return false;
  }
}
