/* ================================================================
   NSTP PORTAL — STUDENTS API (MySQL via Laravel)
   Loads / saves student rosters and pass|fail grade status.
================================================================ */

window.gradeStatusBadge = function (grade) {
  if (grade === 'pass') {
    return `<span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">${typeof ico === 'function' ? ico('check', 'w-3 h-3') : ''} Pass</span>`;
  }
  if (grade === 'fail') {
    return `<span class="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">${typeof ico === 'function' ? ico('close', 'w-3 h-3') : ''} Fail</span>`;
  }
  return `<span class="text-xs text-slate-400 px-2 py-0.5 rounded-full bg-slate-100">Not set</span>`;
};

window.studentFromApiRow = function apiRowToClient(row) {
  return {
    id: row.id,
    studentNo: row.student_no,
    name: row.name,
    program: row.program || '',
    dob: row.dob || '',
    birthPlace: row.birth_place || '',
    gender: row.gender || '',
    address: row.address || '',
    cellNo: row.cell_no || '',
    email: row.email || '',
    instructor: row.instructor || '',
    grade: row.grade || '',
    remarks: row.grade === 'pass' ? 'Passed' : row.grade === 'fail' ? 'Failed' : null,
  };
};

function clientToApiPayload(data) {
  return {
    student_no: data.studentNo || data.student_no,
    name: data.name,
    section_code: data.sectionCode || data.section_code,
    program: data.program || null,
    gender: data.gender || null,
    dob: data.dob || null,
    birth_place: data.birthPlace || data.birth_place || null,
    address: data.address || null,
    cell_no: data.cellNo || data.cell_no || null,
    email: data.email || null,
    instructor: data.instructor || null,
    school_year: data.schoolYear || data.school_year || '2025-2026',
    room: data.room || null,
    grade: data.grade || null,
  };
}

window.hydrateStudentsFromApi = function (rows) {
  if (typeof SECTION_STUDENTS === 'undefined') return;

  Object.keys(SECTION_STUDENTS).forEach((key) => delete SECTION_STUDENTS[key]);

  const sectionMeta = {};

  (rows || []).forEach((row) => {
    const code = row.section_code;
    if (!SECTION_STUDENTS[code]) SECTION_STUDENTS[code] = [];
    SECTION_STUDENTS[code].push(window.studentFromApiRow(row));

    if (!sectionMeta[code]) {
      sectionMeta[code] = {
        code,
        program: row.program || 'CWTS',
        schoolYear: row.school_year || '2025-2026',
        students: 0,
        instructor: row.instructor || 'TBA',
        room: row.room || 'TBA',
      };
    }
    sectionMeta[code].students++;
  });

  if (typeof SECTIONS !== 'undefined') {
    Object.values(sectionMeta).forEach((meta) => {
      const existing = SECTIONS.find((s) => s.code === meta.code);
      if (existing) {
        existing.students = meta.students;
        existing.instructor = meta.instructor || existing.instructor;
        existing.room = meta.room || existing.room;
        existing.program = meta.program || existing.program;
        existing.schoolYear = meta.schoolYear || existing.schoolYear;
      } else {
        SECTIONS.push(meta);
      }
    });
  }
};

window.loadStudentsFromDatabase = function () {
  return fetch('/api/students', { headers: { Accept: 'application/json' } })
    .then((r) => {
      if (!r.ok) throw new Error('Could not load students from database.');
      return r.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) return;
      window.hydrateStudentsFromApi(data);
      window._studentsDbReady = true;
    })
    .catch((err) => {
      console.warn('[students-api]', err.message);
      if (typeof showToast === 'function') {
        showToast('Could not connect to MySQL. Start XAMPP and run migrations.', 'error', 'Database Offline');
      }
    });
};

window.createStudentInDatabase = function (payload) {
  return fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(clientToApiPayload(payload)),
  }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = body.message || (body.errors ? Object.values(body.errors).flat().join(' ') : null);
      throw new Error(msg || 'Failed to save student.');
    }
    return body.student;
  });
};

window.updateStudentInDatabase = function (id, payload) {
  return fetch(`/api/students/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(clientToApiPayload(payload)),
  }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = body.message || (body.errors ? Object.values(body.errors).flat().join(' ') : null);
      throw new Error(msg || 'Failed to update student.');
    }
    return body.student;
  });
};

window.deleteStudentInDatabase = function (id) {
  return fetch(`/api/students/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  }).then((r) => {
    if (!r.ok) throw new Error('Failed to delete student from database.');
    return true;
  });
};

/* ================================================================
   SECTIONS API
================================================================ */

/**
 * Load all sections from the DB and merge into the global SECTIONS array.
 * Sections already in SECTIONS (from localStorage/default) are updated
 * with DB data; new DB sections are pushed in.
 */
