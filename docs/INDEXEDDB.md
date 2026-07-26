# IndexedDB migrations

Database name: `tailor`  
Current schema: **v9** (`DB_SCHEMA_VERSION` in `src/lib/db/index.ts`)

## Version history

| Version | Change |
|---------|--------|
| 1 | `meta` |
| 2 | `learning` |
| 3 | `draftLearning` |
| 4 | `studioPhotos` |
| 5 | `projects` |
| 6 | Learning ecosystem tables |
| 7 | Profile backfill, photo cleanup, schema meta stamp |
| 8 | Guided Learning Mode: `journeyProgress`, `journeyLessons` |
| 9 | Studio photos: optional `opfsKey`; full JPEG binaries prefer OPFS (`fabric-captures/`), IndexedDB keeps thumbnails |

## Rules

1. **Never remove** older `.version(n)` declarations — Dexie upgrades in order.
2. Prefer **additive** store/index changes.
3. Use `.upgrade(async (tx) => { … })` for data transforms and backfills.
4. Bump `DB_SCHEMA_VERSION` and document the change here.
5. High-res fabric captures use the Origin Private File System when available; IndexedDB stores metadata + thumbnails (legacy rows may still hold full data URLs until lazy migrate).

## Testing upgrades

1. Install an older build, create sample data.
2. Deploy / run the new build.
3. Confirm profile exists, photos still load (OPFS or legacy data URL), Learn hub hydrates.
