/**
 * Search Screen
 * Supports keyboard wedge scanner input and manual search.
 */

import * as repo from '../../storage/repository.js';
import { getCurrentMonth } from '../../utils/date-utils.js';
import { RESULT_LABELS } from '../../config/checklist-config.js';
import { navigate } from '../router.js';

export async function renderSearch(container) {
  container.innerHTML = `
    <div class="screen">
      <div class="app-header">
        <button class="app-header__back" id="btn-back">←</button>
        <div class="app-header__title">ค้นหาถังดับเพลิง</div>
      </div>

      <div class="section-title" style="margin-top:0">สแกนหรือค้นหารหัสถัง</div>

      <div class="input-group">
        <span class="input-group__icon">🔍</span>
        <input type="text" id="search-input" class="input input-with-icon input-mono"
               placeholder="สแกนหรือพิมพ์รหัส..."
               autocomplete="off" autocorrect="off" autocapitalize="off"
               spellcheck="false" enterkeyhint="search">
      </div>

      <div class="search-hint">
        <span>📱</span> สแกนบาร์โค้ดหรือพิมพ์รหัสถัง
      </div>

      <div class="search-or">หรือ</div>

      <button class="btn btn-outline btn-block" id="btn-show-all">
        แสดงถังทั้งหมด
      </button>

      <div id="search-results" class="search-results"></div>
    </div>
  `;

  const input = container.querySelector('#search-input');
  const resultsDiv = container.querySelector('#search-results');
  let debounceTimer = null;

  // Auto-focus for scanner input
  setTimeout(() => input.focus(), 100);

  // Handle barcode scanner (keyboard wedge) — typically sends fast chars + Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.trim();
      if (val) handleExactMatch(val);
    }
  });

  // Debounced search as user types
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(input.value), 300);
  });

  // Show all button
  container.querySelector('#btn-show-all').addEventListener('click', () => {
    input.value = '';
    performSearch('');
  });

  // Back
  container.querySelector('#btn-back').addEventListener('click', () => navigate('home'));

  async function handleExactMatch(code) {
    const ext = await repo.getExtinguisherByCode(code);
    if (ext) {
      navigate(`inspect?code=${encodeURIComponent(ext.extinguisher_code)}`);
    } else {
      performSearch(code);
    }
  }

  async function performSearch(query) {
    const results = await repo.searchExtinguishers(query);
    const month = getCurrentMonth();

    if (results.length === 0) {
      resultsDiv.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <div class="empty-state__text">ไม่พบถังดับเพลิง${query ? ` "${query}"` : ''}</div>
        </div>
      `;
      return;
    }

    // Get inspection status for current month
    const inspections = await repo.getInspectionsByMonth(month);
    const inspectedCodes = new Set();
    const resultMap = {};
    for (const ins of inspections) {
      inspectedCodes.add(ins.extinguisher_code);
      resultMap[ins.extinguisher_code] = ins.overall_result;
    }

    resultsDiv.innerHTML = results.map(ext => {
      const inspected = inspectedCodes.has(ext.extinguisher_code);
      const result = resultMap[ext.extinguisher_code];
      let badgeHtml = '';
      if (inspected) {
        const cls = result === 'pass' ? 'badge-pass' : result === 'fail' ? 'badge-fail' : 'badge-warn';
        badgeHtml = `<span class="badge ${cls}">${RESULT_LABELS[result] || result}</span>`;
      } else {
        badgeHtml = `<span class="badge badge-neutral">ยังไม่ตรวจ</span>`;
      }

      return `
        <div class="list-item" data-code="${ext.extinguisher_code}">
          <div class="list-item__icon" style="background:var(--color-primary-glow); color:var(--color-primary)">🧯</div>
          <div class="list-item__body">
            <div class="list-item__title mono">${ext.extinguisher_code}</div>
            <div class="list-item__sub">${ext.location}</div>
            <div style="margin-top:4px">${badgeHtml}</div>
          </div>
          <div class="list-item__arrow">→</div>
        </div>
      `;
    }).join('');

    resultsDiv.querySelectorAll('.list-item').forEach(el => {
      el.addEventListener('click', () => {
        navigate(`inspect?code=${encodeURIComponent(el.dataset.code)}`);
      });
    });
  }
}
