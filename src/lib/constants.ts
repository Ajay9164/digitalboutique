export const APP_NAME = "Tailor";
export const APP_DESCRIPTION =
  "A premium offline-first atelier workspace for measurements, studio work, drafts, and journaling.";
export const APP_DEFAULT_TITLE = "Tailor";
export const APP_TITLE_TEMPLATE = "%s · Tailor";

export const NAV_ITEMS = [
  {
    href: "/",
    label: "Journey",
    shortLabel: "Journey",
  },
  {
    href: "/measurements",
    label: "Measurements",
    shortLabel: "Measure",
  },
  {
    href: "/studio",
    label: "Studio",
    shortLabel: "Studio",
  },
  {
    href: "/drafts",
    label: "Drafts",
    shortLabel: "Drafts",
  },
  {
    href: "/journal",
    label: "Journal",
    shortLabel: "Journal",
  },
] as const;

export type NavHref = (typeof NAV_ITEMS)[number]["href"];
