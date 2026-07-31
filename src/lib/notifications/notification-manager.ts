/**
 * Local (no-server) Notification helpers for the atelier PWA.
 * Welcome push fires once after the First-Time Onboarding Gateway.
 */

const WELCOME_SENT_KEY = "tailor-welcome-notification-sent";
const APP_ICON_PATH = "/icons/icon-192x192.png";

const WELCOME_TITLE = "Welcome to the Digital Atelier";
const WELCOME_BODY =
  "Your personal offline studio is ready. Tap to begin.";

function resolveAppIconUrl(): string {
  if (typeof window === "undefined") return APP_ICON_PATH;
  return new URL(APP_ICON_PATH, window.location.origin).href;
}

function markWelcomeSent(): void {
  try {
    localStorage.setItem(WELCOME_SENT_KEY, "1");
  } catch {
    // Private mode / blocked storage — still try to show once this session.
  }
}

function wasWelcomeSent(): boolean {
  try {
    return localStorage.getItem(WELCOME_SENT_KEY) === "1";
  } catch {
    return false;
  }
}

export type LocalNotificationPayload = {
  title: string;
  body: string;
  tag?: string;
};

/**
 * Native notification manager — permission + local `Notification` display.
 * No push server; works offline once permission is granted.
 */
export const NotificationManager = {
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  },

  permission(): NotificationPermission | "unsupported" {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission;
  },

  /**
   * Request notification permission. Must run from a user gesture
   * (e.g. onboarding "Enter Atelier" tap) for browsers to accept it.
   */
  async requestPermission(): Promise<NotificationPermission | "unsupported"> {
    if (!this.isSupported()) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  },

  /**
   * Fire a local native notification with the atelier icon.
   * Prefers `new Notification()`; falls back to the active service worker
   * `showNotification` when the page constructor is blocked.
   */
  async showLocal(
    payload: LocalNotificationPayload,
  ): Promise<Notification | null> {
    if (!this.isSupported()) return null;
    if (Notification.permission !== "granted") return null;

    const icon = resolveAppIconUrl();
    const options: NotificationOptions = {
      body: payload.body,
      icon,
      badge: icon,
      tag: payload.tag,
      silent: false,
    };

    try {
      const notification = new Notification(payload.title, options);
      notification.onclick = () => {
        try {
          window.focus();
        } catch {
          // ignore
        }
        notification.close();
      };
      return notification;
    } catch {
      // Android / locked-down contexts often require SW-backed display.
      if (!("serviceWorker" in navigator)) return null;
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return null;
        await registration.showNotification(payload.title, options);
        return null;
      } catch {
        return null;
      }
    }
  },

  /**
   * First-time onboarding welcome — request permission, then notify once.
   */
  async welcomeAfterOnboarding(): Promise<void> {
    if (typeof window === "undefined") return;
    if (wasWelcomeSent()) return;

    const permission = await this.requestPermission();
    if (permission !== "granted") return;

    await this.showLocal({
      title: WELCOME_TITLE,
      body: WELCOME_BODY,
      tag: "atelier-welcome",
    });
    markWelcomeSent();
  },
};
