/* ================================================================
   STATE
================================================================ */
const S = {
  role: null,            // coordinator | instructor | rotc
  loginError: null,
  email: null,
  sidebarOpen: true,     // burger menu toggle state
  coordPage: 'Dashboard',
  instrPage: 'Overview',
  rotcPage: 'Overview',
  adminPage: 'Accounts',
  editingAccEmail: null,
  selRole: 'coordinator',
  secTab: 'all',
  selApproval: 0,
  calForm: false,
  sectionForm: false,
  inviteForm: false,
  selectedSection: null,
  instrSelectedSection: null,
  showAttachmentsModal: false,
  selectedPlanIndex: null,
  editingPlanIndex: null,
  selectedReportIndex: null,
  editingReportIndex: null,
  selectedCalActivity: null,
  selectedDesignIndex: null,
  editingDesignIndex: null,
  selectedStudent: null,
  selectedStudentRow: null,
  certModal: null,
  selectedTemplateId: 'tpl-1',
  certTemplates: [
    { id: 'tpl-1', name: 'Standard Completion', type: 'CWTS / LTS', color: 'indigo', file: 'standard_template.pdf' },
    { id: 'tpl-2', name: 'ROTC Leadership', type: 'ROTC', color: 'emerald', file: 'rotc_leadership.pdf' },
    { id: 'tpl-3', name: 'Special Recognition', type: 'All Programs', color: 'amber', file: 'special_recog.pdf' },
  ],
  certTemplateForm: false,
  editingTemplateIdx: null,
  batches: [],

  recentCerts: [],

  selectedRecentCertIdx: null,
  selectedBatchIdx: null,
  newlyImportedBatchIndex: null,
  notifPanel: false,
  profilePanel: false,
  editingProfile: false,
  auditFilter: 'all',
  showAuditFilterMenu: false,
  classesFilter: 'all',
  rCalFilter: 'all',
  showSectionsFilterMenu: false,
  showClassesFilterMenu: false,
  showRostersFilterMenu: false,
  showRCalFilterMenu: false,
  auditSearch: '',
  secSearch: '',
  classesSearch: '',
  rosterSearch: '',
  calSearch: '',
  selectedOcrUpload: null,
  ocrUploads: [],
  activities: [],
  unassigned: [],
  platoons: {},
  dragging: null,
  platSearch: '',
  platoonFilter: 'All',
  platoonSemesters: {},
  showPlatoonFilterMenu: false,
  selectedPlatoon: null,
  revisionModal: false,
  revisionNote: '',
  platoonForm: false,
  studentArchive: [],
  archiveSearch: '',
  archiveFilterProgram: 'All',
  archiveFilterRemarks: 'All',
  showExportModal: false,
  exportFields: { studentNo: true, name: true, gender: true, section: true, program: true, instructor: true, finalGrade: true, remarks: true, dateArchived: true },
  selectedInstructorIndex: null,
  editingInstructor: false,
  instructors: [],
  selectedActivityIndex: null,
  editingActivity: false
};

window.S = S;

