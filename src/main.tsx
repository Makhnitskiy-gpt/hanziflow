import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { db } from '@/db';
import { seedDatabase } from '@/db/seed';
import '@/styles/globals.css';

// Seed database on first load — delegates to db/seed.ts which also creates SRS cards
async function seedIfNeeded() {
  try {
    await seedDatabase(db);
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
}

// Register service worker for PWA
async function registerSW() {
  try {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({
      onNeedRefresh() {
        // Could show a toast/prompt here
        console.log('New content available, refresh to update.');
      },
      onOfflineReady() {
        console.log('App ready for offline use.');
      },
    });
  } catch {
    // PWA plugin may not be available in dev
  }
}

// Initialize
seedIfNeeded().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  registerSW();
});
