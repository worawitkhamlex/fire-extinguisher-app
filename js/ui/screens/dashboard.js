/**
 * Dashboard Screen
 */

import * as repo from '../../storage/repository.js';
import { getCurrentMonth, formatMonth, formatDateTime, prevMonth, nextMonth } from '../../utils/date-utils.js';
import { RESULT_LABELS } from '../../config/checklist-config.js';
import { navigate } from '../router.js';

let selectedMonth = getCurrentMonth();

export async function renderDashboard(container) {
  await render(container);
}

async function render(container) {
  const stats = await repo.getDashboardStats(selectedMonth);
  const pct = stats.total > 0 ? Math.round((stats.inspected / stats.total) * 100) : 0;
  const barClass = pct >= 100 ? 'complete' : '';

  // Recent inspections
  const recentIns = await repo.getInspectionsByMonth(selectedMonth);
  recentIns.sort((a, b) => new Date(b.inspection_date_time) - new Date(a.inspection_date_time));
  const recent = recentIns.slice(0, 8);

  container.innerHTML = `
    <div class="screen">
      <div class="app-header">
        <div class="app-header__title">📊 แดชบอร์ด</div>
      </div>

      <!-- Month Picker -->
      <div class="month-picker">
        <button class="month-picker__btn" id="btn-prev-month">‹</button>
        <span class="month-picker__label">${formatMonth(selectedMonth)}</span>
        <button class="month-picker__btn" id="btn-next-month">›</button>
      </div>

      <!-- Progress -->
      <div class="dash-progress mt-xl">
        <div class="dash-progress__text">
          <span>ความคืบหน้า</span>
          <span>${stats.inspected} / ${stats.total} ถัง (${pct}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill ${barClass}" style="width:${pct}%"></div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="dash-stats">
        <div class="stat-card">
          <div class="stat-card__value text-pass">${stats.passed}</div>
          <div class="stat-card__label">ผ่าน</div>
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
        <button class="btn btn-primary btn-block mt-xl" id="btn-inspect-next">
          🔍 ตรวจต่อ (เหลือ ${stats.notInspected} ถัง)
        </button>
      ` : ''}

      <!-- Recent Inspections -->
      <div class="section-title mt-2xl">การตรวจล่าสุด</div>
      ${recent.length > 0 ? recent.map(ins => {
        const cls = ins.overall_result === 'pass' ? 'badge-pass' : ins.overall_result === 'fail' ? 'badge-fail' : 'badge-warn';
        return `
          <div class="list-item" data-id="${ins.id}">
            <div class="list-item__icon" style="background:var(--color-surface-3)">🧯</div>
            <div class="list-item__body">
              <div class="list-item__title mono">${ins.extinguisher_code}</div>
              <div class="list-item__sub">${formatDateTime(ins.inspection_date_time)} · ${ins.inspector_name}</div>
            </div>
            <span class="badge ${cls}">${RESULT_LABELS[ins.overall_result] || ''}</span>
          </div>
        `;
      }).join('') : `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__text">ยังไม่มีการตรวจในเดือนนี้</div>
        </div>
      `}
    </div>
  `;

  // Events
  container.querySelector('#btn-prev-month').addEventListener('click', () => {
    selectedMonth = prevMonth(selectedMonth);
    render(container);
  });
  container.querySelector('#btn-next-month').addEventListener('click', () => {
    selectedMonth = nextMonth(selectedMonth);
    render(container);
  });

  const btnNext = container.querySelector('#btn-inspect-next');
  if (btnNext) btnNext.addEventListener('click', () => navigate('search'));

  container.querySelectorAll('.list-item[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      navigate(`detail?id=${el.dataset.id}`);
    });
  });
}