/* ================================================================
   TOAST NOTIFICATION SYSTEM
================================================================ */
(function () {
  // Inject toast CSS once
  const style = document.createElement('style');
  style.textContent = `
    #toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-width: 300px;
      max-width: 380px;
      padding: 14px 16px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #fff;
      pointer-events: all;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.22s ease, transform 0.22s ease;
    }
    .toast-item.toast-show {
      opacity: 1;
      transform: translateY(0);
    }
    .toast-item.toast-hide {
      opacity: 0;
      transform: translateY(16px);
    }
    .toast-success { background: linear-gradient(135deg, #059669, #10b981); }
    .toast-error   { background: linear-gradient(135deg, #dc2626, #ef4444); }
    .toast-info    { background: linear-gradient(135deg, #4f46e5, #6366f1); }
    .toast-warning { background: linear-gradient(135deg, #d97706, #f59e0b); }
    .toast-icon { width: 20px; height: 20px; flex-shrink: 0; margin-top: 1px; }
    .toast-body { flex: 1; }
    .toast-title { font-weight: 700; font-size: 13px; line-height: 1.3; }
    .toast-msg   { font-weight: 400; font-size: 12px; opacity: 0.88; margin-top: 2px; line-height: 1.4; }
    .toast-close {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.7); padding: 0; margin-left: 4px;
      flex-shrink: 0; font-size: 16px; line-height: 1;
    }
    .toast-close:hover { color: #fff; }
    .toast-progress {
      position: absolute;
      bottom: 0; left: 0;
      height: 3px;
      border-radius: 0 0 12px 12px;
      background: rgba(255,255,255,0.4);
      transition: width linear;
    }
  `;
  document.head.appendChild(style);

  // Create container
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);

  const ICONS_SVG = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };

  const TITLES = { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' };

  window.showToast = function (message, type = 'success', title = '', duration = 3500) {
    const t = document.createElement('div');
    t.className = `toast-item toast-${type}`;
    t.style.position = 'relative';
    t.style.overflow = 'hidden';

    const heading = title || TITLES[type] || 'Notice';
    t.innerHTML = `
      ${ICONS_SVG[type] || ICONS_SVG.info}
      <div class="toast-body">
        <div class="toast-title">${heading}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" onclick="this.closest('.toast-item').remove()">&#9650;?</button>
      <div class="toast-progress" style="width:100%"></div>
    `;

    container.appendChild(t);

    // Trigger enter
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { t.classList.add('toast-show'); });
    });

    // Shrink progress bar
    const bar = t.querySelector('.toast-progress');
    if (bar) {
      bar.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => { requestAnimationFrame(() => { bar.style.width = '0%'; }); });
    }

    // Auto-dismiss
    const timer = setTimeout(() => {
      t.classList.add('toast-hide');
      setTimeout(() => t.remove(), 260);
    }, duration);

    t.querySelector('.toast-close').addEventListener('click', () => clearTimeout(timer));
  };
})();

/* ================================================================
   ICONS (lucide-style inline SVG)
================================================================ */
const ICONS = {
  menu: `<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>`,
  dashboard: `<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>`,
  users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  dnsc: `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=" alt="Icon" />`,
  grad: `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>`,
  filecheck: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/>`,
  scan: `<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/>`,
  award: `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`,
  scroll: `<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12v4"/><line x1="16" y1="13" x2="18" y2="13"/><line x1="10" y1="13" x2="14" y2="13"/><line x1="10" y1="17" x2="14" y2="17"/>`,
  calendar: `<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  logout: `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  search: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  bell: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`,
  help: `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  arrow: `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  plus: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  send: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  chevron: `<polyline points="9 18 15 12 9 6"/>`,
  download: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
  upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
  filter: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
  mail: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,4 12,13 2,4"/>`,
  lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  book: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  clipboard: `<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="12" y1="11" x2="16" y2="11"/><line x1="12" y1="16" x2="16" y2="16"/>`,
  filetext: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
  megaphone: `<path d="m3 11 19-9-9 19-2-8-8-2z"/>`,
  grid: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>`,
  pin: `<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/>`,
  mappin: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  clock: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  check2: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`,
  pencil: `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
  alertc: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
  trend: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
  calrange: `<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>`,
  grip: `<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>`,
  userplus: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>`,
  more: `<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>`,
  arrowup: `<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>`,
  star: `<path d="M12 2l2.39 6.95H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.56L2 8.95h7.61z" fill="currentColor" stroke="none"/>`,
  trash: `<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`,
  archive: `<path d="M21 8v13H3V8z"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>`,
  eye: `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
  eyeoff: `<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>`,
  image: `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`,
};

/* ================================================================
   PROFILE DATA (per role)
================================================================ */
const coordinatorProfile = {
  fullName: 'Dr. Maya Reyes',
  contact: '+63 917 234 5678',
  gmail: 'coordinator@dnsc.edu.ph',
  password: 'coor123',
  degree: 'Masteral',
  degreeTitle: 'Master of Science in Educational Management',
};
const instructorProfile = {
  fullName: 'Prof. Julian Santos',
  contact: '+63 918 876 5432',
  gmail: 'instructor@dnsc.edu.ph',
  password: 'ins123',
  degree: 'Bachelor',
  degreeTitle: 'Bachelor of Science in Education',
};
const rotcProfile = {
  fullName: '1Lt. Daniel Castillo',
  contact: '+63 921 555 7890',
  gmail: 'rotc@dnsc.edu.ph',
  password: 'rotc123',
  degree: 'Bachelor',
  degreeTitle: 'Bachelor of Science in Criminology',
};
const adminProfile = {
  fullName: 'System Administrator',
  contact: '+63 900 000 0000',
  gmail: 'admin123@dnsc.edu.ph',
  password: 'admin123',
  degree: 'Masteral',
  degreeTitle: 'Master of Science in Information Technology',
};

const PROFILE_DATA = {
  coordinator: coordinatorProfile,
  instructor: instructorProfile,
  rotc: rotcProfile,
  'coordinator@dnsc.edu.ph': coordinatorProfile,
  'instructor@dnsc.edu.ph': instructorProfile,
  'rotc@dnsc.edu.ph': rotcProfile,
  'admin123@dnsc.edu.ph': adminProfile,
};
function ico(name, cls = 'w-4 h-4') {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}">${ICONS[name] || ''}</svg>`;
}

