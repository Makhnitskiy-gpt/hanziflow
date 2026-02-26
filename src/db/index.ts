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
  Mnemonic,
  StudySession,
  AppSettings,
  ChatMessage,
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

export { db };
export default db;
