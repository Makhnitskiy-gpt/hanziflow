/**
 * HanziFlow — Database seeding
 *
 * Imports static JSON data (radicals, HSK1 characters)
 * and writes default settings. SRS cards are NOT created
 * at seed time — the user adds items to review explicitly.
 *
 * DATA_VERSION tracks content updates. When the bundled data
 * changes (e.g. 50 → 214 radicals), bumping this number
 * triggers an automatic re-seed on next app load, preserving
 * user settings (theme, seenExplainers) and SRS cards.
 */

import type { Radical, Character, AppSettings } from '@/types';
import type { default as DBType } from '@/db';

/** Bump this whenever radicals.json / hsk1.json content changes */
const DATA_VERSION = 2;

const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  sessionMinutes: 30,
  cardsPerSession: 20,
  theme: 'light',
  seenExplainers: [],
  seeded: true,
};

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

/**
 * Seeds the database with radical and HSK1 character data.
 * Re-seeds automatically when DATA_VERSION is bumped (preserving user prefs).
 */
export async function seedDatabase(db: typeof DBType): Promise<void> {
  const existing = await db.settings.get(1);

  // Already seeded with the current data version — nothing to do
  if (existing?.seeded && (existing as AppSettings & { dataVersion?: number }).dataVersion === DATA_VERSION) {
    return;
  }

  // Dynamic imports so the JSON is code-split by Vite
  const [radicalsModule, hsk1Module] = await Promise.all([
    import('@/data/radicals.json'),
    import('@/data/hsk1.json'),
  ]);

  const radicals: Radical[] = radicalsModule.default;
  const characters: Character[] = hsk1Module.default;

  // Preserve user preferences if they exist
  const preservedSettings: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...(existing ? {
      theme: existing.theme,
      seenExplainers: existing.seenExplainers,
      sessionMinutes: existing.sessionMinutes,
      cardsPerSession: existing.cardsPerSession,
    } : {}),
  };

  await db.transaction(
    'rw',
    [db.radicals, db.characters, db.cards, db.settings],
    async () => {
      // Replace content data (SRS cards are untouched)
      await db.radicals.clear();
      await db.characters.clear();
      await db.radicals.bulkAdd(radicals);
      await db.characters.bulkAdd(characters);

      // Write settings with data version marker
      await db.settings.put({
        ...preservedSettings,
        dataVersion: DATA_VERSION,
      } as AppSettings & { dataVersion: number });
    },
  );
}
