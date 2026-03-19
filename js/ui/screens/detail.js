/**
 * Detail Screen — View a saved inspection record
 */

import * as repo from '../../storage/repository.js';
import { CHECKLIST_ITEMS, ANSWER_LABELS, RESULT_LABELS } from '../../config/checklist-config.js';
import { formatDateTime } from '../../utils/date-utils.js';
import { navigate } from '../router.js';

export async function renderDetail(container, params) {
  const id = Number(params.id);
  if (!id) { navigate('history'); return; }

  const ins = await repo.getInspectionById(id);
  if (!ins) { navigate('history'); return; }

  const resultClass = ins.overall_result === 'pass' ? 'text-pass' : ins.overall_result === 'fail' ? 'text-fail' : 'text-warn';
  const resultIcon = ins.overall_result === 'pass' ? '✅' : ins.overall_result === 'fail' ? '❌' : '⚠️';

  container.innerHTML = `
    <div class="screen">
      <div class="app-header">
        <button class="app-header__back" id="btn-back">←</button>
        <div class="app-header__title">รายละเอียดการตรวจ</div>
      </div>

      <!-- Result Banner -->
      <div class="detail-result">
        <div class="detail-result__icon">${resultIcon}</div>
        <div class="detail-result__text ${resultClass}">${RESULT_LABELS[ins.overall_result] || '-'}</div>
      </div>

      <!-- Info -->
      <div class="card">
        <div class="info-row">
          <span class="info-row__label">รหัสการตรวจ</span>
          <span class="info-row__value mono">${ins.inspection_id}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">รหัสถัง</span>
          <span class="info-row__value mono">${ins.extinguisher_code}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">วันที่ตรวจ</span>
          <span class="info-row__value">${formatDateTime(ins.inspection_date_time)}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">ผู้ตรวจ</span>
          <span class="info-row__value">${ins.inspector_name}</span>
        </div>
        <div class="info-row">
          <span class="info-row__label">ตำแหน่ง</span>
          <span class="info-row__value">${ins.location_snapshot}</span>
        </div>
      </div>

      <!-- Checklist Results -->
      <div class="section-title">ผลตรวจรายการ</div>
      <div class="card card-compact">
        <div class="detail-checklist">
          ${(() => {
            let html = '';
            let lastCat = null;
            for (const item of CHECKLIST_ITEMS) {
              if (item.category && item.category !== lastCat) {
                lastCat = item.category;
                html += `<div style="font-size:var(--text-xs);font-weight:600;color:var(--color-primary);letter-spacing:0.04em;margin-top:${html ? '12px' : '0'};margin-bottom:4px;padding-top:${html ? '8px' : '0'};${html ? 'border-top:1px solid var(--color-border)' : ''}">${item.category}</div>`;
              }
              const answer = ins.checklist_answers?.[item.id];
              const statusClass = answer === 'pass' ? 'pass' : answer === 'fail' ? 'fail' : 'na';
              const icon = answer === 'pass' ? '✓' : answer === 'fail' ? '✗' : '–';
              html += `<div class="detail-check-item"><div class="detail-check-item__status ${statusClass}">${icon}</div><div class="detail-check-item__label">${item.label}</div></div>`;
            }
            return html;
          })()}
        </div>
      </div>

      <!-- Photos (placeholder) -->
      ${ins.photos && ins.photos.length > 0 ? `
        <div class="section-title">📷 รูปถ่ายหลักฐาน</div>
        <div class="card card-compact">
          <div style="color:var(--color-text-3); font-size:var(--text-sm)">${ins.photos.length} รูป (แสดงภาพเร็วๆ นี้)</div>
        </div>
      ` : ''}

      <!-- Remarks -->
      ${ins.remarks ? `
        <div class="section-title">หมายเหตุ</div>
        <div class="card card-compact">
          <p style="font-size:var(--text-sm); color:var(--color-text); white-space:pre-wrap">${ins.remarks}</p>
        </div>
      ` : ''}

      <!-- Actions -->
      <div class="flex flex-col gap-sm mt-2xl" style="padding-bottom:var(--space-xl)">
        <button class="btn btn-outline btn-block" id="btn-history">
          📋 ดูประวัติถังนี้
        </button>
        <button class="btn btn-primary btn-block" id="btn-reinspect">
          🔄 ตรวจถังนี้อีกครั้ง
        </button>
      </div>
    </div>
  `;

  // Events
  container.querySelector('#btn-back').addEventListener('click', () => history.back());
  container.querySelector('#btn-history').addEventListener('click', () => {
    navigate(`history?code=${encodeURIComponent(ins.extinguisher_code)}`);
  });
  container.querySelector('#btn-reinspect').addEventListener('click', () => {
    navigate(`inspect?code=${encodeURIComponent(ins.extinguisher_code)}`);
  });
}
