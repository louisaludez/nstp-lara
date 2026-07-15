/* ================================================================
   NSTP PORTAL — AUDIT LOGGING HELPER
   Intercepts frontend actions and ships them to the backend API.
   Usage: logAudit('Deleted', 'Students', 'Juan dela Cruz (CWTS-1A)', 'Removed from roster.')
================================================================ */

// In-memory log store (fed into S.auditLogs for the live UI)
if (!window._auditQueue) window._auditQueue = [];

/**
 * Log an audit event.
 *
 * @param {string} action      e.g. 'Created', 'Deleted', 'Logged In', 'Imported'
 * @param {string} module      e.g. 'Students', 'Sections', 'Certificates', 'Authentication'
 * @param {string} [target]    Human-readable subject, e.g. 'Juan dela Cruz (CWTS-1A)'
 * @param {string} [details]   Optional extra context / diff summary
 * @param {string} [actionType] 'edit' | 'system' | 'approval' | 'submission' | 'alert'
 */
window.logAudit = function (action, module, target = '', details = '', actionType = 'edit') {
  /* ---- Resolve current user from global state ---- */
  const username = (() => {
    try {
      const pd = (typeof PROFILE_DATA !== 'undefined') && S.email
        ? PROFILE_DATA[S.email] || PROFILE_DATA[S.role]
        : null;
      return pd ? pd.fullName || pd.name || S.email : (S.email || 'System');
    } catch (e) { return S.email || 'System'; }
  })();
  const userEmail = S.email || null;
  const role = S.role || null;

  /* ---- Timestamp for immediate local display ---- */
  const now = new Date();
  const timeStr = now.toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  /* ---- Push to in-memory log (drives live UI) ---- */
  const entry = { actor: username, email: userEmail, role, action, type: actionType, module, target, details, time: timeStr, performed_at: now.toISOString() };
  if (!S.auditLogs) S.auditLogs = [];
  S.auditLogs.unshift(entry);           // newest first
  if (S.auditLogs.length > 500) S.auditLogs.pop();   // cap at 500

  /* ---- Fire-and-forget POST to backend ---- */
  fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ username, user_email: userEmail, role, action, action_type: actionType, module, target, details })
  }).catch(() => { /* silently ignore network errors — local log already captured */ });
};

/**
 * Fetch recent audit logs from the backend and merge into S.auditLogs.
 * Called when the Audit Logs page is opened.
 */
window.fetchAuditLogs = function () {
  const search = S.auditSearch ? `&search=${encodeURIComponent(S.auditSearch)}` : '';
  const type = (S.auditFilter && S.auditFilter !== 'all') ? `&type=${S.auditFilter}` : '';
  fetch(`/api/audit?limit=200${search}${type}`, { headers: { 'Accept': 'application/json' } })
    .then(r => r.json())
    .then(data => {
      if (!Array.isArray(data)) return;
      /* Merge server logs with any in-memory entries that haven't been flushed yet */
      const localKeys = new Set((S.auditLogs || []).map(e => e.performed_at));
      const serverOnly = data.filter(e => !localKeys.has(e.performed_at));
      S.auditLogs = [...(S.auditLogs || []), ...serverOnly]
        .sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at))
        .slice(0, 500);
      render();
    })
    .catch(() => { /* server may be offline during dev; local log still works */ });
};
