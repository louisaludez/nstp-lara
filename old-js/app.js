// syncSectionStudentsToArchive — DISABLED.
// Archive is now populated ONLY when a student record is hard-deleted.
// See the [data-delete-student] handler below.
window.syncSectionStudentsToArchive = function () { /* no-op */ };

/* ================================================================
   MOVE CADET HELPER
================================================================ */
function moveCadet(id, from, to) {
  if (from === to) return;
  let cadet;
  if (from === 'unassigned') {
    cadet = S.unassigned.find(c => c.id === id);
    S.unassigned = S.unassigned.filter(c => c.id !== id);
  } else {
    cadet = (S.platoons[from] || []).find(c => c.id === id);
    if (S.platoons[from]) S.platoons[from] = S.platoons[from].filter(c => c.id !== id);
  }
  if (!cadet) return;
  if (to === 'unassigned') {
    S.unassigned = [...S.unassigned, cadet];
  } else {
    if (!S.platoons[to]) S.platoons[to] = [];
    S.platoons[to] = [...S.platoons[to], cadet];
  }
}

function onDrop(e, zone) {
  e.preventDefault();
  document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('dz-over'));
  if (S.dragging) {
    moveCadet(S.dragging.id, S.dragging.from, zone);
    S.dragging = null;
    render();
  }
}
window.onDrop = onDrop;

