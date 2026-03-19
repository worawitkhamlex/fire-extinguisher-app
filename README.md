# 🧯 Fire Extinguisher Inspection System

ระบบตรวจสภาพถังดับเพลิงรายเดือน สำหรับแผนก Safety  
ออกแบบสำหรับ **Handheld Scanner** โดยเฉพาะ

---

## ✨ Features

- ค้นหาถังดับเพลิงด้วย barcode scanner (keyboard wedge) หรือพิมพ์รหัส
- ฟอร์มตรวจสภาพ config-driven — เพิ่ม/ลบ/แก้ checklist ง่าย
- Dashboard แสดงความคืบหน้ารายเดือน
- ประวัติการตรวจย้อนหลังรายถัง/รายเดือน
- Export JSON / CSV, Import JSON สำหรับ backup/restore
- PWA — ติดตั้งบนหน้าจอ ใช้งาน offline ได้
- ข้อมูลเก็บใน IndexedDB (ไม่ต้องมี server)

---

## 📱 Target Device

- Handheld Scanner (720×1440, 320 dpi)
- Portrait orientation
- Touch-friendly UI — ปุ่มใหญ่ ใช้นิ้วง่าย
- Keyboard wedge barcode input support

---

## 🚀 Quick Start

### วิธีที่ 1: เปิดไฟล์ตรง
เปิด `index.html` ด้วย browser ที่รองรับ ES Modules  
(Chrome, Edge, Firefox — แนะนำ Chrome)

> ⚠️ Service Worker และ camera API ต้องใช้ HTTPS หรือ localhost

### วิธีที่ 2: Local Server
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```
เปิด `http://localhost:8080`

---

## 🌐 Deploy to GitHub Pages

1. สร้าง GitHub Repository
2. Push โค้ดทั้งหมดขึ้น `main` branch
3. ไปที่ **Settings → Pages**
4. เลือก Source: **Deploy from a branch** → `main` → `/ (root)`
5. Save → รอ 1-2 นาที
6. เปิด `https://<username>.github.io/<repo-name>/`

> GitHub Pages เป็น HTTPS → รองรับ camera API ในอนาคต

---

## 📂 Project Structure

```
fire-inspection/
├── index.html              # App shell + bottom nav
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline caching
├── css/
│   ├── variables.css       # Design tokens
│   ├── base.css            # Reset, typography, utilities
│   ├── components.css      # Reusable UI components
│   └── screens.css         # Screen-specific styles
├── js/
│   ├── app.js              # Entry point, router setup, toast
│   ├── config/
│   │   └── checklist-config.js   # ★ Config-driven checklist items
│   ├── storage/
│   │   ├── db.js           # IndexedDB wrapper (low-level)
│   │   └── repository.js   # Data access layer (business-facing)
│   ├── services/
│   │   ├── inspection-service.js  # Inspection CRUD + validation
│   │   ├── export-service.js      # JSON/CSV export, JSON import
│   │   └── seed-service.js        # Sample data seeding
│   ├── ui/
│   │   ├── router.js       # Hash-based SPA router
│   │   └── screens/
│   │       ├── home.js     # Landing page + quick stats
│   │       ├── search.js   # Scan/search extinguisher
│   │       ├── inspect.js  # Inspection form + checklist
│   │       ├── dashboard.js # Monthly progress
│   │       ├── history.js  # Past inspections
│   │       ├── detail.js   # Inspection detail view
│   │       └── settings.js # Export/Import/Reset
│   └── utils/
│       ├── date-utils.js   # Thai date formatting
│       └── id-utils.js     # ID generation
└── README.md
```

---

## 🏗️ Architecture

### Separation of Concerns

```
UI Screens → Services → Repository → IndexedDB
```

- **Screens** (`js/ui/screens/`) — UI rendering, user interaction
- **Services** (`js/services/`) — Business logic, validation
- **Repository** (`js/storage/repository.js`) — Data access abstraction
- **DB** (`js/storage/db.js`) — Raw IndexedDB operations

