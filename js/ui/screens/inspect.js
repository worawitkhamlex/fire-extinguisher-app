/**
 * Inspect Screen
 * Config-driven checklist form for monthly fire extinguisher inspection.
 */

import * as repo from '../../storage/repository.js';
import { CHECKLIST_ITEMS, ANSWER_LABELS, RESULT_LABELS } from '../../config/checklist-config.js';
import { createBlankInspection, saveInspection, validateInspection, suggestOverallResult } from '../../services/inspection-service.js';
import { formatDate } from '../../utils/date-utils.js';
import { navigate } from '../router.js';
import { showToast } from '../../utils/toast.js';

let currentRecord = null;

export async function renderInspect(container, params) {
  const code = params.code;
  if (!code) { navigate('search'); return; }

  const ext = await repo.getExtinguisherByCode(code);
  if (!ext) {
    showToast('ไม่พบถังดับเพลิง', 'error');
    navigate('search');
    return;
  }

  // Get saved inspector name
  const savedName = await repo.getSetting('inspector_name') || '';

  // Create blank inspection
  currentRecord = createBlankInspection(ext, savedName);

  renderForm(container, ext);
}

function renderForm(container, ext) {
  const r = currentRecord;

  container.innerHTML = `
    <div class="screen">
      <div class="app-header">
        <button class="app-header__back" id="btn-back">←</button>
        <div class="app-header__title">ตรวจสภาพถังดับเพลิง</div>
      </div>

      <!-- Extinguisher Info Card -->
      <div class="ext-info-card">
        <div class="ext-info-card__code">${ext.extinguisher_code}</div>
        <div class="ext-info-card__loc">📍 ${ext.location}</div>
        <div class="ext-info-card__meta">
          <span class="badge badge-info">${ext.extinguisher_type}</span>
          <span class="badge badge-neutral">${ext.size}</span>
          <span class="badge badge-neutral">${ext.department}</span>
        </div>
      </div>

      <!-- Inspector Name -->
      <div class="inspect-section">
        <div class="section-title">ผู้ตรวจ</div>
        <div class="inspector-input">
          <span class="inspector-input__label">👤</span>
          <input type="text" id="inspector-name" placeholder="ชื่อผู้ตรวจ"
                 value="${r.inspector_name}" autocomplete="name">
        </div>
      </div>

      <!-- Checklist -->
      <div class="inspect-section">
        <div class="section-title">รายการตรวจ <span id="checklist-progress" style="color:var(--color-primary)"></span></div>
        <div class="checklist-group" id="checklist-container">
          ${renderChecklistWithCategories(r.checklist_answers)}
        </div>
      </div>

      <!-- Pass All / Fail All shortcuts -->
      <div class="flex gap-sm mt-lg">
        <button class="btn btn-outline btn-sm flex-1" id="btn-pass-all">✓ ผ่านทั้งหมด</button>
        <button class="btn btn-outline btn-sm flex-1" id="btn-clear-all">↺ ล้างทั้งหมด</button>
      </div>

      <!-- Photo Section (placeholder for future camera feature) -->
      <div class="inspect-section">
        <div class="section-title">📷 รูปถ่ายหลักฐาน</div>
        <div class="photo-section" id="photo-placeholder">
          <div class="photo-section__icon">📷</div>
          <div class="photo-section__text">แตะเพื่อถ่ายรูป (เร็วๆ นี้)</div>
        </div>
      </div>

      <!-- Remarks -->
      <div class="inspect-section">
        <div class="section-title">หมายเหตุ</div>
        <textarea class="input" id="remarks" placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" rows="3">${r.remarks}</textarea>
      </div>

      <!-- Overall Result -->
      <div class="inspect-section">
        <div class="section-title">ผลสรุปการตรวจ</div>
        <div class="result-selector" id="result-selector">
          <button class="result-btn ${r.overall_result === 'pass' ? 'selected-pass' : ''}" data-result="pass">✓ ผ่าน</button>
          <button class="result-btn ${r.overall_result === 'fail' ? 'selected-fail' : ''}" data-result="fail">✗ ไม่ผ่าน</button>
          <button class="result-btn ${r.overall_result === 'needs_action' ? 'selected-needs_action' : ''}" data-result="needs_action">⚠ ต้องแก้ไข</button>
        </div>
        <div id="result-suggestion" class="mt-sm" style="font-size:var(--text-xs); color:var(--color-text-3); text-align:center"></div>
      </div>

      <!-- Save Actions -->
      <div class="inspect-actions">
        <button class="btn btn-primary btn-lg btn-block" id="btn-save">💾 บันทึกผลการตรวจ</button>
      </div>
    </div>
  `;

  bindEvents(container, ext);
  updateProgress();
}

function renderChecklistWithCategories(answers) {
  let html = '';
  let lastCategory = null;
  for (const item of CHECKLIST_ITEMS) {
    if (item.category && item.category !== lastCategory) {
      lastCategory = item.category;
      html += `<div style="font-size:var(--text-xs);font-weight:600;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.04em;margin-top:${html ? 'var(--space-xl)' : '0'};margin-bottom:var(--space-sm)">${item.category}</div>`;
    }
    html += renderChecklistItem(item, answers[item.id]);
  }
  return html;
}