/* ================================================================
   EVENT ATTACHMENT
================================================================ */
function attachEvents() {
  // Sidebar Workspace Toggle
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.sidebarOpen = !S.sidebarOpen;
      render();
    });
  }

  // Profile panel -?? open/close
  document.querySelectorAll('[data-profile-btn]').forEach(btn => {
    btn.addEventListener('click', () => { S.profilePanel = !S.profilePanel; S.profileShowPw = false; S.editingProfile = false; render(); });
  });
  const profileClose = document.getElementById('profileClose');
  if (profileClose) profileClose.addEventListener('click', () => { S.profilePanel = false; S.editingProfile = false; render(); });
  const profileOverlay = document.getElementById('profileOverlay');
  if (profileOverlay) profileOverlay.addEventListener('click', () => { S.profilePanel = false; S.editingProfile = false; render(); });
  const profileLogout = document.getElementById('profileLogout');
  if (profileLogout) profileLogout.addEventListener('click', () => {
    if (window.logAudit) window.logAudit('Logged Out', 'Authentication', S.email, 'Logged out via user profile menu.', 'system');
    S.role = null; S.email = null; S.profilePanel = false; render();
  });
  const profilePwToggle = document.getElementById('profilePwToggle');
  if (profilePwToggle) profilePwToggle.addEventListener('click', () => { S.profileShowPw = !S.profileShowPw; render(); });

  const editProfileBtn = document.getElementById('editProfileBtn');
  if (editProfileBtn) editProfileBtn.addEventListener('click', () => { S.editingProfile = true; render(); });
  const cancelProfileBtn = document.getElementById('cancelProfileBtn');
  if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', () => { S.editingProfile = false; render(); });
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const newName = document.getElementById('editProfName')?.value || '';
      const newContact = document.getElementById('editProfContact')?.value || '';
      const newGmail = document.getElementById('editProfGmail')?.value || '';
      const newPassword = document.getElementById('editProfPassword')?.value || '';
      const newDegree = document.getElementById('editProfDegree')?.value || '';
      const newDegreeTitle = document.getElementById('editProfDegreeTitle')?.value || '';

      if (!newName.trim()) { alert('Full Name is required.'); return; }

      const profileKey = PROFILE_DATA[S.email] ? S.email : S.role;
      const pd = PROFILE_DATA[profileKey] || PROFILE_DATA[S.role] || {};
      if (pd) {
        const oldEmail = (pd.gmail || S.email || '').trim().toLowerCase();
        const normalizedGmail = newGmail.trim().toLowerCase() || oldEmail;

        pd.fullName = newName.trim();
        pd.contact = newContact.trim();
        pd.gmail = normalizedGmail;
        pd.password = newPassword.trim();
        pd.degree = newDegree;
        pd.degreeTitle = newDegreeTitle.trim();

        const cred = CREDENTIALS.find(c => c.email.toLowerCase() === oldEmail || c.email.toLowerCase() === String(S.email).toLowerCase());
        if (cred) {
          cred.email = normalizedGmail;
          cred.password = newPassword.trim();
        }

        if (oldEmail && oldEmail !== normalizedGmail) {
          delete PROFILE_DATA[oldEmail];
        }

        PROFILE_DATA[normalizedGmail] = pd;
        if (S.role) PROFILE_DATA[S.role] = pd;
        S.email = normalizedGmail;
      }

      S.editingProfile = false;
      showToast('Your profile has been updated successfully.', 'success', 'Profile Saved');
      render();
    });
  }

  // Notification bell -?? toggle slide-in panel
  const notifBellBtn = document.getElementById('notifBellBtn');
  if (notifBellBtn) {
    notifBellBtn.addEventListener('click', () => {
      S.notifPanel = !S.notifPanel;
      if (S.notifPanel && window.refreshNotifications) {
        window.refreshNotifications();
      }
      render();
    });
  }
  const notifClose = document.getElementById('notifClose');
  if (notifClose) notifClose.addEventListener('click', () => { S.notifPanel = false; render(); });
  const notifOverlay = document.getElementById('notifOverlay');
  if (notifOverlay) notifOverlay.addEventListener('click', () => { S.notifPanel = false; render(); });
  
  const notifMarkAll = document.getElementById('notifMarkAll');
  if (notifMarkAll) {
    notifMarkAll.addEventListener('click', () => {
      if (S.email && window.markAllNotificationsRead) {
        window.markAllNotificationsRead(S.email)
          .then(() => {
            if (window.refreshNotifications) window.refreshNotifications();
          });
      }
      S.notifPanel = false;
      render();
    });
  }

  // Individual notification click
  document.querySelectorAll('[data-notif-id]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.notifId;
      if (id && window.markNotificationRead) {
        window.markNotificationRead(id)
          .then(() => {
            if (window.refreshNotifications) window.refreshNotifications();
          });
      }
    });
  });

  // Audit Logs -?? Export CSV & Filter Button Click
  const auditFilterBtn = document.getElementById('auditFilterBtn');
  if (auditFilterBtn) {
    auditFilterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.showAuditFilterMenu = !S.showAuditFilterMenu;
      render();
    });
  }
  const auditSearchInput = document.getElementById('auditSearchInput');
  if (auditSearchInput) {
    auditSearchInput.addEventListener('input', (e) => {
      S.auditSearch = e.target.value;
      S.focusedFilterInputId = 'auditSearchInput';
      S.focusedFilterCursor = e.target.selectionStart;
      render();
    });
  }

  document.querySelectorAll('[data-audit-filter-opt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.auditFilter = btn.dataset.auditFilterOpt;
      S.showAuditFilterMenu = false;
      render();
    });
  });

  // Student Archive Events
  const archiveSearchInput = document.getElementById('archiveSearchInput');
  if (archiveSearchInput) {
    archiveSearchInput.addEventListener('input', (e) => {
      S.archiveSearch = e.target.value;
      S.focusedFilterInputId = 'archiveSearchInput';
      S.focusedFilterCursor = e.target.selectionStart;
      render();
    });
  }

  const archiveExportBtn = document.getElementById('archiveExportBtn');
  if (archiveExportBtn) {
    archiveExportBtn.addEventListener('click', () => {
      const entries = S.studentArchive || [];
      if (!entries.length) { alert('No archived records to export.'); return; }
      S.showExportModal = true;
      render();
    });
  }

  // Generate Report button
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      S.reportGenerated = true;
      if (!S.reportHistory) S.reportHistory = [];
      const typeLabels = { enrollment: 'Enrollment Summary', performance: 'Academic Performance', activities: 'Activity Accomplishment', instructors: 'Instructor Load Report', certificates: 'Certificate Issuance' };
      const filterDesc = [
        S.reportProgram !== 'All' ? S.reportProgram : 'All Programs',
        S.reportSemester !== 'All' ? S.reportSemester + ' Sem' : 'All Semesters',
        S.reportSchoolYear !== 'All' ? S.reportSchoolYear : 'All Years',
      ].join(' · ');
      S.reportHistory.push({
        label: typeLabels[S.reportType] || S.reportType,
        type: S.reportType,
        filters: filterDesc,
        records: '—',
        time: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
      });
      showToast('Report generated successfully. Use the export buttons to save.', 'success', 'Report Ready');
      render();
    });
  }

  // Export modal checkboxes and confirmation button
  document.querySelectorAll('[data-export-field]').forEach(chk => {
    chk.addEventListener('change', (e) => {
      if (!S.exportFields) S.exportFields = {};
      S.exportFields[e.target.dataset.exportField] = e.target.checked;
    });
  });

  const confirmExportBtn = document.getElementById('confirmExportBtn');
  if (confirmExportBtn) {
    confirmExportBtn.addEventListener('click', () => {
      const entries = S.studentArchive || [];
      if (!entries.length) { alert('No archived records to export.'); return; }

      const fields = S.exportFields || { studentNo: true, name: true, gender: true, section: true, program: true, instructor: true, finalGrade: true, remarks: true, dateArchived: true };

      const headerParts = [];
      if (fields.studentNo) headerParts.push('Student No');
      if (fields.name) headerParts.push('Student Name');
      if (fields.gender) headerParts.push('Gender');
      if (fields.section) headerParts.push('Section');
      if (fields.program) headerParts.push('Program');
      if (fields.instructor) headerParts.push('Instructor');
      if (fields.finalGrade) headerParts.push('Final Grade');
      if (fields.remarks) headerParts.push('Remarks');
      if (fields.dateArchived) headerParts.push('Date Archived');

      if (headerParts.length === 0) {
        alert('Please select at least one field to export.');
        return;
      }

      let csv = headerParts.join(',') + '\n';
      entries.forEach(st => {
        const rowParts = [];
        if (fields.studentNo) rowParts.push(`"${st.studentNo || ''}"`);
        if (fields.name) rowParts.push(`"${(st.name || '').replace(/"/g, '""')}"`);
        if (fields.gender) rowParts.push(`"${st.gender || ''}"`);
        if (fields.section) rowParts.push(`"${st.section || ''}"`);
        if (fields.program) rowParts.push(`"${st.collegeProgram || st.program || ''}"`);
        if (fields.instructor) rowParts.push(`"${(st.instructor || '').replace(/"/g, '""')}"`);
        if (fields.finalGrade) rowParts.push(st.finalGrade !== null && st.finalGrade !== undefined ? st.finalGrade : '');
        if (fields.remarks) rowParts.push(`"${st.remarks || ''}"`);
        if (fields.dateArchived) rowParts.push(`"${st.dateArchived || ''}"`);

        csv += rowParts.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `NSTP_Grades_Archive_${new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      S.showExportModal = false;
      render();
    });
  }

  // Sections & Students Filter
  const sectionsFilterBtn = document.getElementById('sectionsFilterBtn');
  if (sectionsFilterBtn) {
    sectionsFilterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.showSectionsFilterMenu = !S.showSectionsFilterMenu;
      render();
    });
  }
  const sectionsSearchInput = document.getElementById('sectionsSearchInput');
  if (sectionsSearchInput) {
    sectionsSearchInput.addEventListener('input', (e) => {
      S.secSearch = e.target.value;
      S.focusedFilterInputId = 'sectionsSearchInput';
      S.focusedFilterCursor = e.target.selectionStart;
      render();
    });
  }

  // Instructors Search Filter
  const instSearchInput = document.getElementById('instSearchInput');
  if (instSearchInput) {
    instSearchInput.addEventListener('input', (e) => {
      S.instSearch = e.target.value;
      S.focusedFilterInputId = 'instSearchInput';
      S.focusedFilterCursor = e.target.selectionStart;
      render();
    });
  }

  document.querySelectorAll('[data-inst-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.instTab = btn.dataset.instTab;
      S.instSearch = ''; // Clear search when clicking "All Sections"
      render();
    });
  });

  document.querySelectorAll('[data-sections-filter-opt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.secTab = btn.dataset.sectionsFilterOpt;
      S.showSectionsFilterMenu = false;
      render();
    });
  });

  // My Classes Filter
  const classesFilterBtn = document.getElementById('classesFilterBtn');
  if (classesFilterBtn) {
    classesFilterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.showClassesFilterMenu = !S.showClassesFilterMenu;
      render();
    });
  }
  const classesSearchInput = document.getElementById('classesSearchInput');
  if (classesSearchInput) {
    classesSearchInput.addEventListener('input', (e) => {
      S.classesSearch = e.target.value;
      S.focusedFilterInputId = 'classesSearchInput';
      S.focusedFilterCursor = e.target.selectionStart;
      render();
    });
  }

  document.querySelectorAll('[data-classes-filter-opt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.classesFilter = btn.dataset.classesFilterOpt;
      S.showClassesFilterMenu = false;
      render();
    });
  });

  // Assign Officer Section (Rosters) Filter
  const rostersFilterBtn = document.getElementById('rostersFilterBtn');
  if (rostersFilterBtn) {
    rostersFilterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.showRostersFilterMenu = !S.showRostersFilterMenu;
      render();
    });
  }
  const rosterSearchInput = document.getElementById('rosterSearchInput');
  if (rosterSearchInput) {
    rosterSearchInput.addEventListener('input', (e) => {
      S.rosterSearch = e.target.value;
      S.focusedFilterInputId = 'rosterSearchInput';
      S.focusedFilterCursor = e.target.selectionStart;
      render();
    });
  }
  const rosterSearchBtn = document.getElementById('rosterSearchBtn');
  if (rosterSearchBtn) {
    rosterSearchBtn.addEventListener('click', () => {
      render();
    });
  }

  document.querySelectorAll('[data-rosters-filter-opt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.rosterFilterPlatoon = btn.dataset.rostersFilterOpt;
      S.showRostersFilterMenu = false;
      render();
    });
  });

  // ROTC Calendar Filter
  const rCalFilterBtn = document.getElementById('rCalFilterBtn');
  if (rCalFilterBtn) {
    rCalFilterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.showRCalFilterMenu = !S.showRCalFilterMenu;
      render();
    });
  }
  const rCalSearchInput = document.getElementById('rCalSearchInput');
  if (rCalSearchInput) {
    rCalSearchInput.addEventListener('input', (e) => {
      S.calSearch = e.target.value;
      S.focusedFilterInputId = 'rCalSearchInput';
      S.focusedFilterCursor = e.target.selectionStart;
      render();
    });
  }

  document.querySelectorAll('[data-rcal-filter-opt]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.rCalFilter = btn.dataset.rcalFilterOpt;
      S.showRCalFilterMenu = false;
      render();
    });
  });

  // Keep focus on the active input and restore cursor position after DOM render updates
  if (S.focusedFilterInputId) {
    const inp = document.getElementById(S.focusedFilterInputId);
    if (inp) {
      inp.focus();
      const pos = S.focusedFilterCursor || inp.value.length;
      inp.setSelectionRange(pos, pos);
    }
    S.focusedFilterInputId = null;
    S.focusedFilterCursor = null;
  }

  // Global Outside Click Dropdown Dismissers
  if (!window.hasAuditFilterOutsideClickListener) {
    document.addEventListener('click', () => {
      let changed = false;
      if (S.showAuditFilterMenu) { S.showAuditFilterMenu = false; changed = true; }
      if (S.showSectionsFilterMenu) { S.showSectionsFilterMenu = false; changed = true; }
      if (S.showClassesFilterMenu) { S.showClassesFilterMenu = false; changed = true; }
      if (S.showRostersFilterMenu) { S.showRostersFilterMenu = false; changed = true; }
      if (S.showRCalFilterMenu) { S.showRCalFilterMenu = false; changed = true; }
      if (changed) render();
    });
    window.hasAuditFilterOutsideClickListener = true;
  }

  const exportAuditCSV = document.getElementById('exportAuditCSV');
  if (exportAuditCSV) exportAuditCSV.addEventListener('click', () => {
    const logs = [];
    const activeFilter = S.auditFilter || 'all';
    const filteredLogs = activeFilter === 'all' ? logs : logs.filter(l => l.type === activeFilter);
    const esc = v => `"${String(v).replace(/"/g, '""')}"`;
    const header = ['#', 'Actor', 'Action', 'Target / Description', 'Timestamp', 'Category'];
    const rows = filteredLogs.map((l, i) => [i + 1, l.actor, l.action, l.target, l.time, l.type].map(esc).join(','));
    const csv = [header.join(','), ...rows].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NSTP_Audit_Log_${activeFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Legacy Login logic removed

  // Logout
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.logAudit) window.logAudit('Logged Out', 'Authentication', S.email, 'Logged out via sidebar button.', 'system');
      S.role = null;
      S.email = null;
      render();
    });
  });

  // Nav items
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.nav;
      if (S.role === 'coordinator') S.coordPage = page;
      else if (S.role === 'instructor') S.instrPage = page;
      else if (S.role === 'admin') S.adminPage = page;
      else S.rotcPage = page;

      // Reset audit logs fetch flag if user navigates away from Audit Logs page
      if (page !== 'Audit Logs') {
        S._auditLogsFetched = false;
      }
      render();
    });
  });

  // Approval selection
  document.querySelectorAll('[data-approval]').forEach(el => {
    el.addEventListener('click', () => {
      S.selApproval = parseInt(el.dataset.approval);
      render();
    });
  });

  // Export Queue -?? PDF download
  const exportQueueBtn = document.getElementById('exportQueueBtn');
  if (exportQueueBtn) exportQueueBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date().toLocaleString();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 56, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NSTP -?? Pending Report Approvals', 40, 34);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported: ${now}`, 40, 48);

    // Table header
    let y = 80;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('#', 40, y);
    doc.text('Report Title', 65, y);
    doc.text('Instructor', 280, y);
    doc.text('Section', 390, y);
    doc.text('Submitted', 470, y);
    doc.text('Priority', 540, y);
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(40, y, pageW - 40, y);
    y += 14;

    // Rows
    doc.setFont('helvetica', 'normal');
    APPROVALS.forEach((a, i) => {
      doc.setTextColor(30, 41, 59);
      doc.text(String(i + 1), 40, y);
      doc.text(doc.splitTextToSize(a.title, 200)[0], 65, y);
      doc.text(a.instructor, 280, y);
      doc.text(a.section, 390, y);
      doc.text(a.submitted, 470, y);
      // Priority badge colour
      if (a.risk === 'Urgent') doc.setTextColor(220, 38, 38);
      else doc.setTextColor(100, 116, 139);
      doc.text(a.risk, 540, y);
      doc.setTextColor(30, 41, 59);
      y += 6;
      doc.setDrawColor(241, 245, 249);
      doc.line(40, y, pageW - 40, y);
      y += 14;
    });

    // Footer
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Total: ${APPROVALS.length} item(s) pending review  |  Aurora University -?? NSTP Program Office`, 40, y);

    doc.save('NSTP_Approval_Queue.pdf');
  });

  // Certificate generation helper
  function generateCertPDF(batch) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    const template = S.certTemplates.find(t => t.id === S.selectedTemplateId) || S.certTemplates[0];
    const palette = {
      indigo: { main: [79, 70, 229], light: [199, 210, 254] },
      emerald: { main: [16, 185, 129], light: [167, 243, 208] },
      amber: { main: [245, 158, 11], light: [253, 230, 138] },
      rose: { main: [244, 63, 94], light: [254, 205, 211] }
    };
    const pal = palette[template.color || 'indigo'] || palette.indigo;

    if (template.img) {
      let format = 'JPEG';
      if (template.img.startsWith('data:image/png')) format = 'PNG';
      else if (template.img.startsWith('data:image/gif')) format = 'GIF';
      doc.addImage(template.img, format, 0, 0, W, H);
    } else {
      // Outer border
      doc.setDrawColor(pal.main[0], pal.main[1], pal.main[2]);
      doc.setLineWidth(8);
      doc.rect(16, 16, W - 32, H - 32);
      doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]);
      doc.setLineWidth(2);
      doc.rect(24, 24, W - 48, H - 48);

      // Top banner
      doc.setFillColor(pal.main[0], pal.main[1], pal.main[2]);
      doc.rect(24, 24, W - 48, 48, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('DAVAO DEL NORTE STATE COLLEGE', W / 2, 53, { align: 'center' });
    }

    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', W / 2, 120, { align: 'center' });

    // Subtitle line
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('National Service Training Program (NSTP)', W / 2, 142, { align: 'center' });

    // Decorative line
    doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]);
    doc.setLineWidth(1.5);
    doc.line(80, 154, W - 80, 154);

    // Body text
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that all eligible students under', W / 2, 185, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(pal.main[0], pal.main[1], pal.main[2]);
    doc.text(batch.name, W / 2, 215, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`(${batch.count} students)  have successfully completed all requirements`, W / 2, 240, { align: 'center' });
    doc.text('of the National Service Training Program for Academic Year 2025 -?? 2026.', W / 2, 260, { align: 'center' });

    // Bottom line
    doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]);
    doc.setLineWidth(1.5);
    doc.line(80, 285, W - 80, 285);

    // Signature blocks
    const sigY = 330;
    const cols = [W * 0.22, W * 0.5, W * 0.78];
    const labels = ['NSTP Coordinator', 'College President', 'Registrar'];
    cols.forEach((x, i) => {
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(1);
      doc.line(x - 70, sigY, x + 70, sigY);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text(labels[i], x, sigY + 14, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('Davao Del Norte State College', x, sigY + 26, { align: 'center' });
    });

    // Date + control no.
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const issued = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Issued: ${issued}`, 40, H - 34);
    doc.text(`Control No.: NSTP-${Date.now().toString().slice(-6)}`, W - 40, H - 34, { align: 'right' });

    const safeName = batch.name.replace(/[^a-z0-9]/gi, '_');
    doc.save(`Certificate_${safeName}.pdf`);
  }

  // Per-row Generate buttons -?? open student modal
  document.querySelectorAll('[data-cert-batch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.certModal = parseInt(btn.dataset.certBatch);
      render();
    });
  });

  // Template selection buttons in the generation modal
  document.querySelectorAll('[data-select-tpl]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      S.selectedTemplateId = btn.dataset.selectTpl;
      render();
    });
  });

  // Batch card click -?? toggle delete button
  document.querySelectorAll('[data-batch-card]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-delete-batch]') || e.target.closest('[data-cert-batch]')) return;
      const bi = parseInt(card.dataset.batchCard);
      S.selectedBatchIdx = S.selectedBatchIdx === bi ? null : bi;
      render();
    });
  });

  // Delete batch card
  document.querySelectorAll('[data-delete-batch]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bi = parseInt(btn.dataset.deleteBatch);
      S.batches.splice(bi, 1);
      if (BATCH_STUDENTS[bi]) BATCH_STUDENTS.splice(bi, 1);
      S.selectedBatchIdx = null;
      render();
    });
  });

  // Cert modal close
  const certModalClose = document.getElementById('certModalClose');
  if (certModalClose) certModalClose.addEventListener('click', () => { S.certModal = null; render(); });
  const certModalOverlay = document.getElementById('certModalOverlay');
  if (certModalOverlay) certModalOverlay.addEventListener('click', e => { if (e.target === certModalOverlay) { S.certModal = null; render(); } });

  // Per-student certificate button
  function generateStudentCertPDF(studentName, batchIdx, serialNo) {
    const batch = S.batches[batchIdx];
    if (!batch) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    const template = S.certTemplates.find(t => t.id === S.selectedTemplateId) || S.certTemplates[0];
    const palette = {
      indigo: { main: [79, 70, 229], light: [199, 210, 254] },
      emerald: { main: [16, 185, 129], light: [167, 243, 208] },
      amber: { main: [245, 158, 11], light: [253, 230, 138] },
      rose: { main: [244, 63, 94], light: [254, 205, 211] }
    };
    const pal = palette[template.color || 'indigo'] || palette.indigo;

    if (template.img) {
      let format = 'JPEG';
      if (template.img.startsWith('data:image/png')) format = 'PNG';
      else if (template.img.startsWith('data:image/gif')) format = 'GIF';
      doc.addImage(template.img, format, 0, 0, W, H);
    } else {
      // Outer border
      doc.setDrawColor(pal.main[0], pal.main[1], pal.main[2]); doc.setLineWidth(8); doc.rect(16, 16, W - 32, H - 32);
      doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]); doc.setLineWidth(2); doc.rect(24, 24, W - 48, H - 48);
      // Banner
      doc.setFillColor(pal.main[0], pal.main[1], pal.main[2]); doc.rect(24, 24, W - 48, 48, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text('DAVAO DEL NORTE STATE COLLEGE', W / 2, 53, { align: 'center' });
    }

    // Title
    doc.setTextColor(30, 41, 59); doc.setFontSize(28); doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', W / 2, 116, { align: 'center' });
    doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
    doc.text('National Service Training Program (NSTP)', W / 2, 138, { align: 'center' });
    doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]); doc.setLineWidth(1.5); doc.line(80, 150, W - 80, 150);
    // Body
    doc.setFontSize(12); doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', W / 2, 178, { align: 'center' });
    // Student name -?? large and prominent
    doc.setFontSize(26); doc.setFont('helvetica', 'bold'); doc.setTextColor(pal.main[0], pal.main[1], pal.main[2]);
    doc.text(studentName, W / 2, 210, { align: 'center' });
    // Serial number directly below name
    const certNo = serialNo || `NSTP-${Date.now().toString().slice(-6)}`;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
    doc.text(`Serial No.: ${certNo}`, W / 2, 226, { align: 'center' });
    // Program line
    doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 41, 59);
    doc.text('has successfully completed all requirements of the', W / 2, 250, { align: 'center' });
    doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
    doc.text(`${batch.program} -?? ${batch.name}`, W / 2, 272, { align: 'center' });
    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text('for Academic Year 2025 -?? 2026.', W / 2, 292, { align: 'center' });
    doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]); doc.setLineWidth(1.5); doc.line(80, 308, W - 80, 308);
    // Signatures
    const sigY = 352;
    [W * 0.22, W * 0.5, W * 0.78].forEach((x, i) => {
      const lbl = ['NSTP Coordinator', 'College President', 'Registrar'][i];
      doc.setDrawColor(148, 163, 184); doc.setLineWidth(1); doc.line(x - 70, sigY, x + 70, sigY);
      doc.setFontSize(9); doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold'); doc.text(lbl, x, sigY + 14, { align: 'center' });
      doc.setFont('helvetica', 'normal'); doc.text('Davao Del Norte State College', x, sigY + 26, { align: 'center' });
    });
    // Footer
    const issued = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(8); doc.setTextColor(148, 163, 184);
    doc.text(`Issued: ${issued}`, 40, H - 34);
    doc.text(`Certificate No.: ${certNo}`, W - 40, H - 34, { align: 'right' });
    const safe = studentName.replace(/[^a-z0-9]/gi, '_');
    doc.save(`Certificate_${safe}.pdf`);
  }

  document.querySelectorAll('[data-student-cert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const si = parseInt(btn.dataset.studentCert);
      const bi = parseInt(btn.dataset.batchIdx);
      const batch = S.batches[bi];
      const student = BATCH_STUDENTS[bi]?.[si];
      if (!student || !batch) return;
      const name = typeof student === 'string' ? student : student.name;
      const serialNo = typeof student === 'string' ? `NSTP-${Date.now().toString().slice(-6)}` : (student.serialNo || `NSTP-${Date.now().toString().slice(-6)}`);
      generateStudentCertPDF(name, bi, serialNo);
      // Add to Recently Issued
      S.recentCerts.unshift({
        name,
        program: batch.program,
        id: serialNo,
        issued: 'Just now'
      });

      if (window.logAudit) window.logAudit('Generated', 'Certificates', name, `Issued individual NSTP certificate for ${name} (${batch.program}). Control No: ${serialNo}`, 'system');

      showToast(`Certificate generated for <strong>${name}</strong>.`, 'success', 'Certificate Issued');
      render();
    });
  });

  // Generate All from modal footer
  const certModalGenAll = document.getElementById('certModalGenAll');
  if (certModalGenAll) certModalGenAll.addEventListener('click', () => {
    const bi = S.certModal;
    if (bi === null) return;
    const batch = S.batches[bi];
    const students = BATCH_STUDENTS[bi] || [];
    if (!students.length) return;
    // Generate PDFs staggered -?? pass each student's real serial number
    students.forEach((student, i) => {
      const name = typeof student === 'string' ? student : student.name;
      const serialNo = typeof student === 'string' ? `NSTP-${Date.now().toString().slice(-6)}-${i + 1}` : (student.serialNo || `NSTP-${Date.now().toString().slice(-6)}-${i + 1}`);
      setTimeout(() => generateStudentCertPDF(name, bi, serialNo), i * 300);
    });
    // Add all to Recently Issued at once
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    students.forEach(student => {
      const name = typeof student === 'string' ? student : student.name;
      const serialNo = typeof student === 'string' ? `NSTP-${Date.now().toString().slice(-6)}` : (student.serialNo || `NSTP-${Date.now().toString().slice(-6)}`);
      S.recentCerts.unshift({
        name,
        program: batch?.program || 'NSTP',
        id: serialNo,
        issued: 'Today ' + timeStr
      });
    });

    if (window.logAudit) window.logAudit('Generated', 'Certificates', batch.name, `Issued batch NSTP certificates for ${batch.name} (${students.length} certs).`, 'system');

    showToast(`<strong>${students.length}</strong> certificate(s) generated for ${batch?.name || 'batch'}.`, 'success', 'Batch Generated');
    S.certModal = null;
    render();
  });

  // Generate Batch (all) header button -?? generate batch PDFs
  const generateBatchAllBtn = document.getElementById('generateBatchAllBtn');
  if (generateBatchAllBtn) generateBatchAllBtn.addEventListener('click', () => {
    S.batches.forEach((b, i) => setTimeout(() => generateCertPDF(b), i * 400));
  });

  // Recently Issued list item click -?? toggle delete button
  document.querySelectorAll('[data-recent-item]').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('[data-delete-recent]')) return;
      const ri = parseInt(item.dataset.recentItem);
      S.selectedRecentCertIdx = S.selectedRecentCertIdx === ri ? null : ri;
      render();
    });
  });

  // Delete recent certificate
  document.querySelectorAll('[data-delete-recent]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ri = parseInt(btn.dataset.deleteRecent);
      S.recentCerts.splice(ri, 1);
      S.selectedRecentCertIdx = null;
      render();
    });
  });

  // Certificates -?? Import XLSX: process files and add to S.batches + BATCH_STUDENTS
  const certXlsxBtn = document.getElementById('certXlsxBtn');
  const certXlsxInput = document.getElementById('certXlsxInput');
  if (certXlsxBtn) certXlsxBtn.addEventListener('click', () => certXlsxInput && certXlsxInput.click());
  if (certXlsxInput) {
    certXlsxInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          if (!rows.length) {
            showToast('No data rows found in the XLSX file.', 'error', 'Import Failed');
            return;
          }

          const students = [];
          let sectionCode = '';
          let programName = '';

          rows.forEach(row => {
            const getVal = (...keys) => {
              for (const k of keys) {
                const found = Object.keys(row).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
                if (found !== undefined && row[found] !== '') return String(row[found]).trim();
              }
              return '';
            };

            const name = getVal(
              'Name', 'Student Name', 'Full Name', 'Student_Name', 'Student', 'STUDENT NAME'
            );
            if (!name) return; // skip blank rows

            // Read serial / certificate number column
            const serialNo = getVal(
              'Serial No', 'Serial Number', 'Cert No', 'Certificate No',
              'Control No', 'ID', 'Student No', 'Serial', 'SERIAL NO', 'SERIAL NUMBER'
            ) || `NSTP-${Date.now().toString().slice(-6)}-${students.length + 1}`;

            students.push({ name, serialNo });

            if (!sectionCode) sectionCode = getVal('Section Code', 'Section', 'Class', 'section');
            if (!programName) programName = getVal('Program', 'NSTP Program', 'Component', 'programme');
          });

          if (!students.length) {
            showToast('No student names found. Ensure a "Name" or "Student Name" column exists.', 'error', 'Import Failed');
            return;
          }

          const fileNameNoExt = file.name.replace(/\.[^/.]+$/, '');
          const detectedSection = sectionCode || 'Imported';
          const detectedProgram = programName || (
            file.name.toUpperCase().includes('LTS') ? 'LTS' :
              file.name.toUpperCase().includes('ROTC') ? 'ROTC' : 'CWTS'
          );
          // Use the actual filename as the batch name for traceability
          const batchName = fileNameNoExt;
          const newBatchIdx = S.batches.length;

          // Store full student objects in BATCH_STUDENTS
          BATCH_STUDENTS.push(students);

          // Add batch to state -?? include fileName for display on the card
          S.batches.push({
            name: batchName,
            fileName: file.name,
            section: detectedSection,
            count: students.length,
            status: 'Ready',
            date: 'Eligible Today',
            program: detectedProgram
          });

          // Highlight the new batch briefly
          S.newlyImportedBatchIndex = newBatchIdx;
          setTimeout(() => {
            if (S.newlyImportedBatchIndex === newBatchIdx) {
              S.newlyImportedBatchIndex = null;
              render();
            }
          }, 5000);

          certXlsxInput.value = '';
          showToast(
            `<strong>${batchName}</strong> imported -?? ${students.length} student(s) ready.`,
            'success', 'Batch Imported'
          );
          render();

        } catch (err) {
          showToast('Failed to read the XLSX file. Please check the file format.', 'error', 'Import Failed');
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // OCR Export XLSX -?? per processed upload
  document.querySelectorAll('[data-export-row]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ri = parseInt(btn.dataset.exportRow);
      const upload = S.ocrUploads[ri];
      if (!upload) return;
      const sectionCode = upload.section;
      // Build student rows from SECTION_STUDENTS, falling back to generated names
      const knownStudents = SECTION_STUDENTS[sectionCode] || [];
      const wb = XLSX.utils.book_new();
      // Collect all sections to export (include all known sections for a full section export)
      const sectionsToExport = Object.keys(SECTION_STUDENTS).length
        ? Object.keys(SECTION_STUDENTS)
        : [sectionCode];
      sectionsToExport.forEach(sec => {
        const students = SECTION_STUDENTS[sec] || [];
        const rows = [['#', 'Student Name', 'Student No.', 'Section', 'Program', 'Status', 'Exported']];
        students.forEach((st, i) => {
          const sName = typeof st === 'string' ? st : st.name;
          const sNo = typeof st === 'string' ? '-??' : st.studentNo;
          const sProg = typeof st === 'string' ? sec.replace(/-\d+[A-Z]$/, '') : st.program;
          rows.push([i + 1, sName, sNo, sec, sProg, 'Passed', new Date().toLocaleDateString('en-PH')]);
        });
        const ws = XLSX.utils.aoa_to_sheet(rows);
        // Column widths
        ws['!cols'] = [{ wch: 4 }, { wch: 24 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 16 }];
        XLSX.utils.book_append_sheet(wb, ws, sec);
      });
      const fileName = `NSTP_Students_${sectionCode}_${Date.now().toString().slice(-6)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    });
  });

  // OCR upload -?? file input & drag-drop
  const ocrDropZone = document.getElementById('ocrDropZone');
  const ocrFileInput = document.getElementById('ocrFileInput');
  function handleOCRFiles(files) {
    const maxMB = 25;
    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls'].includes(ext)) {
        alert(`"${file.name}" is not supported. Please upload XLSX or XLS files only.`);
        return;
      }
      if (file.size > maxMB * 1024 * 1024) {
        alert(`"${file.name}" exceeds the 25 MB limit.`);
        return;
      }

      const now = new Date();
      const h = now.getHours();
      const timeStr = `Today ${h}:${String(now.getMinutes()).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
      const entry = { file: file.name, section: '-??', students: 0, status: 'Processing', time: timeStr, results: null };
      S.ocrUploads.unshift(entry);
      render();

      // -??-?? Real XLSX parse -??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??-??
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

          if (!rows.length) {
            const idx = S.ocrUploads.indexOf(entry);
            if (idx !== -1) S.ocrUploads[idx] = { ...entry, status: 'Failed', results: [] };
            showToast(`No data found in <strong>${file.name}</strong>.`, 'error', 'Import Failed');
            render();
            return;
          }

          // Flexible column name resolver
          const getCol = (row, ...keys) => {
            for (const k of keys) {
              const found = Object.keys(row).find(
                rk => rk.trim().toLowerCase() === k.toLowerCase()
              );
              if (found !== undefined && String(row[found]).trim() !== '') return String(row[found]).trim();
            }
            return '';
          };

          // Grade classification: 1.0-??2.5 -?? Passed, 2.75-??5.0 -?? Failed
          const classify = (rawGrade) => {
            const g = parseFloat(rawGrade);
            if (isNaN(g)) return 'N/A';
            if (g >= 1.0 && g <= 2.5) return 'Passed';
            if (g >= 2.75 && g <= 5.0) return 'Failed';
            return 'N/A';
          };

          let sectionCode = '';
          const results = [];

          rows.forEach(row => {
            const name = getCol(row,
              'Student Name', 'Name', 'Full Name', 'Student',
              'Lastname, Firstname', 'Student_Name', 'STUDENT NAME', 'FULLNAME'
            );
            const grade = getCol(row,
              'Grade', 'Final Grade', 'Final_Grade',
              'GWA', 'Score', 'Rating', 'Grades', 'GRADE', 'FINAL GRADE'
            );
            const sec = getCol(row, 'Section', 'Section Code', 'Class', 'SECTION');

            if (!sectionCode && sec) sectionCode = sec;
            if (!name) return; // skip blank / header-only rows

            results.push({
              name,
              grade: grade || '-??',
              remarks: classify(grade),
              gradeNum: parseFloat(grade) || null
            });
          });

          // Infer section from filename when not present in data
          if (!sectionCode) {
            sectionCode = file.name
              .replace(/\.(xlsx|xls)$/i, '')
              .replace(/[_\s]+/g, '-')
              .split('-').slice(0, 2).join('-') || 'Imported';
          }

          const passCount = results.filter(r => r.remarks === 'Passed').length;
          const failCount = results.filter(r => r.remarks === 'Failed').length;
          const overallStatus = results.length === 0 ? 'Failed'
            : failCount === 0 ? 'Passed' : 'Passed'; // always "Passed" if file parsed ok

          const idx = S.ocrUploads.indexOf(entry);
          if (idx !== -1) {
            S.ocrUploads[idx] = {
              ...entry,
              section: sectionCode,
              students: results.length,
              status: overallStatus,
              passCount,
              failCount,
              results
            };

            // Sync grades instantly to Student Archive
            results.forEach(res => {
              const sName = res.name.trim();
              const existIdx = S.studentArchive.findIndex(s => {
                const clean = str => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
                const a = clean(s.name);
                const b = clean(sName);
                if (a === b) return true;
                const pA = a.split(' ');
                const pB = b.split(' ');
                if (pA.length > 1 && pB.length > 1) {
                  return pA[0] === pB[0] && pA[1] === pB[1];
                }
                return false;
              });
              const parsedGrade = res.gradeNum;
              const parsedRemarks = res.remarks;
              const ucSec = sectionCode.toUpperCase();
              const prog = ucSec.includes('ROTC') ? 'ROTC' : (ucSec.includes('LTS') ? 'LTS' : 'CWTS');

              const gradeRecord = {
                finalGrade: parsedGrade !== null ? parsedGrade : 1.5,
                remarks: parsedRemarks !== 'N/A' ? parsedRemarks : 'Passed',
                section: sectionCode,
                program: prog,
                schoolYear: '2025-2026',
                semester: '1st Semester',
                dateArchived: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              };

              if (existIdx !== -1) {
                if (!S.studentArchive[existIdx].grades) {
                  S.studentArchive[existIdx].grades = [];
                  if (S.studentArchive[existIdx].finalGrade !== null && S.studentArchive[existIdx].finalGrade !== undefined) {
                    S.studentArchive[existIdx].grades.push({
                      finalGrade: S.studentArchive[existIdx].finalGrade,
                      remarks: S.studentArchive[existIdx].remarks || 'Passed',
                      section: S.studentArchive[existIdx].section,
                      program: S.studentArchive[existIdx].program,
                      schoolYear: S.studentArchive[existIdx].schoolYear || '2025-2026',
                      semester: S.studentArchive[existIdx].semester || '1st Semester',
                      dateArchived: S.studentArchive[existIdx].dateArchived
                    });
                  }
                }
                S.studentArchive[existIdx].grades.push(gradeRecord);
                S.studentArchive[existIdx].finalGrade = gradeRecord.finalGrade;
                S.studentArchive[existIdx].remarks = gradeRecord.remarks;
              } else {
                S.studentArchive.push({
                  studentNo: `2024-${String(Math.floor(10000 + Math.random() * 90000))}`,
                  name: sName,
                  gender: 'Female', // Default fallback
                  section: '', // Section remains blank unless assigned via master list/section setup
                  program: prog,
                  instructor: 'Prof. Julian Santos', // Default fallback
                  finalGrade: gradeRecord.finalGrade,
                  remarks: gradeRecord.remarks,
                  schoolYear: '2025-2026',
                  semester: '1st Semester',
                  dateArchived: gradeRecord.dateArchived,
                  grades: [gradeRecord]
                });
              }
            });
          }

          showToast(
            `<strong>${file.name}</strong> -?? ${passCount} passed, ${failCount} failed.`,
            'success',
            'Grades Imported'
          );
          render();

        } catch (err) {
          const idx = S.ocrUploads.indexOf(entry);
          if (idx !== -1) S.ocrUploads[idx] = { ...entry, status: 'Failed', results: [] };
          showToast(`Failed to read <strong>${file.name}</strong>. Check file format.`, 'error', 'Import Failed');
          render();
          console.error('XLSX parse error:', err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
    // Reset input so same file can be re-selected
    if (ocrFileInput) ocrFileInput.value = '';
  }
  if (ocrDropZone) {
    ocrDropZone.addEventListener('click', () => ocrFileInput && ocrFileInput.click());
    ocrDropZone.addEventListener('dragover', e => { e.preventDefault(); ocrDropZone.classList.add('bg-indigo-100'); });
    ocrDropZone.addEventListener('dragleave', () => ocrDropZone.classList.remove('bg-indigo-100'));
    ocrDropZone.addEventListener('drop', e => { e.preventDefault(); ocrDropZone.classList.remove('bg-indigo-100'); handleOCRFiles(e.dataTransfer.files); });
  }
  if (ocrFileInput) {
    ocrFileInput.addEventListener('click', e => e.stopPropagation());
    ocrFileInput.addEventListener('change', e => handleOCRFiles(e.target.files));
  }

  // Calendar form open
  const calOpen = document.getElementById('calFormOpen');
  if (calOpen) calOpen.addEventListener('click', () => { S.calForm = true; render(); });
  const calClose = document.getElementById('calFormClose');
  if (calClose) calClose.addEventListener('click', () => { S.calForm = false; render(); });
  const calCancel = document.getElementById('calCancel');
  if (calCancel) calCancel.addEventListener('click', () => { S.calForm = false; render(); });

  // Calendar submit all drafts
  const calSubmitAll = document.getElementById('calSubmitAll');
  if (calSubmitAll) calSubmitAll.addEventListener('click', () => {
    S.activities = S.activities.map(a => a.status === 'Draft' ? { ...a, status: 'Submitted' } : a);
    render();
  });

  // Calendar create
  const calCreate = document.getElementById('calCreate');
  if (calCreate) calCreate.addEventListener('click', () => {
    const title = document.getElementById('calTitle')?.value?.trim();
    const date = document.getElementById('calDate')?.value;
    if (!title) return;
    S.activities = [...S.activities, {
      title, date: date || 'TBD',
      time: document.getElementById('calTime')?.value || 'TBD',
      venue: document.getElementById('calVenue')?.value || 'TBD',
      scope: document.getElementById('calScope')?.value || 'All Programs',
      color: 'bg-violet-500', status: 'Draft'
    }];
    S.calForm = false;
    render();
  });

  // Calendar create & submit
  const calCS = document.getElementById('calCreateSubmit');
  if (calCS) calCS.addEventListener('click', () => {
    const title = document.getElementById('calTitle')?.value?.trim();
    if (!title) return;
    S.activities = [...S.activities, {
      title, date: document.getElementById('calDate')?.value || 'TBD',
      time: document.getElementById('calTime')?.value || 'TBD',
      venue: document.getElementById('calVenue')?.value || 'TBD',
      scope: document.getElementById('calScope')?.value || 'All Programs',
      color: 'bg-violet-500', status: 'Submitted'
    }];
    S.calForm = false;
    render();
  });

  // Import XLSX -?? read workbook and populate SECTIONS & Student Archive
  const importXlsxBtn = document.getElementById('importXlsxBtn');
  const xlsxImportInput = document.getElementById('xlsxImportInput');
  if (importXlsxBtn) importXlsxBtn.addEventListener('click', () => xlsxImportInput && xlsxImportInput.click());
  if (xlsxImportInput) xlsxImportInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/students/import', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
      if (status !== 200) {
        throw new Error(body.message || 'Failed to import master list.');
      }
      
      // Reload everything from DB
      const loads = [];
      if (window.loadStudentsFromDatabase) loads.push(window.loadStudentsFromDatabase());
      if (window.loadSectionsFromDatabase) loads.push(window.loadSectionsFromDatabase());
      if (window.fetchDashboardMetrics) loads.push(window.fetchDashboardMetrics().catch(() => {}));
      
      Promise.all(loads).finally(() => {
        render();
        alert(`Student Master List imported successfully!\n- ${body.imported_students} student record(s) saved.\n- ${body.imported_sections} new section(s) registered.`);
      });
    })
    .catch(err => {
      alert('Import failed: ' + err.message);
      console.error(err);
    })
    .finally(() => {
      xlsxImportInput.value = '';
    });
  });

  // Modal -?? Import XLSX: auto-fill form fields from first data row
  const modalXlsxBtn = document.getElementById('modalXlsxBtn');
  const modalXlsxInput = document.getElementById('modalXlsxInput');
  if (modalXlsxBtn) modalXlsxBtn.addEventListener('click', () => modalXlsxInput && modalXlsxInput.click());
  if (modalXlsxInput) modalXlsxInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];

        // Dynamically scan sheet cells to locate student headers (supports custom headers / top title rows)
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z100');
        let headerRowIndex = -1;
        for (let r = range.s.r; r <= range.e.r; r++) {
          let foundHeader = false;
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            const cellVal = ws[cellRef]?.v;
            if (cellVal && typeof cellVal === 'string') {
              const cleanVal = cellVal.trim().toLowerCase();
              const knownHeaders = [
                'last name', 'first name', 'lastname', 'firstname', 'last', 'first',
                'email address', 'email', 'student name', 'student_name', 'name', 'full name', 'fullname',
                'student no', 'student number', 'student_no', 'student_number', 'id'
              ];
              if (knownHeaders.includes(cleanVal)) {
                foundHeader = true;
                headerRowIndex = r;
                break;
              }
            }
          }
          if (foundHeader) break;
        }

        const rows = XLSX.utils.sheet_to_json(ws, {
          range: headerRowIndex !== -1 ? headerRowIndex : 0,
          defval: ''
        });

        if (!rows.length) { alert('No data rows found in the XLSX file.'); return; }

        const firstRow = rows[0];
        const getVal = (...keys) => {
          for (const k of keys) {
            const found = Object.keys(firstRow).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
            if (found !== undefined && firstRow[found] !== '') return String(firstRow[found]).trim();
          }
          return '';
        };

        const titleCase = (str) => {
          if (!str) return '';
          return str.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        };

        // Parse student records from sheet
        const importedSts = [];
        rows.forEach(row => {
          const getRowVal = (...keys) => {
            for (const k of keys) {
              const found = Object.keys(row).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
              if (found !== undefined && row[found] !== '') return String(row[found]).trim();
            }
            return '';
          };

          let fullName = '';
          const singleName = getRowVal('Student Name', 'Student_Name', 'Name', 'Full Name', 'FullName');
          if (singleName) {
            fullName = titleCase(singleName);
          } else {
            const lastName = titleCase(getRowVal('Last Name', 'LastName', 'Last'));
            const firstName = titleCase(getRowVal('First Name', 'FirstName', 'First'));
            const middleName = titleCase(getRowVal('Middle Name', 'MiddleName', 'Middle'));

            if (lastName || firstName) {
              const middleInitial = middleName ? middleName.charAt(0).toUpperCase() + '.' : '';
              fullName = `${lastName}, ${firstName} ${middleInitial}`.trim();
            }
          }

          if (!fullName) return; // skip empty rows

          const collegeProgram = getRowVal('Program', 'Course', 'College Program', 'College_Program', 'college_program');

          importedSts.push({
            studentNo: getRowVal('Student No', 'Student Number', 'ID', 'Student_No', 'Student_Number') || `2024-${String(Math.floor(10000 + Math.random() * 90000))}`,
            name: fullName,
            program: collegeProgram || 'BSIT',
            dob: getRowVal('Date of Birth', 'DOB', 'Birthday', 'Birth Date', 'Birth_Date'),
            birthPlace: getRowVal('Place of Birth', 'POB', 'Birthplace', 'Place_of_Birth'),
            gender: titleCase(getRowVal('Gender', 'Sex')) || 'Female',
            address: getRowVal('Residential Address', 'Address', 'Residential_Address'),
            cellNo: getRowVal('Cell #', 'Cell Number', 'Phone', 'Cell_No', 'Contact'),
            email: getRowVal('Email Address', 'Email', 'Gmail', 'Email_Address')
          });
        });

        S.modalImportedStudents = importedSts;

        // Auto-fill fields
        const fill = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };

        // Try to infer section code from file name or sheet name, or fallback
        const inferredSecCode = file.name.replace(/\.[^/.]+$/, "").replace(/_/, " ").trim();
        fill('secCode', getVal('Section Code', 'Section', 'Class') || inferredSecCode);
        fill('secProgram', getVal('Program', 'Programme', 'Course') || (file.name.toUpperCase().includes('ROTC') ? 'ROTC' : (file.name.toUpperCase().includes('LTS') ? 'LTS' : 'CWTS')));
        fill('secSchoolYear', getVal('School Year', 'Year', 'school_year') || '2025-2026');
        fill('secInstructor', getVal('Instructor', 'Teacher', 'Faculty') || 'Prof. Julian Santos');
        fill('secRoom', getVal('Room', 'Venue', 'Location') || 'TBA');

        if (document.getElementById('secStudents')) {
          document.getElementById('secStudents').value = importedSts.length;
        }

        modalXlsxInput.value = '';
        // Visual feedback on the button
        if (modalXlsxBtn) {
          modalXlsxBtn.textContent = '-?? ' + importedSts.length + ' Students loaded from ' + file.name;
          modalXlsxBtn.classList.add('border-emerald-500', 'bg-emerald-100', 'text-emerald-800');
        }
      } catch (err) {
        alert('Could not read the XLSX file. Please make sure it is a valid Excel workbook.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });

  // New Section modal
  const newSectionBtn = document.getElementById('newSectionBtn');
  if (newSectionBtn) newSectionBtn.addEventListener('click', () => { S.sectionForm = true; render(); });
  const sectionFormClose = document.getElementById('sectionFormClose');
  if (sectionFormClose) sectionFormClose.addEventListener('click', () => { S.sectionForm = false; render(); });
  const sectionFormCancel = document.getElementById('sectionFormCancel');
  if (sectionFormCancel) sectionFormCancel.addEventListener('click', () => { S.sectionForm = false; render(); });
  const newSectionOverlay = document.getElementById('newSectionOverlay');
  if (newSectionOverlay) newSectionOverlay.addEventListener('click', e => { if (e.target === newSectionOverlay) { S.sectionForm = false; render(); } });
  const sectionFormCreate = document.getElementById('sectionFormCreate');
  if (sectionFormCreate) sectionFormCreate.addEventListener('click', () => {
    const code = document.getElementById('secCode')?.value?.trim();
    if (!code) { document.getElementById('secCode').focus(); return; }
    const instructor = document.getElementById('secInstructor')?.value?.trim() || '';
    const program = document.getElementById('secProgram')?.value || 'CWTS';
    const schoolYear = document.getElementById('secSchoolYear')?.value?.trim() || '2025-2026';
    const room = document.getElementById('secRoom')?.value?.trim() || 'TBA';
    let students = parseInt(document.getElementById('secStudents')?.value) || 0;

    if (S.modalImportedStudents && S.modalImportedStudents.length > 0) {
      SECTION_STUDENTS[code] = S.modalImportedStudents;
      students = S.modalImportedStudents.length;
    }

    const payload = { code, program, schoolYear, students, instructor: instructor || 'TBA', room, status: 'Active' };
    SECTIONS.push(payload);
    // Archive sync removed — students are only archived on delete.
    S.modalImportedStudents = null;

    if (window.createSectionInDatabase) {
      window.createSectionInDatabase(payload)
        .then(() => {
          // Auto-assign instructor if selected
          if (instructor) {
            const instObj = (S.instructors || []).find(i => i.name === instructor);
            if (instObj && instObj.email) {
              return window.assignInstructorToSection(code, instObj.email).catch(console.error);
            }
          }
        })
        .then(() => {
          // Reload sections from DB so instructor interface reflects the new section immediately
          if (window.loadSectionsFromDatabase) {
            window.loadSectionsFromDatabase().then(() => render()).catch(console.error);
          }
        })
        .catch(err => console.error('Failed to create section in DB:', err));
    }

    if (window.logAudit) window.logAudit('Created', 'Sections', code, `Created section ${code} (${program}) with ${students} students.`, 'edit');

    S.sectionForm = false;
    showToast(`Section <strong>${code}</strong> created successfully.`, 'success', 'Section Created');
    render();
  });

  // Program tab buttons
  document.querySelectorAll('[data-sec-tab]').forEach(btn => {
    btn.addEventListener('click', () => { S.secTab = btn.dataset.secTab; S.selectedSection = null; render(); });
  });

  // Section row click -?? show detail panel
  document.querySelectorAll('[data-sec-row]').forEach(row => {
    row.addEventListener('click', () => {
      S.selectedSection = S.selectedSection === row.dataset.secRow ? null : row.dataset.secRow;
      render();
    });
  });
  // Section modal close
  const sectionModalClose = document.getElementById('sectionModalClose');
  if (sectionModalClose) sectionModalClose.addEventListener('click', () => { S.selectedSection = null; S.selectedStudentRow = null; render(); });
  const sectionModalOverlay = document.getElementById('sectionModalOverlay');
  if (sectionModalOverlay) sectionModalOverlay.addEventListener('click', e => { if (e.target === sectionModalOverlay) { S.selectedSection = null; S.selectedStudentRow = null; render(); } });

  // Student row click -?? select/deselect to show Delete button
  document.querySelectorAll('[data-student-row]').forEach(tr => {
    tr.addEventListener('click', () => {
      const idx = parseInt(tr.dataset.studentRow);
      S.selectedStudentRow = S.selectedStudentRow === idx ? null : idx;
      render();
    });
  });

  // ROTC Cadet row click -?? select/deselect to show Remove button
  document.querySelectorAll('[data-rotc-student-row]').forEach(tr => {
    tr.addEventListener('click', () => {
      const idx = parseInt(tr.dataset.rotcStudentRow);
      S.selectedStudentRow = S.selectedStudentRow === idx ? null : idx;
      render();
    });
  });

  // ROTC Platoon Modal overlay click
  const platoonModalOverlay = document.getElementById('platoonModalOverlay');
  if (platoonModalOverlay) platoonModalOverlay.addEventListener('click', e => { if (e.target === platoonModalOverlay) { S.selectedPlatoon = null; S.selectedStudentRow = null; render(); } });

  // Platoon row click -> show detail panel
  document.querySelectorAll('[data-plat-row]').forEach(row => {
    row.addEventListener('click', () => {
      S.selectedPlatoon = S.selectedPlatoon === row.dataset.platRow ? null : row.dataset.platRow;
      render();
    });
  });

  // New Platoon Modal
  const newPlatoonBtn = document.getElementById('newPlatoonBtn');
  if (newPlatoonBtn) newPlatoonBtn.addEventListener('click', () => { S.platoonForm = true; render(); });
  const platoonFormClose = document.getElementById('platoonFormClose');
  if (platoonFormClose) platoonFormClose.addEventListener('click', () => { S.platoonForm = false; render(); });
  const platoonFormCancel = document.getElementById('platoonFormCancel');
  if (platoonFormCancel) platoonFormCancel.addEventListener('click', () => { S.platoonForm = false; render(); });
  const newPlatoonOverlay = document.getElementById('newPlatoonOverlay');
  if (newPlatoonOverlay) newPlatoonOverlay.addEventListener('click', e => { if (e.target === newPlatoonOverlay) { S.platoonForm = false; render(); } });
  const platoonFormCreate = document.getElementById('platoonFormCreate');
  if (platoonFormCreate) platoonFormCreate.addEventListener('click', () => {
    const name = document.getElementById('platNameInput')?.value?.trim();
    const sem = document.getElementById('platStatusInput')?.value || '1st Semester';
    if (!name) { document.getElementById('platNameInput').focus(); return; }
    if (!S.platoons[name]) S.platoons[name] = [];
    if (!S.platoonSemesters) S.platoonSemesters = {};
    S.platoonSemesters[name] = sem;
    S.platoonForm = false;
    showToast(`Platoon <strong>${name}</strong> has been created.`, 'success', 'Platoon Created');
    render();
  });

  // Import Platoon XLSX logic
  const importPlatXlsxBtn = document.getElementById('importPlatXlsxBtn');
  const platXlsxImportInput = document.getElementById('platXlsxImportInput');
  if (importPlatXlsxBtn && platXlsxImportInput) {
    importPlatXlsxBtn.addEventListener('click', () => platXlsxImportInput.click());
    platXlsxImportInput.addEventListener('change', e => {
      if (e.target.files.length) { alert('Master list uploaded. (Simulation)'); platXlsxImportInput.value = ''; }
    });
  }

  const modalPlatXlsxBtn = document.getElementById('modalPlatXlsxBtn');
  const modalPlatXlsxInput = document.getElementById('modalPlatXlsxInput');
  if (modalPlatXlsxBtn && modalPlatXlsxInput) {
    modalPlatXlsxBtn.addEventListener('click', () => modalPlatXlsxInput.click());
    modalPlatXlsxInput.addEventListener('change', e => {
      if (e.target.files.length) {
        modalPlatXlsxBtn.textContent = '-?? ' + e.target.files[0].name;
        modalPlatXlsxBtn.classList.add('border-emerald-500', 'bg-emerald-100', 'text-emerald-800');
      }
    });
  }

  // ROTC Section Management Event Listeners
  const exportOfficerBtn = document.getElementById('exportOfficerBtn');
  if (exportOfficerBtn) exportOfficerBtn.addEventListener('click', () => {
    const ws = XLSX.utils.json_to_sheet(R_ROSTER.map(o => ({ ID: o.id, Name: o.name, Rank: o.rank, Platoon: o.platoon, Specialty: o.spec, Year: o.year, Status: o.status })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Officers');
    XLSX.writeFile(wb, 'Assign_Officer_Section.xlsx');
  });

  const addOfficerBtn = document.getElementById('addOfficerBtn');
  if (addOfficerBtn) addOfficerBtn.addEventListener('click', () => { S.officerForm = true; render(); });


  // Click an officer to see their assigned students
  document.querySelectorAll('[data-officer-row]').forEach(row => {
    row.addEventListener('click', () => {
      S.selectedOfficer = row.dataset.officerRow;
      render();
    });
  });
  const offModalClose = document.getElementById('officerStudentsClose');
  if (offModalClose) offModalClose.addEventListener('click', () => { S.selectedOfficer = null; render(); });
  const officerStudentsOverlay = document.getElementById('officerStudentsOverlay');
  if (officerStudentsOverlay) officerStudentsOverlay.addEventListener('click', e => { if (e.target === officerStudentsOverlay) { S.selectedOfficer = null; render(); } });

  const clearOfficerListBtn = document.getElementById('clearOfficerListBtn');
  if (clearOfficerListBtn) clearOfficerListBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all students from this officer's list?")) {
      if (S.officerStudents) S.officerStudents[S.selectedOfficer] = [];
      render();
    }
  });

  const deleteOfficerSecBtn = document.getElementById('deleteOfficerSecBtn');
  if (deleteOfficerSecBtn) deleteOfficerSecBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to completely delete this officer and their assigned list?")) {
      const offIdx = R_ROSTER.findIndex(o => o.id === S.selectedOfficer);
      if (offIdx !== -1) R_ROSTER.splice(offIdx, 1);
      if (S.officerStudents) delete S.officerStudents[S.selectedOfficer];
      S.selectedOfficer = null;
      render();
    }
  });

  const officerFormClose = document.getElementById('officerFormClose');
  if (officerFormClose) officerFormClose.addEventListener('click', () => { S.officerForm = false; render(); });
  const officerFormCancel = document.getElementById('officerFormCancel');
  if (officerFormCancel) officerFormCancel.addEventListener('click', () => { S.officerForm = false; render(); });
  const officerFormOverlay = document.getElementById('officerFormOverlay');
  if (officerFormOverlay) officerFormOverlay.addEventListener('click', e => { if (e.target === officerFormOverlay) { S.officerForm = false; render(); } });

  const officerFormSave = document.getElementById('officerFormSave');
  if (officerFormSave) officerFormSave.addEventListener('click', () => {
    const id = document.getElementById('newOffId').value.trim();
    const name = document.getElementById('newOffName').value.trim();
    if (id && name) {
      R_ROSTER.unshift({
        id, name: 'Officer ' + name,
        rank: document.getElementById('newOffRank').value,
        platoon: document.getElementById('newOffPlat').value,
        spec: document.getElementById('newOffSpec').value,
        year: '1st', status: '1st Semester'
      });
      S.officerForm = false;
      showToast(`Officer <strong>${name}</strong> has been added successfully.`, 'success', 'Officer Added');
      render();
    }
  });

  // Edit specific student -?? open modal
  document.querySelectorAll('[data-edit-student]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      S.editingStudentIdx = parseInt(btn.dataset.editStudent);
      render();
    });
  });

  // Edit student modal -?? close / cancel
  const editStudentClose = document.getElementById('editStudentClose');
  if (editStudentClose) editStudentClose.addEventListener('click', () => { S.editingStudentIdx = null; render(); });
  const editStudentCancel = document.getElementById('editStudentCancel');
  if (editStudentCancel) editStudentCancel.addEventListener('click', () => { S.editingStudentIdx = null; render(); });
  const editStudentOverlay = document.getElementById('editStudentOverlay');
  if (editStudentOverlay) editStudentOverlay.addEventListener('click', e => { if (e.target === editStudentOverlay) { S.editingStudentIdx = null; render(); } });

  // Edit student modal -?? save changes
  const editStudentSave = document.getElementById('editStudentSave');
  if (editStudentSave) editStudentSave.addEventListener('click', async () => {
    const idx = parseInt(editStudentSave.dataset.editIdx);
    const code = S.selectedSection;
    if (!code || !SECTION_STUDENTS[code] || isNaN(idx)) return;
    const name = document.getElementById('editStName')?.value?.trim();
    if (!name) { document.getElementById('editStName')?.focus(); return; }

    const sec = SECTIONS.find(s => s.code === code);
    const grade = document.getElementById('editStGrade')?.value || '';
    const payload = {
      studentNo: document.getElementById('editStNo')?.value?.trim() || SECTION_STUDENTS[code][idx].studentNo,
      name,
      sectionCode: code,
      program: document.getElementById('editStProg')?.value?.trim() || SECTION_STUDENTS[code][idx].program,
      dob: document.getElementById('editStDob')?.value?.trim() || '',
      birthPlace: document.getElementById('editStBirthPlace')?.value?.trim() || '',
      gender: document.getElementById('editStGender')?.value || '',
      address: document.getElementById('editStAddr')?.value?.trim() || '',
      cellNo: document.getElementById('editStCell')?.value?.trim() || '',
      email: document.getElementById('editStEmail')?.value?.trim() || '',
      instructor: sec?.instructor || null,
      schoolYear: sec?.schoolYear || '2025-2026',
      room: sec?.room || null,
      grade: grade || null,
    };

    try {
      const existing = SECTION_STUDENTS[code][idx];
      if (existing.id && window.updateStudentInDatabase) {
        const saved = await window.updateStudentInDatabase(existing.id, payload);
        SECTION_STUDENTS[code][idx] = window.studentFromApiRow(saved);
      } else if (window.createStudentInDatabase) {
        const saved = await window.createStudentInDatabase(payload);
        SECTION_STUDENTS[code][idx] = window.studentFromApiRow(saved);
      } else {
        SECTION_STUDENTS[code][idx] = { ...existing, ...payload, grade, remarks: grade === 'pass' ? 'Passed' : grade === 'fail' ? 'Failed' : null };
      }
    } catch (err) {
      showToast(err.message, 'error', 'Save Failed');
      return;
    }

    if (window.logAudit) window.logAudit('Updated student', 'Students', name, `Updated profile for ${name} (${code}).`, 'edit');

    S.editingStudentIdx = null;
    S.selectedStudentRow = null;
    showToast(`Student record updated successfully.`, 'success', 'Student Updated');
    render();
  });

  // Delete specific student — archives the record before removing it.
  document.querySelectorAll('[data-delete-student]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.deleteStudent);
      const code = S.selectedSection;
      if (!code || !SECTION_STUDENTS[code]) return;
      const st = SECTION_STUDENTS[code][idx];
      if (!st) return;
      if (!confirm(`Delete student "${st.name}" from ${code}? Their record will be moved to the Student Archive.`)) return;

      if (st.id && window.deleteStudentInDatabase) {
        try {
          await window.deleteStudentInDatabase(st.id);
        } catch (err) {
          showToast(err.message, 'error', 'Delete Failed');
          return;
        }
      }

      // --- Archive-on-delete: snapshot the student into S.studentArchive ---
      if (!S.studentArchive) S.studentArchive = [];
      const sec = SECTIONS.find(s => s.code === code);
      const nstpProg = sec ? sec.program : 'CWTS';
      const existingArchiveIdx = S.studentArchive.findIndex(
        a => a.name.toLowerCase() === st.name.toLowerCase() && a.section === code
      );
      const archiveEntry = {
        studentNo: st.studentNo || `2024-${String(Math.floor(10000 + Math.random() * 90000))}`,
        name: st.name,
        gender: st.gender || 'Female',
        section: code,
        program: nstpProg,
        instructor: sec ? sec.instructor : 'TBA',
        finalGrade: existingArchiveIdx !== -1 ? S.studentArchive[existingArchiveIdx].finalGrade : null,
        remarks: st.remarks || (st.grade === 'pass' ? 'Passed' : st.grade === 'fail' ? 'Failed' : (existingArchiveIdx !== -1 ? S.studentArchive[existingArchiveIdx].remarks : null)),
        grade: st.grade || null,
        schoolYear: sec ? sec.schoolYear : '2025-2026',
        semester: '1st Semester',
        dateArchived: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        collegeProgram: st.program || nstpProg,
        dob: st.dob || '',
        pob: st.birthPlace || '',
        address: st.address || '',
        cell: st.cellNo || '',
        email: st.email || ''
      };
      if (existingArchiveIdx !== -1) {
        S.studentArchive[existingArchiveIdx] = archiveEntry; // overwrite stale copy
      } else {
        S.studentArchive.push(archiveEntry);
      }
      // --- End archive-on-delete ---

      SECTION_STUDENTS[code].splice(idx, 1);
      if (sec) sec.students = SECTION_STUDENTS[code].length;
      S.selectedStudentRow = null;

      if (window.logAudit) window.logAudit('Deleted student', 'Students', st.name, `Removed from ${code} and moved to Archive.`, 'edit');

      showToast(`"${st.name}" removed and moved to Student Archive.`, 'info', 'Student Deleted');
      render();
    });
  });
  const secDeleteBtn = document.getElementById('secDeleteBtn');
  if (secDeleteBtn) secDeleteBtn.addEventListener('click', () => {
    const code = S.selectedSection;
    if (!code) return;
    if (!confirm(`Delete section ${code}? All students in this section will be moved to the Student Archive. This cannot be undone.`)) return;

    // Archive every student in the section before removing it
    const sec = SECTIONS.find(s => s.code === code);
    const nstpProg = sec ? sec.program : 'CWTS';
    const students = SECTION_STUDENTS[code] || [];
    if (!S.studentArchive) S.studentArchive = [];

    let archivedCount = 0;
    students.forEach(st => {
      const existingIdx = S.studentArchive.findIndex(
        a => a.name.toLowerCase() === st.name.toLowerCase() && a.section === code
      );
      const archiveEntry = {
        studentNo: st.studentNo || `2024-${String(Math.floor(10000 + Math.random() * 90000))}`,
        name: st.name,
        gender: st.gender || 'Female',
        section: code,
        program: nstpProg,
        instructor: sec ? sec.instructor : 'TBA',
        finalGrade: existingIdx !== -1 ? S.studentArchive[existingIdx].finalGrade : null,
        remarks: existingIdx !== -1 ? S.studentArchive[existingIdx].remarks : null,
        schoolYear: sec ? sec.schoolYear : '2025-2026',
        semester: '1st Semester',
        dateArchived: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        collegeProgram: st.program || nstpProg,
        dob: st.dob || '',
        pob: st.birthPlace || '',
        address: st.address || '',
        cell: st.cellNo || '',
        email: st.email || ''
      };
      if (existingIdx !== -1) {
        S.studentArchive[existingIdx] = archiveEntry;
      } else {
        S.studentArchive.push(archiveEntry);
      }
      archivedCount++;
    });

    // Remove section roster and metadata
    delete SECTION_STUDENTS[code];
    const idx = SECTIONS.findIndex(s => s.code === code);
    if (idx !== -1) SECTIONS.splice(idx, 1);
    S.selectedSection = null;

    if (window.logAudit) window.logAudit('Deleted section', 'Sections', code, `Deleted section ${code} and archived ${archivedCount} students.`, 'edit');

    const msg = archivedCount > 0
      ? `Section <strong>${code}</strong> deleted — ${archivedCount} student(s) moved to Student Archive.`
      : `Section <strong>${code}</strong> deleted.`;
    showToast(msg, 'info', 'Section Deleted');
    render();
  });

  const secAddStudentBtn = document.getElementById('secAddStudentBtn');
  if (secAddStudentBtn) secAddStudentBtn.addEventListener('click', async () => {
    const name = document.getElementById('secStudentName')?.value?.trim();
    const studentNo = document.getElementById('secStudentNo')?.value?.trim();
    const program = document.getElementById('secStudentProg')?.value?.trim() || (SECTIONS.find(s => s.code === S.selectedSection)?.program || 'BSIT');
    const dob = document.getElementById('secStudentDob')?.value?.trim() || '';
    const birthPlace = document.getElementById('secStudentBirthPlace')?.value?.trim() || '';
    const gender = document.getElementById('secStudentGender')?.value || '';
    const address = document.getElementById('secStudentAddr')?.value?.trim() || '';
    const cellNo = document.getElementById('secStudentCell')?.value?.trim() || '';
    const email = document.getElementById('secStudentEmail')?.value?.trim() || '';
    const grade = document.getElementById('secStudentGrade')?.value || '';
    if (!name) { document.getElementById('secStudentName')?.focus(); return; }
    if (!studentNo) { document.getElementById('secStudentNo')?.focus(); return; }
    const code = S.selectedSection;
    if (!code) return;
    if (!SECTION_STUDENTS[code]) SECTION_STUDENTS[code] = [];
    const sec = SECTIONS.find(s => s.code === code);
    const payload = {
      studentNo, name, sectionCode: code, program, dob, birthPlace, gender, address, cellNo, email,
      instructor: sec?.instructor || null,
      schoolYear: sec?.schoolYear || '2025-2026',
      room: sec?.room || null,
      grade: grade || null,
    };

    try {
      if (window.createStudentInDatabase) {
        const saved = await window.createStudentInDatabase(payload);
        SECTION_STUDENTS[code].push(window.studentFromApiRow(saved));
      } else {
        SECTION_STUDENTS[code].push({ name, studentNo, program, dob, birthPlace, gender, address, cellNo, email, grade, remarks: grade === 'pass' ? 'Passed' : grade === 'fail' ? 'Failed' : null });
      }
    } catch (err) {
      showToast(err.message, 'error', 'Save Failed');
      return;
    }

    if (sec) sec.students = SECTION_STUDENTS[code].length;

    if (window.logAudit) window.logAudit('Added student', 'Students', name, `Added ${name} (${studentNo}) to section ${code}.`, 'edit');

    showToast(`${name} added to <strong>${code}</strong>.`, 'success', 'Student Added');
    render();
  });

  // Allow pressing Enter in name or student no field to submit
  ['secStudentName', 'secStudentNo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('secAddStudentBtn')?.click();
    });
  });

  window.saveInstructorEdits = function (idx) {
    const nameVal = document.getElementById('editInstName')?.value;
    const deptVal = document.getElementById('editInstDept')?.value;
    const sectionsVal = document.getElementById('editInstSections')?.value;
    const studentsVal = parseInt(document.getElementById('editInstStudents')?.value) || 0;
    const emailVal = document.getElementById('editInstEmail')?.value;
    const statusVal = document.getElementById('editInstStatus')?.value;

    if (!nameVal || !nameVal.trim()) { alert('Name is required.'); return; }

    const newInst = {
      name: nameVal.trim(),
      dept: deptVal?.trim() || 'General',
      sections: sectionsVal?.trim() || '',
      students: studentsVal,
      email: emailVal?.trim() || '',
      status: statusVal
    };

    S.instructors[idx] = newInst;

    if (emailVal && window.createInstructorInDatabase) {
      window.createInstructorInDatabase(newInst)
        .then(() => {
          if (sectionsVal) {
            const assignedSecs = sectionsVal.split(',').map(s => s.trim()).filter(s => s.length > 0);
            assignedSecs.forEach(secCode => {
              window.assignInstructorToSection(secCode, emailVal.trim())
                .then(() => {
                  const secObj = (typeof SECTIONS !== 'undefined') && SECTIONS.find(s => s.code === secCode);
                  if (secObj) secObj.instructor = nameVal.trim();
                })
                .catch(err => console.error(`Failed to assign instructor to ${secCode}:`, err));
            });
          }
        })
        .catch(err => console.error('Failed to sync instructor details:', err));
    }

    S.editingInstructor = false;
    showToast('Personnel record has been updated.', 'success', 'Personnel Updated');
    render();
  };

  window.deleteInstructor = function (idx) {
    if (confirm('Are you sure you want to delete this personnel?')) {
      S.instructors.splice(idx, 1);
      S.selectedInstructorIndex = null;
      S.editingInstructor = false;
      render();
    }
  };

  window.saveActivityEdits = function (idx) {
    const titleVal = document.getElementById('editActTitle')?.value;
    const dateVal = document.getElementById('editActDate')?.value;
    const timeVal = document.getElementById('editActTime')?.value;
    const venueVal = document.getElementById('editActVenue')?.value;
    const scopeVal = document.getElementById('editActScope')?.value;
    const statusVal = document.getElementById('editActStatus')?.value;

    if (!titleVal || !titleVal.trim()) { alert('Activity title is required.'); return; }

    S.activities[idx] = {
      ...S.activities[idx],
      title: titleVal.trim(),
      date: dateVal?.trim() || 'TBD',
      time: timeVal?.trim() || 'TBD',
      venue: venueVal?.trim() || 'TBD',
      scope: scopeVal,
      status: statusVal
    };
    S.editingActivity = false;
    render();
  };

  window.deleteActivity = function (idx) {
    if (confirm('Are you sure you want to delete this activity?')) {
      S.activities.splice(idx, 1);
      S.selectedCalActivity = null;
      S.editingActivity = false;
      render();
    }
  };

  const inviteInstructorBtn = document.getElementById('inviteInstructorBtn');
  if (inviteInstructorBtn) inviteInstructorBtn.addEventListener('click', () => { S.inviteForm = true; render(); });
  const inviteFormClose = document.getElementById('inviteFormClose');
  if (inviteFormClose) inviteFormClose.addEventListener('click', () => { S.inviteForm = false; render(); });
  const inviteFormCancel = document.getElementById('inviteFormCancel');
  if (inviteFormCancel) inviteFormCancel.addEventListener('click', () => { S.inviteForm = false; render(); });
  const inviteOverlay = document.getElementById('inviteOverlay');
  if (inviteOverlay) inviteOverlay.addEventListener('click', e => { if (e.target === inviteOverlay) { S.inviteForm = false; render(); } });
  const inviteFormSend = document.getElementById('inviteFormSend');
  if (inviteFormSend) inviteFormSend.addEventListener('click', () => {
    const name = document.getElementById('invName')?.value?.trim();
    if (!name) { document.getElementById('invName').focus(); return; }
    const dept = document.getElementById('invDept')?.value?.trim() || 'General';
    const sections = document.getElementById('invSections')?.value?.trim() || '';
    const email = document.getElementById('invEmail')?.value?.trim() || '';
    
    const newInst = { name, dept, sections, students: 0, status: 'Active', email };
    S.instructors.push(newInst);

    if (email && window.createInstructorInDatabase) {
      window.createInstructorInDatabase(newInst)
        .then(() => {
          if (sections) {
            const assignedSecs = sections.split(',').map(s => s.trim()).filter(s => s.length > 0);
            assignedSecs.forEach(secCode => {
              window.assignInstructorToSection(secCode, email).catch(console.error);
            });
          }
        })
        .catch(err => console.error('Failed to save invited instructor to DB:', err));
    }

    S.inviteForm = false;
    showToast(`<strong>${name}</strong> has been added as personnel.`, 'success', 'Personnel Added');
    render();
  });

  // Platoon search
  const platSearch = document.getElementById('platSearch');
  if (platSearch) {
    platSearch.addEventListener('input', e => {
      S.platSearch = e.target.value;
      render();
    });
  }

  // Drag events for cadet cards
  document.querySelectorAll('[data-cadet-id]').forEach(card => {
    card.addEventListener('dragstart', e => {
      S.dragging = { id: card.dataset.cadetId, from: card.dataset.cadetFrom };
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      S.dragging = null;
    });
  });

  // Instructor Student Modal
  document.querySelectorAll('[data-instr-sec]').forEach(card => {
    card.addEventListener('click', () => {
      S.instrSelectedSection = card.dataset.instrSec;
      render();
    });
  });
  const instrStudentModalClose = document.getElementById('instrStudentModalClose');
  if (instrStudentModalClose) instrStudentModalClose.addEventListener('click', () => { S.instrSelectedSection = null; render(); });
  const instrStudentModalOverlay = document.getElementById('instrStudentModalOverlay');
  if (instrStudentModalOverlay) instrStudentModalOverlay.addEventListener('click', e => { if (e.target === instrStudentModalOverlay) { S.instrSelectedSection = null; render(); } });

  // View Attachments Modal
  const viewAttachmentsBtn = document.getElementById('viewAttachmentsBtn');
  if (viewAttachmentsBtn) viewAttachmentsBtn.addEventListener('click', () => { S.showAttachmentsModal = true; render(); });
  const closeAttachmentsBtn = document.getElementById('closeAttachmentsBtn');
  if (closeAttachmentsBtn) closeAttachmentsBtn.addEventListener('click', () => { S.showAttachmentsModal = false; render(); });
  const attachmentsModalOverlay = document.getElementById('attachmentsModalOverlay');
  if (attachmentsModalOverlay) attachmentsModalOverlay.addEventListener('click', e => { if (e.target === attachmentsModalOverlay) { S.showAttachmentsModal = false; render(); } });

  // Activity Plans - Instructor
  const planFileInput = document.getElementById('planFileInput');
  const planFileLabel = document.getElementById('planFileLabel');
  if (planFileInput && planFileLabel) {
    planFileInput.addEventListener('change', (e) => {
      const count = e.target.files.length;
      planFileLabel.textContent = count > 0 ? `${count} file${count > 1 ? 's' : ''} selected` : 'Add File';
    });
  }

  const savePlan = (status) => {
    const titleInput = document.getElementById('planTitleInput');
    if (!titleInput || !titleInput.value.trim()) { alert('Please enter a title for the activity plan'); return; }

    const dateInput = document.getElementById('planDateInput');
    const durationInput = document.getElementById('planDurationInput');
    const sectionInput = document.getElementById('planSectionInput');

    let displayDate = dateInput.value;
    if (displayDate) {
      const d = new Date(displayDate);
      displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      displayDate = 'TBD';
    }

    I_PLANS.unshift({
      title: titleInput.value.trim(),
      section: sectionInput.value.split(' &middot; ')[0],
      date: displayDate,
      duration: durationInput.value + ' hrs',
      venue: 'TBD',
      status: status
    });

    render();
  };

  const planSaveDraftBtn = document.getElementById('planSaveDraftBtn');
  if (planSaveDraftBtn) planSaveDraftBtn.addEventListener('click', () => {
    savePlan('Draft');
    const titleVal = document.getElementById('planTitleInput')?.value?.trim();
    if (window.logAudit) window.logAudit('Saved Draft', 'Activity Plans', titleVal, `Saved activity plan draft: "${titleVal}"`, 'edit');
    showToast('Activity plan saved as draft.', 'info', 'Draft Saved');
  });

  const planSubmitBtn = document.getElementById('planSubmitBtn');
  if (planSubmitBtn) planSubmitBtn.addEventListener('click', () => {
    savePlan('Pending');
    const titleVal = document.getElementById('planTitleInput')?.value?.trim();
    if (window.logAudit) window.logAudit('Submitted Plan', 'Activity Plans', titleVal, `Submitted activity plan for approval: "${titleVal}"`, 'submission');
    showToast('Activity plan submitted for approval.', 'success', 'Plan Submitted');
  });

  // Revision Modal logic
  const submitRevisionBtn = document.getElementById('submitRevisionBtn');
  if (submitRevisionBtn) {
    submitRevisionBtn.addEventListener('click', () => {
      const note = document.getElementById('revisionNoteArea').value.trim();
      if (!note) {
        alert('Please provide a revision note.');
        return;
      }

      const item = APPROVALS[S.selApproval || 0];
      if (item) {
        // Find matching plan in I_PLANS to simulate persistence
        const plan = I_PLANS.find(p => p.title.includes(item.title.replace(' Report', '').replace(' Activity', '')));
        if (plan) {
          plan.status = 'Revision';
          plan.feedback = note;
        }
      }

      alert('Revision request sent successfully!');
      APPROVALS.splice(S.selApproval || 0, 1);
      S.selApproval = 0;
      S.revisionModal = false;
      S.revisionNote = '';

      if (window.logAudit && item) window.logAudit('Requested revisions', 'Report & Activity Approvals', item.title, `Requested revisions for "${item.title}". Note: "${note}"`, 'approval');

      showToast('Revision request has been sent to the instructor.', 'warning', 'Revision Requested');
      render();
    });
  }
  const revisionNoteArea = document.getElementById('revisionNoteArea');
  if (revisionNoteArea) {
    revisionNoteArea.addEventListener('input', (e) => {
      S.revisionNote = e.target.value;
    });
  }

  // Dashboard Incomplete Profiles Widget Search
  const dashboardArchiveSearch = document.getElementById('dashboardArchiveSearch');
  if (dashboardArchiveSearch) {
    dashboardArchiveSearch.addEventListener('input', (e) => {
      S.dashboardArchiveSearch = e.target.value;
      S.focusedFilterInputId = 'dashboardArchiveSearch';
      S.focusedFilterCursor = e.target.selectionStart;
      render();
    });
  }

  // Dashboard Edit Student Close & Cancel
  const dashboardEditStudentClose = document.getElementById('dashboardEditStudentClose');
  if (dashboardEditStudentClose) dashboardEditStudentClose.addEventListener('click', () => { S.editingDashboardStudentIndex = null; render(); });
  const dashboardEditStudentCancel = document.getElementById('dashboardEditStudentCancel');
  if (dashboardEditStudentCancel) dashboardEditStudentCancel.addEventListener('click', () => { S.editingDashboardStudentIndex = null; render(); });
  const dashboardEditStudentOverlay = document.getElementById('dashboardEditStudentOverlay');
  if (dashboardEditStudentOverlay) dashboardEditStudentOverlay.addEventListener('click', e => { if (e.target === dashboardEditStudentOverlay) { S.editingDashboardStudentIndex = null; render(); } });

  // Dashboard Edit Student Save
  const dashboardEditStudentSave = document.getElementById('dashboardEditStudentSave');
  if (dashboardEditStudentSave) {
    dashboardEditStudentSave.addEventListener('click', () => {
      const idx = parseInt(dashboardEditStudentSave.dataset.editIdx);
      if (isNaN(idx) || !S.studentArchive || !S.studentArchive[idx]) return;

      const oldName = S.studentArchive[idx].name;
      const newName = document.getElementById('dashEditStName')?.value?.trim();
      if (!newName) { alert('Student name is required.'); return; }

      const studentNo = document.getElementById('dashEditStNo')?.value?.trim();
      const program = document.getElementById('dashEditStProg')?.value?.trim();
      const dob = document.getElementById('dashEditStDob')?.value?.trim();
      const birthPlace = document.getElementById('dashEditStBirthPlace')?.value?.trim();
      const gender = document.getElementById('dashEditStGender')?.value;
      const cellNo = document.getElementById('dashEditStCell')?.value?.trim();
      const address = document.getElementById('dashEditStAddr')?.value?.trim();
      const email = document.getElementById('dashEditStEmail')?.value?.trim();

      // Update studentArchive entry
      S.studentArchive[idx] = {
        ...S.studentArchive[idx],
        studentNo,
        name: newName,
        program,
        dob,
        pob: birthPlace,
        birthPlace, // keep both names in sync just in case
        gender,
        cell: cellNo,
        cellNo,
        address,
        email
      };

      // Propagate back to SECTION_STUDENTS if matching
      const sectionCode = S.studentArchive[idx].section;
      if (sectionCode && typeof SECTION_STUDENTS !== 'undefined' && SECTION_STUDENTS[sectionCode]) {
        const secIdx = SECTION_STUDENTS[sectionCode].findIndex(s => s.name.toLowerCase() === oldName.toLowerCase() || s.name.toLowerCase() === newName.toLowerCase());
        if (secIdx !== -1) {
          SECTION_STUDENTS[sectionCode][secIdx] = {
            ...SECTION_STUDENTS[sectionCode][secIdx],
            studentNo,
            name: newName,
            program,
            dob,
            birthPlace,
            gender,
            address,
            cellNo,
            email
          };
        }
      }

      S.editingDashboardStudentIndex = null;

      if (window.logAudit) window.logAudit('Resolved profile', 'Student Archive', newName, `Resolved missing profile details for archived student: ${newName}.`, 'edit');

      showToast(`Student record for ${newName} updated successfully.`, 'success', 'Profile Resolved');
      render();
    });
  }
}