window.loadSectionsFromDatabase = function () {
  return fetch('/api/sections', { headers: { Accept: 'application/json' } })
    .then((r) => {
      if (!r.ok) throw new Error('Could not load sections.');
      return r.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || typeof SECTIONS === 'undefined') return;
      data.forEach((dbSec) => {
        const existing = SECTIONS.find((s) => s.code === dbSec.code);
        if (existing) {
          // Update with authoritative DB values
          existing.instructor = dbSec.instructor || existing.instructor || 'TBA';
          existing.students   = dbSec.students   ?? existing.students;
          existing.room       = dbSec.room        || existing.room || 'TBA';
          existing.program    = dbSec.program     || existing.program || 'CWTS';
          existing.schoolYear = dbSec.schoolYear  || existing.schoolYear || '2025-2026';
          existing.status     = dbSec.status      || existing.status || 'Active';
          existing._dbId      = dbSec.id;
        } else {
          SECTIONS.push({
            code:       dbSec.code,
            program:    dbSec.program    || 'CWTS',
            schoolYear: dbSec.schoolYear || '2025-2026',
            students:   dbSec.students   || 0,
            instructor: dbSec.instructor || 'TBA',
            room:       dbSec.room       || 'TBA',
            status:     dbSec.status     || 'Active',
            _dbId:      dbSec.id,
          });
        }
      });
      window._sectionsDbReady = true;
    })
    .catch((err) => console.warn('[sections-api]', err.message));
};

/** POST /api/sections — persist a newly-created section */
window.createSectionInDatabase = function (payload) {
  return fetch('/api/sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      code:             payload.code,
      program:          payload.program     || 'CWTS',
      school_year:      payload.schoolYear  || '2025-2026',
      room:             payload.room        || 'TBA',
      status:           payload.status      || 'Active',
      instructor_name:  (payload.instructor && payload.instructor !== 'TBA') ? payload.instructor : undefined,
    }),
  }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = body.message || (body.errors ? Object.values(body.errors).flat().join(' ') : null);
      throw new Error(msg || 'Failed to save section.');
    }
    return body.section;
  });
};

/** POST /api/sections/assign — assign an instructor to a section */
window.assignInstructorToSection = function (sectionCode, instructorEmail) {
  return fetch('/api/sections/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ section_code: sectionCode, instructor_email: instructorEmail }),
  }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = body.message || (body.errors ? Object.values(body.errors).flat().join(' ') : null);
      throw new Error(msg || 'Failed to assign instructor.');
    }
    return body;
  });
};

/* ================================================================
   INSTRUCTORS API
================================================================ */

/**
 * Load all instructors from portal_users table and merge into S.instructors.
 */
window.loadInstructorsFromDatabase = function () {
  return fetch('/api/instructors', { headers: { Accept: 'application/json' } })
    .then((r) => {
      if (!r.ok) throw new Error('Could not load instructors.');
      return r.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || typeof S === 'undefined') return;
      if (!S.instructors) S.instructors = [];
      data.forEach((dbInst) => {
        const existing = S.instructors.find((i) =>
          i.email && i.email.toLowerCase() === dbInst.email.toLowerCase()
        );
        if (existing) {
          existing.name     = dbInst.name     || existing.name;
          existing.dept     = dbInst.dept     || existing.dept;
          existing.sections = dbInst.sections || existing.sections;
          existing.status   = dbInst.status   || existing.status;
          existing._dbId    = dbInst.id;
        } else {
          S.instructors.push({
            name:     dbInst.name,
            email:    dbInst.email,
            dept:     dbInst.dept     || 'General',
            sections: dbInst.sections || '',
            students: 0,
            status:   dbInst.status   || 'Active',
            _dbId:    dbInst.id,
          });
        }
      });
      window._instructorsDbReady = true;
    })
    .catch((err) => console.warn('[instructors-api]', err.message));
};

/** POST /api/instructors — persist a newly-added instructor */
window.createInstructorInDatabase = function (payload) {
  return fetch('/api/instructors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name:    payload.name,
      email:   payload.email,
      dept:    payload.dept    || 'General',
      contact: payload.contact || null,
      status:  payload.status  || 'Active',
    }),
  }).then(async (r) => {
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = body.message || (body.errors ? Object.values(body.errors).flat().join(' ') : null);
      throw new Error(msg || 'Failed to save instructor.');
    }
    return body.instructor;
  });
};

/* ================================================================
   NOTIFICATIONS API
================================================================ */

/** GET /api/notifications?email=... */
window.loadNotificationsFromDatabase = function (email) {
  if (!email) return Promise.resolve([]);
  return fetch(`/api/notifications?email=${encodeURIComponent(email)}`, {
    headers: { Accept: 'application/json' },
  })
    .then((r) => {
      if (!r.ok) throw new Error('Could not load notifications.');
      return r.json();
    })
    .catch((err) => { console.warn('[notifications-api]', err.message); return []; });
};

/** POST /api/notifications/{id}/read */
window.markNotificationRead = function (id) {
  return fetch(`/api/notifications/${id}/read`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  }).catch((err) => console.warn('[notifications-api]', err.message));
};

/** POST /api/notifications/read-all?email=... */
window.markAllNotificationsRead = function (email) {
  if (!email) return Promise.resolve();
  return fetch(`/api/notifications/read-all?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  }).catch((err) => console.warn('[notifications-api]', err.message));
};