function renderChecklistItem(item, answer) {
  const stateClass = answer === 'pass' ? 'checked-pass' : answer === 'fail' ? 'checked-fail' : answer === 'na' ? 'checked-na' : '';
  return `
    <div class="checklist-item ${stateClass}" data-item-id="${item.id}">
      <div class="checklist-item__info">
        <div class="checklist-item__label">${item.label}</div>
        ${item.desc ? `<div class="checklist-item__desc">${item.desc}</div>` : ''}
      </div>
      <div class="checklist-actions">
        <button class="checklist-btn ${answer === 'pass' ? 'selected-pass' : ''}" data-answer="pass" data-item="${item.id}">✓</button>
        <button class="checklist-btn ${answer === 'fail' ? 'selected-fail' : ''}" data-answer="fail" data-item="${item.id}">✗</button>
        <button class="checklist-btn ${answer === 'na' ? 'selected-na' : ''}" data-answer="na" data-item="${item.id}">–</button>
      </div>
    </div>
  `;
}

function bindEvents(container, ext) {
  // Back
  container.querySelector('#btn-back').addEventListener('click', () => {
    if (confirm('ยังไม่ได้บันทึก ต้องการออกจากหน้านี้?')) {
      navigate('search');
    }
  });

  // Checklist buttons
  container.querySelector('#checklist-container').addEventListener('click', (e) => {
    const btn = e.target.closest('.checklist-btn');
    if (!btn) return;

    const itemId = btn.dataset.item;
    const answer = btn.dataset.answer;

    // Toggle: if already selected, unselect
    if (currentRecord.checklist_answers[itemId] === answer) {
      currentRecord.checklist_answers[itemId] = null;
    } else {
      currentRecord.checklist_answers[itemId] = answer;
    }

    // Update UI for this item
    const itemEl = container.querySelector(`.checklist-item[data-item-id="${itemId}"]`);
    const currentAnswer = currentRecord.checklist_answers[itemId];
    itemEl.className = `checklist-item ${currentAnswer === 'pass' ? 'checked-pass' : currentAnswer === 'fail' ? 'checked-fail' : currentAnswer === 'na' ? 'checked-na' : ''}`;

    itemEl.querySelectorAll('.checklist-btn').forEach(b => {
      b.className = `checklist-btn ${b.dataset.answer === currentAnswer ? `selected-${currentAnswer}` : ''}`;
    });

    updateProgress();
    updateSuggestion(container);
  });

  // Pass all shortcut
  container.querySelector('#btn-pass-all').addEventListener('click', () => {
    CHECKLIST_ITEMS.forEach(item => {
      currentRecord.checklist_answers[item.id] = 'pass';
    });
    refreshChecklist(container);
    updateProgress();
    updateSuggestion(container);
  });

  // Clear all
  container.querySelector('#btn-clear-all').addEventListener('click', () => {
    CHECKLIST_ITEMS.forEach(item => {
      currentRecord.checklist_answers[item.id] = null;
    });
    refreshChecklist(container);
    updateProgress();
    updateSuggestion(container);
  });

  // Result selector
  container.querySelector('#result-selector').addEventListener('click', (e) => {
    const btn = e.target.closest('.result-btn');
    if (!btn) return;
    const result = btn.dataset.result;

    // Toggle
    if (currentRecord.overall_result === result) {
      currentRecord.overall_result = null;
    } else {
      currentRecord.overall_result = result;
    }

    container.querySelectorAll('.result-btn').forEach(b => {
      b.className = `result-btn ${b.dataset.result === currentRecord.overall_result ? `selected-${currentRecord.overall_result}` : ''}`;
    });
  });

  // Inspector name
  container.querySelector('#inspector-name').addEventListener('input', (e) => {
    currentRecord.inspector_name = e.target.value;
  });

  // Remarks
  container.querySelector('#remarks').addEventListener('input', (e) => {
    currentRecord.remarks = e.target.value;
  });

  // Photo placeholder
  container.querySelector('#photo-placeholder').addEventListener('click', () => {
    showToast('ฟีเจอร์ถ่ายรูปจะเปิดใช้งานเร็วๆ นี้', 'info');
  });

  // Save
  container.querySelector('#btn-save').addEventListener('click', async () => {
    const { valid, errors } = validateInspection(currentRecord);
    if (!valid) {
      showToast(errors[0], 'error');
      return;
    }

    try {
      await saveInspection(currentRecord);
      // Save inspector name for next time
      await repo.setSetting('inspector_name', currentRecord.inspector_name);
      showToast('บันทึกผลการตรวจเรียบร้อย ✓', 'success');
      navigate('search');
    } catch (err) {
      showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
    }
  });
}

function refreshChecklist(container) {
  const checklistContainer = container.querySelector('#checklist-container');
  checklistContainer.innerHTML = renderChecklistWithCategories(currentRecord.checklist_answers);
}

function updateProgress() {
  const answered = Object.values(currentRecord.checklist_answers).filter(v => v !== null).length;
  const total = CHECKLIST_ITEMS.length;
  const el = document.querySelector('#checklist-progress');
  if (el) el.textContent = `(${answered}/${total})`;
}

function updateSuggestion(container) {
  const suggested = suggestOverallResult(currentRecord.checklist_answers);
  const el = container.querySelector('#result-suggestion');
  if (el && suggested) {
    el.textContent = `แนะนำ: ${RESULT_LABELS[suggested]}`;
  } else if (el) {
    el.textContent = '';
  }
}