function getInitials(name) {
  if (!name) return '';
  const clean = name.replace(/^(Dr\.|Prof\.|1Lt\.|Col\.|Capt\.|Lt\.)\s+/i, '');
  const parts = clean.split(' ');
  const first = parts[0]?.[0] || '';
  const last = parts[parts.length - 1]?.[0] || '';
  return (first + last).toUpperCase();
}

/* ================================================================
   HELPERS
================================================================ */
function pill(color, text) {
  const m = { slate: 'bg-slate-100 text-slate-700', indigo: 'bg-indigo-50 text-indigo-700', emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', rose: 'bg-rose-50 text-rose-700', violet: 'bg-violet-50 text-violet-700' };
  return `<span class="text-xs px-2 py-0.5 rounded-full ${m[color] || m.slate}">${text}</span>`;
}

function card(content, { title = '', subtitle = '', action = '', cls = '' } = {}) {
  const hdr = (title || action) ? `<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3"><div class="min-w-0">${title ? `<div class="text-slate-900 tracking-tight">${title}</div>` : ''}${subtitle ? `<div class="text-xs text-slate-500">${subtitle}</div>` : ''}</div>${action}</div>` : '';
  return `<div class="premium-card ${cls}">${hdr}<div class="p-5">${content}</div></div>`;
}

function pageHdr(title, sub = '', actions = '') {
  return `<div class="flex items-end justify-between gap-4 flex-wrap"><div><div class="text-slate-900 tracking-tight text-xl">${title}</div>${sub ? `<div class="text-sm text-slate-500 mt-0.5">${sub}</div>` : ''}</div>${actions ? `<div class="flex items-center gap-2">${actions}</div>` : ''}</div>`;
}

function tbl(cols, rows, rowAttr = null) {
  const thead = `<thead><tr class="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">${cols.map(c => `<th class="py-2 px-3 font-medium">${c.label}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map((row, i) => `<tr ${rowAttr ? rowAttr(row, i) : ''} class="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition">${cols.map(c => `<td class="py-3 px-3 text-slate-700">${c.fn ? c.fn(row) : row[c.key]}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="overflow-x-auto"><table class="w-full text-sm">${thead}${tbody}</table></div>`;
}

/* ================================================================
   CHARTS
================================================================ */
function enrollmentChartFromData(enrollment) {
  const data = enrollment?.series?.length
    ? enrollment.series
    : [{ m: 'Aug', v: 0 }, { m: 'Sep', v: 0 }, { m: 'Oct', v: 0 }];
  const total = enrollment?.total ?? (data.length ? data[data.length - 1].v : 0);
  const deltaText = enrollment?.delta_text || '+0%';
  const deltaUp = enrollment?.delta_up !== false;
  const W = 640, H = 240, pL = 36, pR = 12, pT = 12, pB = 26, iW = W - pL - pR, iH = H - pT - pB;
  const values = data.map(d => d.v);
  const minY = Math.max(0, Math.min(...values) - 50);
  const maxY = Math.max(...values) + 50;
  const span = Math.max(1, data.length - 1);
  const xf = i => (pL + i * iW / span).toFixed(1);
  const yf = v => (pT + iH - ((v - minY) / (maxY - minY)) * iH).toFixed(1);
  const ln = data.map((d, i) => `${i ? 'L' : 'M'} ${xf(i)} ${yf(d.v)}`).join(' ');
  const ar = `M ${xf(0)} ${pT + iH} ` + data.map((d, i) => `L ${xf(i)} ${yf(d.v)}`).join(' ') + ` L ${xf(data.length - 1)} ${pT + iH} Z`;
  const ticks = Array.from({ length: 5 }, (_, i) => ({ v: Math.round(minY + (maxY - minY) * i / 4), y: (pT + iH - i * iH / 4).toFixed(1) }));
  const deltaCls = deltaUp ? 'text-emerald-600' : 'text-rose-600';
  return `<div class="premium-card p-6">
    <div class="flex items-start justify-between mb-1">
      <div><div class="text-slate-900 tracking-tight">NSTP Component</div><div class="text-sm text-slate-500">Total students enrolled per semester</div></div>
      <button class="w-7 h-7 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-400">${ico('more')}</button>
    </div>
    <div class="flex items-end gap-3 mt-3 mb-2"><div class="text-slate-900 tracking-tight text-3xl" data-enrollment-total>${typeof total === 'number' ? total.toLocaleString() : total}</div><div class="text-sm ${deltaCls} pb-1" data-enrollment-delta>${deltaUp ? '▲' : '▼'} ${deltaText} vs last period</div></div>
    <svg viewBox="0 0 ${W} ${H}" class="w-full h-64" preserveAspectRatio="none">
      ${ticks.map(t => `<line x1="${pL}" x2="${W - pR}" y1="${t.y}" y2="${t.y}" stroke="#f1f5f9" stroke-width="1"/><text x="${pL - 8}" y="${(parseFloat(t.y) + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#94a3b8">${t.v}</text>`).join('')}
      <path d="${ar}" fill="#6366f1" fill-opacity="0.15"/>
      <path d="${ln}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>
      ${data.map((d, i) => `<circle cx="${xf(i)}" cy="${yf(d.v)}" r="3" fill="white" stroke="#6366f1" stroke-width="2"/><text x="${xf(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#94a3b8">${d.m}</text>`).join('')}
    </svg>
  </div>`;
}

function enrollmentChart() {
  const enrollment = window.DASHBOARD_METRICS?.enrollment;
  return enrollmentChartFromData(enrollment);
}

function passFailChartFromData(data) {
  if (!data || !data.length) {
    return `<div class="premium-card p-6"><div class="text-slate-900 tracking-tight">Pass / Fail by Program</div><p class="text-sm text-slate-500 mt-2">No graded students yet.</p></div>`;
  }
  const W = 480, H = 260, pL = 36, pR = 12, pT = 16, pB = 28, iW = W - pL - pR, iH = H - pT - pB;
  const maxY = Math.max(10, ...data.flatMap(d => [d.pass, d.fail]));
  const gW = iW / data.length, bW = 14;
  const yf = v => (pT + iH - (v / maxY) * iH).toFixed(1);
  const hf = v => ((v / maxY) * iH).toFixed(1);
  const ticks = Array.from({ length: 5 }, (_, i) => ({ v: Math.round(maxY * i / 4), y: (pT + iH - i * iH / 4).toFixed(1) }));
  return `<div class="premium-card p-6">
    <div class="flex items-start justify-between mb-2"><div><div class="text-slate-900 tracking-tight">Pass / Fail by Program</div><div class="text-sm text-slate-500">Current semester outcomes</div></div></div>
    <div class="flex items-center gap-4 text-xs text-slate-600 mb-2"><span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Passed</span><span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>Failed</span></div>
    <svg viewBox="0 0 ${W} ${H}" class="w-full h-64" preserveAspectRatio="none">
      ${ticks.map(t => `<line x1="${pL}" x2="${W - pR}" y1="${t.y}" y2="${t.y}" stroke="#f1f5f9" stroke-width="1"/><text x="${pL - 8}" y="${(parseFloat(t.y) + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#94a3b8">${t.v}</text>`).join('')}
      ${data.map((d, i) => { const cx = pL + gW * i + gW / 2; return `<rect x="${(cx - bW - 2).toFixed(1)}" y="${yf(d.pass)}" width="${bW}" height="${hf(d.pass)}" rx="4" fill="#10b981"/><rect x="${(cx + 2).toFixed(1)}" y="${yf(d.fail)}" width="${bW}" height="${hf(d.fail)}" rx="4" fill="#f43f5e"/><text x="${cx.toFixed(1)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#94a3b8">${d.p}</text>`; }).join('')}
    </svg>
  </div>`;
}

function passFailChart() {
  const data = window.DASHBOARD_METRICS?.pass_fail_by_program;
  return passFailChartFromData(data);
}

/* ================================================================
   SHELL
================================================================ */
const THEMES = {
  indigo: { bg: 'bg-indigo-50/60', bdr: 'border-indigo-100', brand: 'bg-gradient-to-br from-indigo-600 to-blue-500 text-white', active: 'bg-indigo-600 text-white', inactive: 'text-slate-600 hover:bg-white hover:text-slate-900', inactiveIco: 'text-slate-400 group-hover:text-slate-600', badge: 'bg-white/20 text-white', btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200', avatar: 'bg-gradient-to-br from-amber-400 to-rose-400 text-white', mil: false },
  emerald: { bg: 'bg-emerald-50/60', bdr: 'border-emerald-100', brand: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white', active: 'bg-emerald-600 text-white', inactive: 'text-slate-600 hover:bg-white hover:text-slate-900', inactiveIco: 'text-slate-400 group-hover:text-slate-600', badge: 'bg-white/20 text-white', btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200', avatar: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white', mil: false },
  military: { bg: 'bg-slate-900', bdr: 'border-slate-800', brand: 'bg-slate-800 text-amber-300 ring-1 ring-slate-700', active: 'bg-amber-300 text-slate-900 border-amber-300', inactive: 'text-slate-300 border-transparent hover:bg-slate-800 hover:text-white', inactiveIco: 'text-slate-400 group-hover:text-white', badge: 'bg-slate-900 text-amber-300', btn: 'bg-amber-300 hover:bg-amber-400 text-slate-900', avatar: 'bg-slate-800 ring-1 ring-amber-300 text-amber-300', mil: true },
  purple: { bg: 'bg-purple-50/60', bdr: 'border-purple-100', brand: 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white', active: 'bg-purple-600 text-white', inactive: 'text-slate-600 hover:bg-white hover:text-slate-900', inactiveIco: 'text-slate-400 group-hover:text-slate-600', badge: 'bg-white/20 text-white', btn: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200', avatar: 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white', mil: false },
};

function renderShell({ theme = 'indigo', brand, brandSub, navItems, userName, userRole, userInitials, greeting, context, ctaLabel, content }) {
  const t = THEMES[theme];
  const mil = t.mil;
  const brandSvg = mil
    ? `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor"><path d="M12 2l2.39 6.95H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.56L2 8.95h7.61z"/></svg>`
    : `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;

  const navHtml = navItems.map(item => {
    if (item.isHeader) {
      return `<div class="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-wider ${mil ? 'text-slate-500' : 'text-slate-400/80'}">${item.name}</div>`;
    }
    const activeClass = item.active ? t.active : t.inactive;
    const icoClass = item.active ? (mil ? 'text-slate-900' : 'text-white') : t.inactiveIco;
    const bdr = mil ? 'rounded-md border' : 'rounded-lg';
    const badge = item.badge != null ? `<span data-approvals-badge class="text-[10px] px-1.5 py-0.5 rounded ${item.active ? t.badge : mil ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}">${item.badge}</span>` : '';
    return `<button data-nav="${item.name}" class="w-full group flex items-center gap-3 px-3 py-2.5 ${bdr} text-left transition ${activeClass}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-[18px] h-[18px] ${icoClass}">${ICONS[item.ico] || ''}</svg>
      <span class="flex-1 text-sm">${item.name}</span>${badge}
    </button>`;
  }).join('');

  const textClr = mil ? 'text-white' : 'text-slate-900';
  const subClr = mil ? 'text-slate-400' : 'text-slate-500';
  const ctaBtnCls = mil ? `bg-amber-300 hover:bg-amber-400 text-slate-900` : `${t.btn} text-white`;

  return `<div class="min-h-screen w-full bg-slate-50 text-slate-800 flex">
    <aside class="transition-all duration-300 ease-in-out shrink-0 ${t.bg} border-r ${t.bdr} flex flex-col h-screen sticky top-0 ${S.sidebarOpen ? 'w-64' : 'w-0 overflow-hidden !border-r-0'}">
      <div class="px-6 py-6 border-b ${t.bdr}">
        <div class="flex items-center gap-3">
          <img src="/images/DSNC.png" class="w-10 h-10 object-contain" alt="DNSC Logo" />
          <div>
            <div class="tracking-tight ${mil ? 'uppercase text-sm ' + textClr : textClr}">${brand}</div>
            <div class="text-[11px] ${mil ? 'uppercase tracking-wider ' + subClr : subClr}">${brandSub}</div>
          </div>
        </div>
      </div>
      <nav class="flex-1 px-3 py-5 space-y-1 sidebar-nav">
        ${navHtml}
      </nav>
      <div class="px-3 py-4 border-t ${t.bdr}">
        <div class="flex items-center gap-1 rounded-md hover:bg-black/5 transition group">
          <button data-profile-btn class="flex items-center gap-3 px-3 py-2 flex-1 min-w-0 text-left">
            <div class="${mil ? 'rounded-md' : 'rounded-full'} w-9 h-9 ${t.avatar} flex items-center justify-center text-sm shrink-0">${userInitials}</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm truncate ${textClr} group-hover:underline">${userName}</div>
              <div class="text-[11px] truncate ${mil ? 'uppercase tracking-wider ' + subClr : subClr}">${userRole}</div>
            </div>
          </button>
          <button data-logout class="${mil ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'} p-2 shrink-0">${ico('logout', 'w-4 h-4')}</button>
        </div>
      </div>
    </aside>
    <div class="flex-1 min-w-0 flex flex-col">
      <header class="flex items-center justify-between gap-6 px-8 py-5 bg-white/70 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <button id="sidebarToggleBtn" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition duration-200 focus:outline-none flex items-center justify-center shrink-0" title="${S.sidebarOpen ? 'Collapse workspace' : 'Expand workspace'}">
            ${ico('menu', 'w-5 h-5')}
          </button>
          <div>
            <div class="text-xs text-slate-500 ${mil ? 'uppercase tracking-wider' : ''}">${context}</div>
            <div class="text-slate-900 tracking-tight text-lg">${greeting}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative hidden md:block">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('search', 'w-4 h-4')}</span>
            <input type="text" placeholder="Search..." class="w-72 pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 border border-transparent focus:bg-white focus:border-slate-300 focus:outline-none" />
          </div>

          <button id="notifBellBtn" class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 relative">
            ${ico('bell', 'w-[18px] h-[18px]')}
            ${(S.notifications || []).some(n => !n.is_read) ? `<span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>` : ''}
          </button>
        </div>
      </header>
      <main class="flex-1 px-8 py-7 space-y-6">${content}</main>
    </div>
  </div>
  ${S.profilePanel ? (() => {
      const pd = PROFILE_DATA[S.email] || PROFILE_DATA[S.role] || {};
      const showPw = S.profileShowPw;
      const isMasteral = pd.degree === 'Masteral';
      const mil = t.mil;
      const accentBtn = mil ? 'bg-amber-300 hover:bg-amber-400 text-slate-900' : (theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white');

      if (S.editingProfile) {
        return `<div id="profileOverlay" class="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"></div>
  <div id="profileDrawer" class="fixed top-0 right-0 h-full w-96 max-w-full z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col">
    <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-slate-900 to-slate-800 shrink-0">
      <div>
        <div class="text-white tracking-tight text-base">Edit Account Info</div>
        <div class="text-slate-400 text-xs mt-0.5">Modify your profile details</div>
      </div>
      <button id="profileClose" class="text-slate-400 hover:text-white p-1 transition">${ico('close', 'w-4 h-4')}</button>
    </div>
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      <div>
        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Full Name</div>
        <input type="text" id="editProfName" value="${pd.fullName || ''}" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all" />
      </div>
      <div>
        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Phone / Contact</div>
        <input type="text" id="editProfContact" value="${pd.contact || ''}" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all" />
      </div>
      <div>
        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Gmail Address</div>
        <input type="email" id="editProfGmail" value="${pd.gmail || ''}" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all" />
      </div>
      <div>
        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Password</div>
        <input type="text" id="editProfPassword" value="${pd.password || ''}" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono transition-all" />
      </div>
      <div>
        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Degree Type</div>
        <select id="editProfDegree" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all">
          <option value="Bachelor" ${pd.degree === 'Bachelor' ? 'selected' : ''}>Bachelor</option>
          <option value="Masteral" ${pd.degree === 'Masteral' ? 'selected' : ''}>Masteral</option>
        </select>
      </div>
      <div>
        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Degree Description</div>
        <input type="text" id="editProfDegreeTitle" value="${pd.degreeTitle || ''}" class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all" />
      </div>
    </div>
    <div class="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50">
      <button id="cancelProfileBtn" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm transition">Cancel</button>
      <button id="saveProfileBtn" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${accentBtn} text-sm transition font-semibold shadow-sm">${ico('check2', 'w-4 h-4')} Save Changes</button>
    </div>
  </div>`;
      }

      return `<div id="profileOverlay" class="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"></div>
  <div id="profileDrawer" class="fixed top-0 right-0 h-full w-96 max-w-full z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col">
    <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-slate-900 to-slate-800">
      <div>
        <div class="text-white tracking-tight text-base">Account Information</div>
        <div class="text-slate-400 text-xs mt-0.5">Your profile &amp; credentials</div>
      </div>
      <button id="profileClose" class="text-slate-400 hover:text-white p-1 transition">${ico('close', 'w-4 h-4')}</button>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div class="px-6 py-6 flex flex-col items-center border-b border-slate-100 bg-slate-50">
        <div class="w-20 h-20 rounded-full ${t.avatar} flex items-center justify-center text-2xl font-semibold shadow-lg mb-3">${userInitials}</div>
        <div class="text-slate-900 font-semibold text-lg tracking-tight">${pd.fullName || userName}</div>
        <div class="text-sm text-slate-500 mt-0.5">${userRole}</div>
        ${isMasteral ? `<span class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-violet-50 text-violet-700 border border-violet-200">${ico('grad', 'w-3.5 h-3.5')} ${pd.degreeTitle}</span>` : ''}
      </div>
      <div class="px-6 py-5 space-y-5">
        <div class="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Contact Information</div>
        <div class="space-y-4">
          <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">${ico('users', 'w-4 h-4')}</div>
            <div class="min-w-0">
              <div class="text-[11px] text-slate-400 mb-0.5">Full Name</div>
              <div class="text-sm text-slate-900 font-medium">${pd.fullName || userName}</div>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">${ico('bell', 'w-4 h-4')}</div>
            <div class="min-w-0">
              <div class="text-[11px] text-slate-400 mb-0.5">Phone / Contact</div>
              <div class="text-sm text-slate-900 font-medium">${pd.contact || '-??'}</div>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">${ico('mail', 'w-4 h-4')}</div>
            <div class="min-w-0">
              <div class="text-[11px] text-slate-400 mb-0.5">Gmail</div>
              <div class="text-sm text-slate-900 font-medium break-all">${pd.gmail || '-??'}</div>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">${ico('lock', 'w-4 h-4')}</div>
            <div class="flex-1 min-w-0">
              <div class="text-[11px] text-slate-400 mb-0.5">Password</div>
              <div class="flex items-center gap-2">
                <div class="text-sm text-slate-900 font-medium font-mono flex-1" id="profilePwDisplay">${showPw ? (pd.password || '-??') : '-?-?-?-?-?-?-?-?-?-?-'}</div>
                <button id="profilePwToggle" class="text-slate-400 hover:text-slate-700 p-1 transition" title="${showPw ? 'Hide' : 'Show'} password">${ico(showPw ? 'eyeoff' : 'eye', 'w-3.5 h-3.5')}</button>
              </div>
            </div>
          </div>
          ${isMasteral ? `
          <div class="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
            <div class="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">${ico('grad', 'w-4 h-4')}</div>
            <div class="min-w-0">
              <div class="text-[11px] text-violet-400 mb-0.5">Degree</div>
              <div class="text-sm text-violet-900 font-semibold">Masteral</div>
              <div class="text-xs text-violet-600 mt-0.5">${pd.degreeTitle}</div>
            </div>
          </div>` : ''}
        </div>
        <div class="pt-2">
          <button id="editProfileBtn" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm transition font-medium">${ico('pencil', 'w-4 h-4')} Edit Information</button>
        </div>
      </div>
    </div>
    <div class="px-6 py-4 border-t border-slate-100">
      <button id="profileLogout" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm transition">${ico('logout', 'w-4 h-4')} Sign Out
      </button>
    </div>
  </div>`;
    })() : ''}
  ${S.notifPanel ? (() => {
      const notifs = S.notifications || [];
      const unreadCount = notifs.filter(n => !n.is_read).length;
      
      const newNotifs = notifs.filter(n => !n.is_read);
      const earlierNotifs = notifs.filter(n => n.is_read);
      
      const renderNotifItem = (n) => {
        const typeIcons = {
          assignment: 'filecheck',
          system: 'bell',
          grade: 'award',
          alert: 'alertc'
        };
        const typeBg = {
          assignment: 'bg-indigo-50 text-indigo-600',
          system: 'bg-slate-50 text-slate-500',
          grade: 'bg-emerald-50 text-emerald-600',
          alert: 'bg-amber-50 text-amber-600'
        };
        const icoName = typeIcons[n.type] || 'bell';
        const bgClass = typeBg[n.type] || 'bg-slate-50 text-slate-500';
        
        const timeStr = n.created_at ? new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Today';
        
        return `<li data-notif-id="${n.id}" class="px-5 py-3.5 flex gap-3 hover:bg-slate-50 transition cursor-pointer relative ${!n.is_read ? 'bg-indigo-50/20' : ''}">
          <div class="w-8 h-8 rounded-full ${bgClass} flex items-center justify-center shrink-0">${ico(icoName, 'w-4 h-4')}</div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-900">${n.title}</div>
            <div class="text-xs text-slate-655 mt-0.5">${n.message}</div>
            <div class="text-[10px] text-slate-400 mt-1">${timeStr}</div>
          </div>
          ${!n.is_read ? `<span class="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>` : ''}
        </li>`;
      };
      
      const newNotifsHtml = newNotifs.map(renderNotifItem).join('');
      const earlierNotifsHtml = earlierNotifs.map(renderNotifItem).join('');
      
      return `<div id="notifOverlay" class="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"></div>
  <div id="notifDrawer" class="fixed top-0 right-0 h-full w-80 max-w-full z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col">
    <div class="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
      <div>
        <div class="text-slate-900 font-bold tracking-tight">Notifications</div>
        <div class="text-xs text-slate-500">${unreadCount} unread</div>
      </div>
      <button id="notifClose" class="text-slate-400 hover:text-slate-700 p-1">${ico('close', 'w-4 h-4')}</button>
    </div>
    <div class="flex-1 overflow-y-auto">
      ${newNotifs.length > 0 ? `
        <div class="px-5 pt-4 pb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">New</div>
        <ul class="divide-y divide-slate-50">${newNotifsHtml}</ul>
      ` : ''}
      
      ${earlierNotifs.length > 0 ? `
        <div class="px-5 pt-4 pb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Earlier</div>
        <ul class="divide-y divide-slate-50">${earlierNotifsHtml}</ul>
      ` : ''}
      
      ${newNotifs.length === 0 && earlierNotifs.length === 0 ? `
        <div class="flex flex-col items-center justify-center h-48 text-slate-400">
          ${ico('bell', 'w-8 h-8 opacity-40 mb-2')}
          <div class="text-xs">No notifications yet</div>
        </div>
      ` : ''}
    </div>
    <div class="px-5 py-4 border-t border-slate-100">
      <button id="notifMarkAll" class="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium">Mark all as read</button>
    </div>
  </div>`;
    })() : ''}`;
}

