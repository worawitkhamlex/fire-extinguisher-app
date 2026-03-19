/**
 * App Entry Point
 * ---------------
 * Initializes storage, registers routes, sets up navigation.
 */

import { openDB } from './storage/db.js';
import { seedData } from './services/seed-service.js';
import { registerRoute, initRouter, navigate } from './ui/router.js';

// Screen imports
import { renderHome } from './ui/screens/home.js';
import { renderSearch } from './ui/screens/search.js';
import { renderInspect } from './ui/screens/inspect.js';
import { renderDashboard } from './ui/screens/dashboard.js';
import { renderHistory } from './ui/screens/history.js';
import { renderDetail } from './ui/screens/detail.js';
import { renderSettings } from './ui/screens/settings.js';

// ─── Init ───

async function init() {
  try {
    // Initialize database
    await openDB();

    // Seed sample data on first run
    await seedData();

    // Register routes
    registerRoute('home', renderHome);
    registerRoute('search', renderSearch);
    registerRoute('inspect', renderInspect);
    registerRoute('dashboard', renderDashboard);
    registerRoute('history', renderHistory);
    registerRoute('detail', renderDetail);
    registerRoute('settings', renderSettings);

    // Initialize router
    const appContainer = document.getElementById('app');
    initRouter(appContainer);

    // Setup bottom nav
    setupNav();

    // Register service worker
    registerSW();

  } catch (err) {
    console.error('App init failed:', err);
    document.getElementById('app').innerHTML = `
      <div class="screen" style="text-align:center; padding-top:40%">
        <h2>เกิดข้อผิดพลาด</h2>
        <p style="color:var(--color-text-3); margin-top:8px">${err.message}</p>
        <button class="btn btn-outline mt-xl" onclick="location.reload()">ลองใหม่</button>
      </div>
    `;
  }
}

function setupNav() {
  document.querySelectorAll('.bottom-nav__item').forEach(btn => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      if (route) navigate(route);
    });
  });
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
