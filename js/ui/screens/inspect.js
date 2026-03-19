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

      <!-- Photo Section -->
      <div class="inspect-section">
        <div class="section-title">📷 รูปถ่ายหลักฐาน <span id="photo-count" style="color:var(--color-primary)"></span></div>
        <div id="photo-gallery"></div>
        <button class="btn btn-outline btn-block" id="btn-take-photo" style="margin-top:var(--space-sm)">
          📷 ถ่ายรูป
        </button>
      </div>

      <!-- Camera Modal (hidden by default) -->
      <div class="camera-modal hidden" id="camera-modal">
        <div class="camera-modal__header">
          <span>📷 ถ่ายรูปหลักฐาน</span>
          <button class="camera-modal__close" id="camera-close">✕</button>
        </div>
        <div class="camera-modal__body">
          <video id="camera-video" autoplay playsinline></video>
          <canvas id="camera-canvas" class="hidden"></canvas>
        </div>
        <div class="camera-modal__actions">
          <button class="btn btn-outline" id="camera-switch" style="width:56px;height:56px;border-radius:50%;padding:0;font-size:1.2rem">🔄</button>
          <button class="btn btn-primary" id="camera-capture" style="width:72px;height:72px;border-radius:50%;padding:0;font-size:1.5rem">📸</button>
          <div style="width:56px"></div>
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

  // Photo gallery render
  renderPhotoGallery(container);

  // Camera
  let cameraStream = null;
  let facingMode = 'environment'; // rear camera default

  container.querySelector('#btn-take-photo').addEventListener('click', () => openCamera());

  async function openCamera() {
    const modal = container.querySelector('#camera-modal');
    const video = container.querySelector('#camera-video');
    modal.classList.remove('hidden');

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      video.srcObject = cameraStream;
    } catch (err) {
      console.error('Camera error:', err);
      showToast('เปิดกล้องไม่ได้: ' + err.message, 'error');
      closeCamera();
    }
  }

  function closeCamera() {
    const modal = container.querySelector('#camera-modal');
    const video = container.querySelector('#camera-video');
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    video.srcObject = null;
    modal.classList.add('hidden');
  }

  container.querySelector('#camera-close').addEventListener('click', closeCamera);

  container.querySelector('#camera-switch').addEventListener('click', () => {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    closeCamera();
    openCamera();
  });

  container.querySelector('#camera-capture').addEventListener('click', () => {
    const video = container.querySelector('#camera-video');
    const canvas = container.querySelector('#camera-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Compress to JPEG base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    currentRecord.photos.push({
      data: dataUrl,
      timestamp: new Date().toISOString(),
    });

    closeCamera();
    renderPhotoGallery(container);
    showToast('ถ่ายรูปสำเร็จ (' + currentRecord.photos.length + ' รูป)', 'success');
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

function renderPhotoGallery(container) {
  const gallery = container.querySelector('#photo-gallery');
  const countEl = container.querySelector('#photo-count');
  const photos = currentRecord.photos || [];

  if (countEl) countEl.textContent = photos.length > 0 ? `(${photos.length} รูป)` : '';

  if (photos.length === 0) {
    gallery.innerHTML = `
      <div class="photo-section" style="padding:var(--space-xl)">
        <div class="photo-section__icon">📷</div>
        <div class="photo-section__text">ยังไม่มีรูปถ่าย — กดปุ่มด้านล่างเพื่อถ่ายรูป</div>
      </div>
    `;
    return;
  }

  gallery.innerHTML = `
    <div class="photo-grid">
      ${photos.map((p, i) => `
        <div class="photo-thumb">
          <img src="${p.data}" alt="รูปที่ ${i + 1}">
          <button class="photo-thumb__delete" data-idx="${i}">✕</button>
        </div>
      `).join('')}
    </div>
  `;

  // Delete handlers
  gallery.querySelectorAll('.photo-thumb__delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      if (confirm(`ลบรูปที่ ${idx + 1}?`)) {
        currentRecord.photos.splice(idx, 1);
        renderPhotoGallery(container);
      }
    });
  });
}
