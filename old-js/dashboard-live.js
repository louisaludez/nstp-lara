/* ================================================================
   NSTP PORTAL — REAL-TIME DASHBOARD (SSE + MySQL metrics)
   Uses Server-Sent Events from Laravel; falls back to polling.
================================================================ */

window.DASHBOARD_METRICS = null;
window._dashboardEventSource = null;
window._dashboardPollTimer = null;

function dashboardRole() {
  if (!window.S || !S.role) return 'coordinator';
  if (S.role === 'rotcofficer') return 'rotcofficer';
  return S.role;
}

function isOnDashboardPage() {
  if (!window.S) return false;
  if (S.role === 'coordinator') return S.coordPage === 'Dashboard';
  if (S.role === 'instructor') return S.instrPage === 'Overview';
  if (S.role === 'rotcofficer') return S.rotcPage === 'Overview';
  if (S.role === 'admin') return S.adminPage === 'Accounts';
  return false;
}

window.fetchDashboardMetrics = function () {
  const role = dashboardRole();
  return fetch(`/api/dashboard/metrics?role=${encodeURIComponent(role)}`, {
    headers: { Accept: 'application/json' },
  })
    .then((r) => {
      if (!r.ok) throw new Error('Dashboard metrics unavailable');
      return r.json();
    })
    .then((data) => {
      window.applyDashboardMetrics(data);
      return data;
    });
};

window.applyDashboardMetrics = function (metrics) {
  if (!metrics) return;
  window.DASHBOARD_METRICS = metrics;

  if (Array.isArray(metrics.activities) && metrics.activities.length) {
    window.S = window.S || {};
    S.activities = metrics.activities;
  }

  if (!isOnDashboardPage()) return;

  patchDashboardStats(metrics);
  patchEnrollmentChart(metrics.enrollment);
  patchPassFailChart(metrics.pass_fail_by_program);
  patchRecentActivities(metrics.recent_activities);
  patchCalendarActivities(metrics.activities);
  patchApprovalBadge(metrics.approvals_pending);
};

function patchDashboardStats(metrics) {
  const stats = metrics.stats || [];
  stats.forEach((s) => {
    const card = document.querySelector(`[data-metric="${s.key}"]`);
    if (!card) return;
    const val = card.querySelector('[data-metric-value]');
    const delta = card.querySelector('[data-metric-delta]');
    const sub = card.querySelector('[data-metric-sub]');
    if (val) val.textContent = s.value;
    if (sub && s.sub) sub.textContent = s.sub;
    if (delta && s.delta !== undefined) {
      delta.textContent = s.delta;
      delta.className = `text-xs px-2 py-1 rounded-full ${s.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`;
    }
  });
}

function patchEnrollmentChart(enrollment) {
  const host = document.getElementById('dashboard-enrollment-chart');
  if (!host || !enrollment || !enrollment.series || !enrollment.series.length) return;
  if (typeof enrollmentChartFromData === 'function') {
    host.innerHTML = enrollmentChartFromData(enrollment);
  }
}

function patchPassFailChart(programs) {
  const host = document.getElementById('dashboard-passfail-chart');
  if (!host || !programs || !programs.length) return;
  if (typeof passFailChartFromData === 'function') {
    host.innerHTML = passFailChartFromData(programs);
  }
}

function patchRecentActivities(items) {
  const host = document.getElementById('dashboard-recent-activities');
  if (!host || !items) return;
  const rows = (items || []).slice(0, 4).map((a) => {
    const statusCls = a.status === 'Submitted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
    return `<li class="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span class="w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color || 'bg-indigo-500'}"></span>
      <div class="flex-1 min-w-0">
        <div class="text-sm text-slate-800 font-medium truncate">${a.title}</div>
        <div class="text-xs text-slate-500 mt-0.5">${a.date || ''} · ${a.time || ''}</div>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-full shrink-0 ${statusCls}">${a.status || 'Update'}</span>
    </li>`;
  }).join('');
  host.innerHTML = rows || '<li class="text-sm text-slate-400 py-4 text-center">No recent activity</li>';
}

function patchCalendarActivities(activities) {
  const host = document.getElementById('dashboard-calendar-grid');
  if (!host || !activities) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const actIdx = activities.findIndex((a) => {
      try {
        const dateObj = new Date(a.date);
        return dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === d;
      } catch (e) { return false; }
    });
    const isToday = d === today;
    const hasEvent = actIdx !== -1;
    let cls = 'w-7 h-7 flex items-center justify-center text-xs rounded-full text-slate-600 hover:bg-slate-100 cursor-pointer';
    if (isToday) cls = 'w-7 h-7 flex items-center justify-center text-xs rounded-full bg-indigo-600 text-white font-semibold cursor-pointer';
    else if (hasEvent) cls = 'w-7 h-7 flex items-center justify-center text-xs rounded-full bg-indigo-50 text-indigo-700 font-semibold ring-1 ring-indigo-200 cursor-pointer hover:bg-indigo-100 transition';
    const click = hasEvent ? `onclick="S.selectedCalActivity=${actIdx};render();"` : '';
    cells += `<div ${click} class="${cls}">${d}</div>`;
  }
  host.innerHTML = cells;
}

function patchApprovalBadge(count) {
  if (count === undefined || count === null) return;
  document.querySelectorAll('[data-approvals-badge]').forEach((el) => {
    el.textContent = String(count);
    el.style.display = count > 0 ? '' : 'none';
  });
}

window.startDashboardLive = function () {
  window.stopDashboardLive();

  const role = dashboardRole();
  window.fetchDashboardMetrics().catch(() => {});

  if (typeof EventSource !== 'undefined') {
    const url = `/api/dashboard/stream?role=${encodeURIComponent(role)}`;
    const es = new EventSource(url);
    window._dashboardEventSource = es;

    es.addEventListener('metrics', (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.payload) window.applyDashboardMetrics(msg.payload);
      } catch (e) { /* ignore parse errors */ }
    });

    es.onerror = () => {
      es.close();
      window._dashboardEventSource = null;
      startDashboardPolling();
    };
  } else {
    startDashboardPolling();
  }
};

function startDashboardPolling() {
  if (window._dashboardPollTimer) return;
  window._dashboardPollTimer = setInterval(() => {
    if (document.hidden) return;
    window.fetchDashboardMetrics().catch(() => {});
  }, 5000);
}

window.stopDashboardLive = function () {
  if (window._dashboardEventSource) {
    window._dashboardEventSource.close();
    window._dashboardEventSource = null;
  }
  if (window._dashboardPollTimer) {
    clearInterval(window._dashboardPollTimer);
    window._dashboardPollTimer = null;
  }
};

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.stopDashboardLive();
  } else if (window.S && S.role) {
    window.startDashboardLive();
  }
});
