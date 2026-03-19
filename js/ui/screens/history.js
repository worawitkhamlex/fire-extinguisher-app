/**
 * History Screen
 */

import * as repo from '../../storage/repository.js';
import { getCurrentMonth, formatMonth, formatDateTime, prevMonth, nextMonth } from '../../utils/date-utils.js';
import { RESULT_LABELS } from '../../config/checklist-config.js';
import { navigate } from '../router.js';

let selectedMonth = getCurrentMonth();

export async function renderHistory(container, params) {
  if (params && params.code) {
    await renderByCode(container, params.code);
  } else {
    await renderByMonth(container);
  }
}

async function renderByMonth(container) {
  const inspections = await repo.getInspectionsByMonth(selectedMonth);
  inspections.sort((a, b) => new Date(b.inspection_date_time) - new Date(a.inspection_date_time));

  container.innerHTML = `
    <div class="screen">
      <div class="app-header">
        <div class="app-header__title">📋 ประวัติการตรวจ</div>
      </div>

      <div class="month-picker history-filter">
        <button class="month-picker__btn" id="btn-prev">‹</button>
        <span class="month-picker__label">${formatMonth(selectedMonth)}</span>
        <button class="month-picker__btn" id="btn-next">›</button>
      </div>

      <div style="font-size:var(--text-sm); color:var(--color-text-3); margin-bottom:var(--space-md)">
        ทั้งหมด ${inspections.length} รายการ
      </div>

      ${inspections.length > 0 ? inspections.map(ins => {
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
          <div class="empty-state__text">ไม่มีข้อมูลการตรวจในเดือนนี้</div>
        </div>
      `}
    </div>
  `;

  container.querySelector('#btn-prev').addEventListener('click', () => {
    selectedMonth = prevMonth(selectedMonth);
    renderByMonth(container);
  });
  container.querySelector('#btn-next').addEventListener('click', () => {
    selectedMonth = nextMonth(selectedMonth);
    renderByMonth(container);
  });

  container.querySelectorAll('.list-item[data-id]').forEach(el => {
    el.addEventListener('click', () => navigate(`detail?id=${el.dataset.id}`));
  });
}

async function renderByCode(container, code) {
  const ext = await repo.getExtinguisherByCode(code);
  const inspections = await repo.getInspectionsByCode(code);
  inspections.sort((a, b) => new Date(b.inspection_date_time) - new Date(a.inspection_date_time));

  container.innerHTML = `
    <div class="screen">
      <div class="app-header">
        <button class="app-header__back" id="btn-back">←</button>
        <div class="app-header__title">ประวัติ ${code}</div>
      </div>

      ${ext ? `
        <div class="ext-info-card mb-lg">
          <div class="ext-info-card__code">${ext.extinguisher_code}</div>
          <div class="ext-info-card__loc">📍 ${ext.location}</div>
        </div>
      ` : ''}

      <div style="font-size:var(--text-sm); color:var(--color-text-3); margin-bottom:var(--space-md)">
        ทั้งหมด ${inspections.length} ครั้ง
      </div>

      ${inspections.length > 0 ? inspections.map(ins => {
        const cls = ins.overall_result === 'pass' ? 'badge-pass' : ins.overall_result === 'fail' ? 'badge-fail' : 'badge-warn';
        return `
          <div class="list-item" data-id="${ins.id}">
            <div class="list-item__body">
              <div class="list-item__title">${formatDateTime(ins.inspection_date_time)}</div>
              <div class="list-item__sub">${ins.inspector_name} · ${ins.inspection_id}</div>
            </div>
            <span class="badge ${cls}">${RESULT_LABELS[ins.overall_result] || ''}</span>
          </div>
        `;
      }).join('') : `
        <div class="empty-state">
          <div class="empty-state__text">ยังไม่มีประวัติการตรวจ</div>
        </div>
      `}
    </div>
  `;

  container.querySelector('#btn-back').addEventListener('click', () => navigate('history'));
  container.querySelectorAll('.list-item[data-id]').forEach(el => {
    el.addEventListener('click', () => navigate(`detail?id=${el.dataset.id}`));
  });
}