// Startup bulk-sync removed — archive is populated only on student delete.

window.refreshNotifications = function () {
  if (S.email && window.loadNotificationsFromDatabase) {
    window.loadNotificationsFromDatabase(S.email)
      .then(notifs => {
        S.notifications = notifs;
        render();
      })
      .catch(console.error);
  }
};

// Initial render — load students from MySQL first when available
function bootPortal() {
  const loads = [];
  if (window.loadStudentsFromDatabase) loads.push(window.loadStudentsFromDatabase());
  if (window.loadSectionsFromDatabase) loads.push(window.loadSectionsFromDatabase());
  if (window.loadInstructorsFromDatabase) loads.push(window.loadInstructorsFromDatabase());
  if (window.fetchDashboardMetrics) loads.push(window.fetchDashboardMetrics().catch(() => {}));
  Promise.all(loads).finally(() => {
    if (window.refreshNotifications) window.refreshNotifications();
    render();
    if (window.startDashboardLive) window.startDashboardLive();
  });
}
bootPortal();

/* ================================================================
   PORTAL DATA RESET INTEGRATION
================================================================ */
window.nstpResetFrontendData = function () {
  // 1. Clear state S in core.js
  if (typeof S !== 'undefined') {
    S.activities = [];
    S.unassigned = [];
    S.platoons = {};
    S.studentArchive = [];
    S.batches = [];
    S.recentCerts = [];
    S.ocrUploads = [];
    S.instructors = [];
  }

  // 2. Clear global arrays and objects in-place
  if (typeof SECTIONS !== 'undefined') {
    SECTIONS.length = 0;
  }
  if (typeof SECTION_STUDENTS !== 'undefined') {
    Object.keys(SECTION_STUDENTS).forEach(key => delete SECTION_STUDENTS[key]);
  }
  if (typeof APPROVALS !== 'undefined') {
    APPROVALS.length = 0;
  }
  if (typeof I_CLASSES !== 'undefined') {
    I_CLASSES.length = 0;
  }
  if (typeof I_REPORTS !== 'undefined') {
    I_REPORTS.length = 0;
  }
  if (typeof I_STATS !== 'undefined') {
    I_STATS.forEach(s => {
      s.value = '0';
      if (s.label === 'Assigned Sections') s.sub = 'CWTS &middot; LTS';
      else if (s.label === 'Total Students') s.sub = 'Across all sections';
      else if (s.label === 'Reports Pending') s.sub = '0 due this week';
      else if (s.label === 'Approved YTD') s.sub = '0 this month';
    });
  }
  if (typeof R_REPORTS !== 'undefined') {
    R_REPORTS.length = 0;
  }
  if (typeof R_BULLETIN !== 'undefined') {
    R_BULLETIN.length = 0;
  }
  if (typeof COORD_STATS !== 'undefined') {
    COORD_STATS.forEach(s => {
      s.value = '0';
      s.delta = '0%';
    });
  }

  console.log('[nstp-portal] Frontend state and mock data arrays have been cleared.');
};

