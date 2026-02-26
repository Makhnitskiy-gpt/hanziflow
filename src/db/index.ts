/**
 * HanziFlow — Dexie database definition
 *
 * Tables: radicals, characters, cards, mnemonics, sessions, settings, chatMessages
 * Uses Dexie v4 with EntityTable typing.
 */

import Dexie from 'dexie';
import type { EntityTable } from 'dexie';
import type {
  Radical,
  Character,
  SRSCard,
  ReviewLog,
  Mnemonic,
  StudySession,
  AppSettings,
  ChatMessage,
  LessonProgress,
} from '@/types';

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

const db = new Dexie('HanziFlowDB') as Dexie & {
  radicals: EntityTable<Radical, 'id'>;
  characters: EntityTable<Character, 'id'>;
  cards: EntityTable<SRSCard, 'id'>;
  mnemonics: EntityTable<Mnemonic, 'id'>;
  sessions: EntityTable<StudySession, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
  chatMessages: EntityTable<ChatMessage, 'id'>;
  reviewLogs: EntityTable<ReviewLog, 'id'>;
  lessonProgress: EntityTable<LessonProgress, 'lessonId'>;
};

db.version(1).stores({
  radicals: 'id, char, category, status',
  characters: 'id, char, hsk_level, status, pinyin',
  cards: '++id, itemId, itemType, cardType, due, state, [itemType+itemId]',
  mnemonics: '++id, [itemType+itemId], createdAt',
  sessions: '++id, startTime',
  settings: '++id',
  chatMessages: '++id, timestamp',
});

// v2: Remove phantom 'status' indexes — status is computed at runtime from SRS cards
db.version(2).stores({
  radicals: 'id, char, category',
  characters: 'id, char, hsk_level, pinyin',
});

// v3: Add review log table for FSRS calibration + cardType index
db.version(3).stores({
  cards: '++id, itemId, itemType, cardType, due, state, [itemType+itemId], [cardType+state]',
  reviewLogs: '++id, cardId, timestamp',
});

// v4: Learning path progress
db.version(4).stores({
  lessonProgress: '&lessonId, status, completedAt',
});

export { db };
export default db;
