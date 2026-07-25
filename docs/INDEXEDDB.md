# IndexedDB migrations

Database name: `tailor`  
Current schema: **v8** (`DB_SCHEMA_VERSION` in `src/lib/db/index.ts`)

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

## Rules

1. **Never remove** older `.version(n)` declarations — Dexie upgrades in order.
2. Prefer **additive** store/index changes.
3. Use `.upgrade(async (tx) => { … })` for data transforms and backfills.
4. Bump `DB_SCHEMA_VERSION` and document the change here.
5. Large images currently store as JPEG **data URLs**; future versions may migrate to Blobs for quota.

## Testing upgrades

1. Install an older build, create sample data.
2. Deploy / run the new build.
3. Confirm profile exists, photos still load, Learn hub hydrates.
