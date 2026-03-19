/**
 * Settings Screen — Data management, export, import, reset
 */

import * as repo from '../../storage/repository.js';
import { exportJSON, exportCSV, importJSON } from '../../services/export-service.js';
import { resetToSeedData } from '../../services/seed-service.js';
import { navigate } from '../router.js';
import { showToast } from '../../utils/toast.js';

export async function renderSettings(container) {
  const extCount = await repo.countExtinguishers();
  const insCount = await repo.countInspections();

  container.innerHTML = `
    <div class="screen">
      <div class="app-header">
        <div class="app-header__title">⚙️ ตั้งค่า</div>
      </div>

      <!-- Data Summary -->
      <div class="card mb-lg">
        <div class="section-title" style="margin-top:0">ข้อมูลในเครื่อง</div>
        <div class="grid-2 mt-md">
          <div class="stat-card">
            <div class="stat-card__value">${extCount}</div>
            <div class="stat-card__label">ถังดับเพลิง</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__value">${insCount}</div>
            <div class="stat-card__label">การตรวจ</div>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="section-title">ส่งออกข้อมูล</div>
      <div class="settings-group">
        <div class="settings-item" id="btn-export-json">
          <span class="settings-item__icon">📦</span>
          <div class="settings-item__text">
            <div class="settings-item__title">Export JSON</div>
            <div class="settings-item__desc">สำรองข้อมูลทั้งหมดเป็นไฟล์ JSON</div>
          </div>
          <span class="settings-item__arrow">→</span>
        </div>
        <div class="settings-item" id="btn-export-csv">
          <span class="settings-item__icon">📊</span>
          <div class="settings-item__text">
            <div class="settings-item__title">Export CSV</div>
            <div class="settings-item__desc">ส่งออกผลตรวจเป็น CSV สำหรับ Excel</div>
          </div>
          <span class="settings-item__arrow">→</span>
        </div>
      </div>

      <!-- Import -->
      <div class="section-title">นำเข้าข้อมูล</div>
      <div class="settings-group">
        <div class="settings-item" id="btn-import-json">
          <span class="settings-item__icon">📥</span>
          <div class="settings-item__text">
            <div class="settings-item__title">Import JSON</div>
            <div class="settings-item__desc">กู้คืนข้อมูลจากไฟล์ JSON สำรอง</div>
          </div>
          <span class="settings-item__arrow">→</span>
        </div>
      </div>
      <input type="file" id="import-file-input" accept=".json" class="hidden">

      <!-- Danger Zone -->
      <div class="section-title" style="color:var(--color-fail)">⚠ โซนอันตราย</div>
      <div class="settings-group">
        <div class="settings-item" id="btn-reset-seed" style="border-color:var(--color-warn)">
          <span class="settings-item__icon">🔄</span>
          <div class="settings-item__text">
            <div class="settings-item__title">รีเซ็ตเป็นข้อมูลตัวอย่าง</div>
            <div class="settings-item__desc">ลบข้อมูลทั้งหมดและใส่ข้อมูลตัวอย่างใหม่</div>
          </div>
        </div>
        <div class="settings-item" id="btn-clear-all" style="border-color:var(--color-fail)">
          <span class="settings-item__icon">🗑️</span>
          <div class="settings-item__text">
            <div class="settings-item__title" style="color:var(--color-fail)">ลบข้อมูลทั้งหมด</div>
            <div class="settings-item__desc">ลบข้อมูลถังและผลตรวจทั้งหมดออกจากเครื่อง</div>
          </div>
        </div>
      </div>

      <!-- App Info -->
      <div class="section-title">เกี่ยวกับ</div>
      <div class="card card-compact" style="font-size:var(--text-sm); color:var(--color-text-3)">
        <p><strong style="color:var(--color-text)">Fire Extinguisher Inspection System</strong></p>
        <p class="mt-sm">v1.0.0 · ข้อมูลเก็บในเครื่อง (IndexedDB)</p>
        <p class="mt-sm">ออกแบบสำหรับ Handheld Scanner</p>
      </div>

      <div style="height:var(--space-3xl)"></div>
    </div>
  `;

  // Export JSON
  container.querySelector('#btn-export-json').addEventListener('click', async () => {
    try {
      await exportJSON();
      showToast('ส่งออก JSON สำเร็จ', 'success');
    } catch (e) {
      showToast('เกิดข้อผิดพลาด: ' + e.message, 'error');
    }
  });

  // Export CSV
  container.querySelector('#btn-export-csv').addEventListener('click', async () => {
    const count = await repo.countInspections();
    if (count === 0) {
      showToast('ไม่มีข้อมูลการตรวจ', 'error');
      return;
    }
    try {
      await exportCSV();
      showToast('ส่งออก CSV สำเร็จ', 'success');
    } catch (e) {
      showToast('เกิดข้อผิดพลาด: ' + e.message, 'error');
    }
  });

  // Import JSON
  const fileInput = container.querySelector('#import-file-input');
  container.querySelector('#btn-import-json').addEventListener('click', () => {
    fileInput.click();
  });
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!confirm('การนำเข้าจะแทนที่ข้อมูลทั้งหมดในเครื่อง ต้องการดำเนินการ?')) {
      fileInput.value = '';
      return;
    }
    try {
      await importJSON(file);
      showToast('นำเข้าข้อมูลสำเร็จ', 'success');
      renderSettings(container); // re-render
    } catch (err) {
      showToast(err.message, 'error');
    }
    fileInput.value = '';
  });

  // Reset to seed
  container.querySelector('#btn-reset-seed').addEventListener('click', async () => {
    if (!confirm('ข้อมูลทั้งหมดจะถูกลบและแทนที่ด้วยข้อมูลตัวอย่าง\nต้องการดำเนินการ?')) return;
    try {
      await resetToSeedData();
      showToast('รีเซ็ตข้อมูลสำเร็จ', 'success');
      renderSettings(container);
    } catch (e) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  });

  // Clear all
  container.querySelector('#btn-clear-all').addEventListener('click', async () => {
    if (!confirm('⚠ ข้อมูลทั้งหมดจะถูกลบถาวร!\nไม่สามารถกู้คืนได้\n\nต้องการดำเนินการ?')) return;
    if (!confirm('ยืนยันอีกครั้ง: ลบข้อมูลทั้งหมด?')) return;
    try {
      await repo.clearAllData();
      showToast('ลบข้อมูลทั้งหมดแล้ว', 'success');
      renderSettings(container);
    } catch (e) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  });
}
