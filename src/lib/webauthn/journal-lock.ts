/**
 * WebAuthn platform authenticator (Face ID / Touch ID / Windows Hello)
 * for the Creation Journal biometric lock.
 */

const CREDENTIAL_META_ID = "journal-webauthn-credential";
const LOCK_ENABLED_META_ID = "journal-biometric-lock";
const SESSION_UNLOCK_KEY = "tailor-journal-unlocked";

export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials?.create === "function" &&
    typeof navigator.credentials?.get === "function"
  );
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
      "function"
    ) {
      return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {
    return false;
  }
  return true;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function randomChallenge(): Uint8Array {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge;
}

export type JournalLockRecord = {
  credentialId: string;
  enabled: boolean;
};

export async function loadJournalLockRecord(): Promise<JournalLockRecord> {
  const { db } = await import("@/lib/db");
  const [cred, enabled] = await Promise.all([
    db.meta.get(CREDENTIAL_META_ID),
    db.meta.get(LOCK_ENABLED_META_ID),
  ]);
  return {
    credentialId: cred?.value ?? "",
    enabled: enabled?.value === "1" && Boolean(cred?.value),
  };
}

async function persistMeta(id: string, key: string, value: string) {
  const { db } = await import("@/lib/db");
  await db.meta.put({
    id,
    key,
    value,
    updatedAt: new Date(),
  });
}

export async function registerJournalBiometric(): Promise<string> {
  if (!isWebAuthnSupported()) {
    throw new Error("This browser does not support biometric unlock (WebAuthn).");
  }

  const userId = crypto.getRandomValues(new Uint8Array(16));
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomChallenge() as BufferSource,
      rp: {
        name: "Tailor",
        id: window.location.hostname,
      },
      user: {
        id: userId as BufferSource,
        name: "tailor-creation-journal",
        displayName: "Creation Journal",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Biometric registration was cancelled.");
  }

  const credentialId = bufferToBase64(credential.rawId);
  await persistMeta(CREDENTIAL_META_ID, "credentialId", credentialId);
  await persistMeta(LOCK_ENABLED_META_ID, "enabled", "1");
  markJournalSessionUnlocked();
  return credentialId;
}

export async function authenticateJournalBiometric(): Promise<boolean> {
  const record = await loadJournalLockRecord();
  if (!record.credentialId) {
    throw new Error("No biometric credential is registered for the Journal.");
  }
  if (!isWebAuthnSupported()) {
    throw new Error("Biometric unlock is not available in this browser.");
  }

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomChallenge() as BufferSource,
      allowCredentials: [
        {
          id: base64ToBuffer(record.credentialId) as BufferSource,
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "required",
      timeout: 60_000,
    },
  });

  if (!assertion) {
    throw new Error("Biometric unlock was cancelled.");
  }

  markJournalSessionUnlocked();
  return true;
}

export async function disableJournalBiometric(): Promise<void> {
  await persistMeta(LOCK_ENABLED_META_ID, "enabled", "0");
  clearJournalSessionUnlock();
}

export function isJournalSessionUnlocked(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function markJournalSessionUnlocked(): void {
  try {
    sessionStorage.setItem(SESSION_UNLOCK_KEY, "1");
  } catch {
    // private mode
  }
}

export function clearJournalSessionUnlock(): void {
  try {
    sessionStorage.removeItem(SESSION_UNLOCK_KEY);
  } catch {
    // private mode
  }
}

export function journalLockErrorMessage(error: unknown): string {
  if (!(error instanceof Error) && !(error instanceof DOMException)) {
    return "Biometric unlock failed. Try again.";
  }
  const name = "name" in error ? String(error.name) : "";
  if (name === "NotAllowedError") {
    return "Biometric prompt was dismissed or blocked. Try again.";
  }
  if (name === "InvalidStateError") {
    return "A biometric credential already exists for this device. Try unlocking instead.";
  }
  if (name === "SecurityError") {
    return "Biometrics require a secure context (HTTPS or localhost).";
  }
  return error.message || "Biometric unlock failed.";
}