window.triggerPortalDataReset = function () {
  if (!confirm('⚠ CRITICAL WARNING ⚠\n\nThis will permanently DELETE ALL operational data (students, sections, attendance, calendar activities, announcements, submissions, reports) across Coordinator, Instructor, and ROTC Officer portals.\n\nAll Admin user accounts will be PRESERVED. Are you absolutely sure you want to proceed?')) {
    return;
  }
  
  if (!confirm('FINAL CONFIRMATION:\n\nThis action is irreversible and will perform a complete wipe. Proceed?')) {
    return;
  }

  showToast('Initiating targeted database wipe...', 'info', 'Reset Started');

  fetch('/api/admin/reset-data', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  .then(async response => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Server error during data reset.');
    }
    
    // Clear the frontend state
    window.nstpResetFrontendData();
    
    // Re-render UI
    if (typeof render === 'function') {
      render();
    }
    
    showToast('Portal display data wiped. Admins preserved.', 'success', 'Reset Complete');
    alert('✅ Targeted Reset Complete!\n\nAll operational database tables and frontend arrays have been cleared. Admin accounts are preserved.');
  })
  .catch(error => {
    console.error('[reset]', error);
    showToast(error.message || 'Wipe failed. Check XAMPP/MySQL connection.', 'error', 'Reset Failed');
    alert('❌ Reset Failed:\n\n' + error.message);
  });
};




