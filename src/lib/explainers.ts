/**
 * HanziFlow — Explainer display logic
 *
 * One-time educational overlays shown the first time a user
 * encounters a particular concept or screen.
 */

import type { AppSettings } from '@/types';
import type { default as DBType } from '@/db';

// ---------------------------------------------------------------------------
// Explainer keys — exhaustive list of all explainers in the app
// ---------------------------------------------------------------------------

export type ExplainerKey =
  | 'radicals'
  | 'tones'
  | 'strokes'
  | 'srs'
  | 'mnemonic_drawing'
  | 'character_formation'
  | 'review_session'
  | 'ai_chat';

// ---------------------------------------------------------------------------
// Screen → Explainer mapping
// ---------------------------------------------------------------------------

interface ExplainerContext {
  screen: string;
  itemType?: string;
  hasTone?: boolean;
  isFirstStrokePractice?: boolean;
  isFirstMnemonic?: boolean;
}

const SCREEN_EXPLAINERS: Record<string, ExplainerKey> = {
  radicals: 'radicals',
  review: 'review_session',
  'ai-chat': 'ai_chat',
};

/**
 * Determines which explainer (if any) should be shown for the current context.
 * Returns null if no explainer is relevant or if the user has already seen it.
 */
export function getExplainerForContext(
  context: ExplainerContext,
): ExplainerKey | null {
  // Contextual triggers (more specific first)
  if (context.isFirstMnemonic) return 'mnemonic_drawing';
  if (context.isFirstStrokePractice) return 'strokes';
  if (context.hasTone) return 'tones';
  if (context.itemType === 'character') return 'character_formation';

  // Screen-level triggers
  return SCREEN_EXPLAINERS[context.screen] ?? null;
}

// ---------------------------------------------------------------------------
// Seen-state management
// ---------------------------------------------------------------------------

/**
 * Returns true if the user has NOT yet seen the given explainer.
 */
export function shouldShowExplainer(
  key: ExplainerKey,
  settings: AppSettings,
): boolean {
  return !settings.seenExplainers.includes(key);
}

/**
 * Marks an explainer as seen by updating the settings record in the DB.
 * Idempotent — safe to call multiple times with the same key.
 */
export async function markExplainerSeen(
  db: typeof DBType,
  key: ExplainerKey,
): Promise<void> {
  const settings = await db.settings.get(1);
  if (!settings) return;

  if (settings.seenExplainers.includes(key)) return;

  await db.settings.update(1, {
    seenExplainers: [...settings.seenExplainers, key],
  });
}

/**
 * Convenience: check context + settings in one call.
 * Returns the explainer key to show, or null.
 */
export function resolveExplainer(
  context: ExplainerContext,
  settings: AppSettings,
): ExplainerKey | null {
  const key = getExplainerForContext(context);
  if (key === null) return null;
  return shouldShowExplainer(key, settings) ? key : null;
}
