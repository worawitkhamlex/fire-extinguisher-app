/**
 * Home Screen
 */

import * as repo from '../../storage/repository.js';
import { getCurrentMonth, formatMonth } from '../../utils/date-utils.js';
import { navigate } from '../router.js';

export async function renderHome(container) {
  const month = getCurrentMonth();
  const stats = await repo.getDashboardStats(month);
  const pct = stats.total > 0 ? Math.round((stats.inspected / stats.total) * 100) : 0;

  container.innerHTML = `
    <div class="screen">
      <div class="home-hero">
        <div class="home-hero__icon">🧯</div>
        <h1 class="home-hero__title">ตรวจถังดับเพลิง</h1>
        <p class="home-hero__sub">${formatMonth(month)}</p>
      </div>

      <div class="home-cta">
        <button class="btn btn-primary btn-lg btn-block" id="btn-start">
          <span>🔍</span> เริ่มตรวจ
        </button>
      </div>

      <div class="home-quick-stats">
        <div class="stat-card">
          <div class="stat-card__value text-primary">${stats.inspected}/${stats.total}</div>
          <div class="stat-card__label">ตรวจแล้ว</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value" style="color:var(--color-text)">${pct}%</div>
          <div class="stat-card__label">ความคืบหน้า</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value text-fail">${stats.failed}</div>
          <div class="stat-card__label">ไม่ผ่าน</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value text-warn">${stats.needsAction}</div>
          <div class="stat-card__label">ต้องแก้ไข</div>
        </div>
      </div>

      ${stats.notInspected > 0 ? `
        <div class="card mt-2xl" style="text-align:center; cursor:pointer" id="btn-continue">
          <div style="font-size:var(--text-sm); color:var(--color-text-3)">ยังเหลืออีก</div>
          <div style="font-size:var(--text-2xl); font-weight:700; color:var(--color-primary); margin:4px 0">${stats.notInspected} ถัง</div>
          <div style="font-size:var(--text-sm); color:var(--color-text-3)">แตะเพื่อตรวจต่อ →</div>
        </div>
      ` : `
        <div class="card mt-2xl" style="text-align:center">
          <div style="font-size:1.5rem; margin-bottom:4px">✅</div>
          <div style="font-size:var(--text-base); font-weight:600; color:var(--color-pass)">ตรวจครบทุกถังแล้ว!</div>
        </div>
      `}
    </div>
  `;

  // Events
  container.querySelector('#btn-start').addEventListener('click', () => navigate('search'));
  const btnContinue = container.querySelector('#btn-continue');
  if (btnContinue) btnContinue.addEventListener('click', () => navigate('search'));
}