### Config-Driven Checklist

แก้ไขรายการตรวจที่ `js/config/checklist-config.js`:

```js
export const CHECKLIST_ITEMS = [
  {
    id: 'body_condition',
    label: 'สภาพตัวถังภายนอก',
    desc: 'ไม่มีรอยบุบ สนิม หรือเสียหาย',
    required: true,
  },
  // เพิ่ม/ลบ/แก้ได้ตามต้องการ — UI จะ render อัตโนมัติ
];
```

### Storage Abstraction (Future API Sync)

ทุก screen เรียกข้อมูลผ่าน `repository.js` ไม่ได้เรียก IndexedDB ตรง  
เมื่อต้องการ sync กับ backend API:

1. สร้าง `js/storage/api-repository.js` ที่ implement interface เดียวกัน
2. เปลี่ยน import ใน `app.js` หรือใช้ strategy pattern
3. ไม่ต้องแก้ screen code เลย

---

## 📷 Future Camera Feature

โครงสร้างพร้อมรองรับ:

1. **Inspection Record** มี `photos: []` field
2. **Inspect Screen** มี photo section placeholder
3. **Detail Screen** มี photo display section
4. **HTTPS deployment** (GitHub Pages) → `getUserMedia` ใช้ได้

### วิธีเพิ่ม Camera:

1. สร้าง `js/services/camera-service.js`
   ```js
   export async function capturePhoto() {
     const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
     // ... capture logic, return base64
   }
   ```
2. แก้ `inspect.js` — ให้ photo placeholder เรียก `capturePhoto()`
3. เก็บ base64 ลง `currentRecord.photos[]`
4. แก้ `detail.js` — แสดง `<img>` จาก photos array

---

## 🔧 Customization

### เพิ่มรายการ Checklist
แก้ `js/config/checklist-config.js` — เพิ่ม object ใน `CHECKLIST_ITEMS`

### เปลี่ยน Master Data
แก้ `js/services/seed-service.js` — แก้ `SAMPLE_EXTINGUISHERS` array  
หรือ Import JSON จากหน้าตั้งค่า

### เพิ่มฟอร์มตรวจประเภทอื่น
1. สร้าง checklist config ใหม่ (e.g. `fire-hose-config.js`)
2. สร้าง screen ใหม่ (e.g. `inspect-hose.js`)
3. เพิ่ม route ใน `app.js`

### เปลี่ยนสี / Design Tokens
แก้ `css/variables.css`

---

## 📋 Data Model

### extinguishers
| Field | Description |
|-------|-------------|
| id | auto-increment PK |
| extinguisher_code | รหัสถัง (unique index) |
| serial_no | หมายเลขซีเรียล |
| location | ตำแหน่งติดตั้ง |
| department | แผนก/โซน |
| extinguisher_type | ประเภท |
| size | ขนาด |
| install_date | วันติดตั้ง |
| last_service_date | วันบำรุงรักษาล่าสุด |
| next_service_due | วันครบกำหนดบำรุงรักษา |
| status | สถานะ (active/inactive) |

### inspections
| Field | Description |
|-------|-------------|
| id | auto-increment PK |
| inspection_id | รหัสการตรวจ (unique) |
| inspection_month | เดือนที่ตรวจ (YYYY-MM) |
| inspection_date_time | วันเวลาที่ตรวจ (ISO) |
| inspector_name | ชื่อผู้ตรวจ |
| extinguisher_code | รหัสถัง |
| location_snapshot | ตำแหน่งขณะตรวจ |
| checklist_answers | ผล checklist (JSON object) |
| remarks | หมายเหตุ |
| overall_result | ผลสรุป (pass/fail/needs_action) |
| photos | รูปถ่าย (array, for future) |
| created_at | วันที่สร้าง |
| updated_at | วันที่อัปเดต |

---

## License

Internal use — Autoboxes Safety Department
