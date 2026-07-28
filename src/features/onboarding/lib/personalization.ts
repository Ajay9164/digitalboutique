/**
 * Hydration-safe display helpers for the persisted atelier user profile.
 * Always pair with a client `mounted` check before showing `userName`.
 */

export function atelierBrandLabel(userName: string | null | undefined): string {
  const name = userName?.trim();
  if (!name) return "Atelier";
  return `${name}'s Atelier`;
}

export function atelierWelcomeLabel(userName: string | null | undefined): string {
  const name = userName?.trim();
  if (!name) return "Welcome back";
  return `Welcome back, ${name}`;
}

export function masteryCongratsLabel(userName: string | null | undefined): string {
  const name = userName?.trim();
  if (!name) return "Brilliant work!";
  return `Brilliant work, ${name}!`;
}
