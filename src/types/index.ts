/**
 * HanziFlow — Core TypeScript types
 *
 * All domain types for radicals, characters, SRS cards,
 * study sessions, mnemonics, settings, and AI chat.
 */

import type { State } from 'ts-fsrs';

// ---------------------------------------------------------------------------
// Content items
// ---------------------------------------------------------------------------

/** CJK radical with mnemonic data */
export interface Radical {
  id: number;
  char: string;
  pinyin: string;
  meaning_ru: string;
  meaning_en: string;
  strokes: number;
  examples: string[];
  mnemonic_ru: string;
  category: string;
  /** Simplified/alternate form of the radical */
  variant?: string;
  /** Populated from DB at runtime */
  status?: ItemStatus;
  /** Data-URL of user-drawn mnemonic image */
  mnemonicDataUrl?: string;
}

/** HSK character / word */
export interface Character {
  id: number;
  char: string;
  pinyin: string;
  tone: number;
  meaning_ru: string;
  meaning_en: string;
  hsk_level: number;
  radicals: string[];
  formation_type: string;
  formation_explanation_ru: string;
  examples_ru: string[];
  /** Populated from DB at runtime */
  status?: ItemStatus;
  /** Data-URL of user-drawn mnemonic image */
  mnemonicDataUrl?: string;
}

// ---------------------------------------------------------------------------
// SRS
// ---------------------------------------------------------------------------

export type ItemStatus = 'new' | 'learning' | 'known';
export type ItemType = 'radical' | 'character';
export type CardType = 'recognition' | 'recall';

/** Persisted SRS card — mirrors ts-fsrs Card fields + our metadata */
export interface SRSCard {
  id?: number;
  /** References Radical.id or Character.id */
  itemId: number;
  itemType: ItemType;
  cardType: CardType;
  // ts-fsrs scheduling fields
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  /** 0 = New, 1 = Learning, 2 = Review, 3 = Relearning */
  state: State;
  last_review?: Date;
}

// ---------------------------------------------------------------------------
// Review log (for FSRS calibration)
// ---------------------------------------------------------------------------

export interface ReviewLog {
  id?: number;
  cardId: number;
  rating: 1 | 2 | 3 | 4;
  state: State;
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Study session
// ---------------------------------------------------------------------------

export type SessionPhase = 'review' | 'new' | 'practice' | 'summary';

export interface StudySession {
  id?: number;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  newItemsLearned: number;
  phase: SessionPhase;
}

// ---------------------------------------------------------------------------
// User-drawn mnemonics
// ---------------------------------------------------------------------------

export interface Mnemonic {
  id?: number;
  itemId: number;
  itemType: ItemType;
  /** Canvas snapshot as data-URL (PNG) */
  dataUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// App settings (singleton row in DB)
// ---------------------------------------------------------------------------

export interface AppSettings {
  id?: number;
  sessionMinutes: number;
  cardsPerSession: number;
  theme: 'light' | 'dark';
  seenExplainers: string[];
  /** Flag set after initial data seed */
  seeded?: boolean;
}

// ---------------------------------------------------------------------------
// AI chat
// ---------------------------------------------------------------------------

export interface ChatContext {
  screen: string;
  itemChar?: string;
  itemType?: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  context?: ChatContext;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Aggregate stats returned by lib/fsrs
// ---------------------------------------------------------------------------

export interface SRSStats {
  new: number;
  learning: number;
  review: number;
  known: number;
}

// ---------------------------------------------------------------------------
// Session plan
// ---------------------------------------------------------------------------

export interface SessionPlan {
  reviewCount: number;
  newCount: number;
  totalCards: number;
}

// ---------------------------------------------------------------------------
// Stylus
// ---------------------------------------------------------------------------

export interface StylusPoint {
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
}

export type Stroke = StylusPoint[];
