    /* ================================================================
       INSTRUCTOR PAGES
    ================================================================ */
    const I_CLASSES = [];
    const I_REPORTS = [];
    const I_STATS = [
      { label: 'Assigned Sections', value: '0', sub: 'CWTS &middot; LTS', ico: 'book', color: 'from-indigo-500 to-blue-500' },
      { label: 'Total Students', value: '0', sub: 'Across all sections', ico: 'users', color: 'from-emerald-500 to-teal-500' },
      { label: 'Reports Pending', value: '0', sub: '0 due this week', ico: 'filecheck', color: 'from-amber-500 to-orange-500' },
      { label: 'Approved YTD', value: '0', sub: '0 this month', ico: 'check2', color: 'from-violet-500 to-fuchsia-500' },
    ];

    function statusMeta(s) {
      return { Draft: { pill: 'slate', ico: 'pencil' }, Submitted: { pill: 'indigo', ico: 'clock' }, Approved: { pill: 'emerald', ico: 'check2' }, Revisions: { pill: 'rose', ico: 'alertc' } }[s] || { pill: 'slate', ico: 'pencil' };
    }

    function classCardHtml(c, mode = 'card') {
      const secKey = c.code.replace(' ', '-') + (c.sec ? c.sec.split(' ')[1] : '');
      const progBar = `<div class="mt-4"><div class="flex items-center justify-between text-xs text-slate-500 mb-1.5"><span class="text-slate-700"></span></div><div ><div style="width:50%"></div></div></div>`;
      if (mode === 'full') return `<div class="premium-card overflow-hidden transition hover:shadow-md cursor-pointer hover:border-indigo-200" data-instr-sec="${c.rawCode || secKey}">
    <div class="px-5 py-4 bg-gradient-to-r ${c.accent} text-white flex items-center justify-between">
      <div><div class="tracking-tight">${c.code} &middot; ${c.sec}</div><div class="text-xs text-white/85">${c.title}</div></div>
      ${pill(c.bc, c.badge)}
    </div>
    <div class="p-5">
      <div class="grid grid-cols-3 gap-3 text-xs text-slate-600">
        <div class="flex items-center gap-1.5">${ico('users', 'w-3.5 h-3.5 text-slate-400')}${c.students} students</div>
        <div class="flex items-center gap-1.5">${ico('mappin', 'w-3.5 h-3.5 text-slate-400')}${c.room}</div>
        <div class="flex items-center gap-1.5">${ico('clock', 'w-3.5 h-3.5 text-slate-400')}${c.sched}</div>
      </div>
      <div class="flex flex-wrap items-center gap-2 mt-4">

      </div>
    </div>
  </div>`;
      return `<div class="premium-card p-5 transition hover:shadow-md cursor-pointer hover:border-indigo-200" data-instr-sec="${c.rawCode || secKey}">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center text-white tracking-tight shrink-0">${c.code.split(' ')[0]}</div>
        <div><div class="text-slate-900 tracking-tight">${c.code} &middot; ${c.sec}</div><div class="text-xs text-slate-500">${c.title}</div></div>
      </div>
      ${pill(c.bc, c.badge)}
    </div>
    <div class="grid grid-cols-3 gap-3 mt-5 text-xs text-slate-600">
      <div class="flex items-center gap-1.5">${ico('users', 'w-3.5 h-3.5 text-slate-400')}${c.students} students</div>
      <div class="flex items-center gap-1.5">${ico('mappin', 'w-3.5 h-3.5 text-slate-400')}${c.room}</div>
      <div class="flex items-center gap-1.5">${ico('clock', 'w-3.5 h-3.5 text-slate-400')}${c.sched}</div>
    </div>
    ${progBar}
  </div>`;
    }

    function iOverview() {
      let stats = (window.DASHBOARD_METRICS?.stats?.length) ? window.DASHBOARD_METRICS.stats : I_STATS;
      stats = stats.filter(s => s.key !== 'pass_rate' && s.key !== 'incomplete_profiles');
      const statsHtml = stats.map(s => `<div class="premium-card p-5" data-metric="${s.key}">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow shrink-0">${ico(s.ico, 'w-5 h-5')}</div>
      <div class="min-w-0"><div class="text-xs text-slate-500 truncate">${s.label}</div><div class="text-slate-900 tracking-tight text-2xl" data-metric-value>${s.value}</div></div>
    </div>
    <div class="text-xs text-slate-500 mt-3" data-metric-sub>${s.sub || ''}</div>
  </div>`).join('');
      const subTracker = I_REPORTS.map(r => {
        const sm = statusMeta(r.status); return `<li class="px-5 py-4 flex items-start gap-3 hover:bg-slate-50 cursor-pointer">
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <div class="text-sm text-slate-900 truncate">${r.title}</div>
        ${pill(sm.pill, `<span class="inline-flex items-center gap-1">${ico(sm.ico, 'w-3 h-3')}${r.status}</span>`)}
      </div>
      <div class="text-xs text-slate-500 mt-0.5">${r.cls} &middot; ${r.due}</div>
    </div>
  </li>`;
      }).join('');

      // Dynamic Calendar for Overview Dashboard
      const calDays = [
        { d: 14, label: 'TUE', events: [{ t: 'Faculty Council Meeting', c: 'bg-indigo-500' }] },
        { d: 15, label: 'WED', events: [] },
        { d: 16, label: 'THU', events: [] },
        { d: 17, label: 'FRI', events: [] },
        { d: 18, label: 'SAT', events: [] },
        { d: 19, label: 'SUN', events: [] },
        { d: 20, label: 'MON', events: [] },
        { d: 21, label: 'TUE', events: [] },
        { d: 22, label: 'WED', events: [] },
        { d: 23, label: 'THU', events: [] },
        { d: 24, label: 'FRI', events: [] },
        { d: 25, label: 'SAT', events: [] },
        { d: 26, label: 'SUN', events: [] },
        { d: 27, label: 'MON', events: [] },
      ];

      S.activities.forEach(act => {
        const d = new Date(act.date);
        if (!isNaN(d) && d.getMonth() === 4) {
          const dateVal = d.getDate();
          const dayMatch = calDays.find(cd => cd.d === dateVal);
          if (dayMatch) {
            if (!dayMatch.events.some(e => e.t === act.title)) {
              dayMatch.events.push({ t: act.title, c: act.color || 'bg-emerald-500' });
            }
          }
        }
      });

      const calGrid = calDays.map(d => {
        let clickAttr = '';
        let cursorClass = '';
        if (d.events.length > 0) {
          const firstEvent = d.events[0];
          const actIdx = S.activities.findIndex(a => a.title === firstEvent.t);
          if (actIdx !== -1) {
            clickAttr = `onclick="S.selectedCalActivity = ${actIdx}; render();"`;
            cursorClass = 'cursor-pointer hover:bg-white hover:border-emerald-200 hover:shadow-md';
          }
        }
        return `<div ${clickAttr} class="border border-slate-100 rounded-xl p-2 min-h-[90px] bg-slate-50/50 transition duration-200 text-center flex flex-col justify-between ${cursorClass}">
        <div>
          <div class="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">${d.label}</div>
          <div class="text-slate-900 tracking-tight text-base font-bold mt-0.5">${d.d}</div>
        </div>
        <div class="mt-2 flex items-center justify-center gap-0.5 flex-wrap">${d.events.map(e => {
          const actIdx = S.activities.findIndex(a => a.title === e.t);
          const dotClickAttr = actIdx !== -1 ? `onclick="event.stopPropagation(); S.selectedCalActivity = ${actIdx}; render();"` : '';
          return `<span ${dotClickAttr} class="w-2 h-2 rounded-full ${e.c} cursor-pointer hover:scale-125 transition inline-block animate-pulse" title="${e.t}"></span>`;
        }).join('')}</div>
      </div>`;
      }).join('');

      const calWidgetHtml = `
      <div class="premium-card p-5">
        <div class="flex items-center justify-between mb-3.5">
          <div>
            <div class="text-slate-900 font-bold tracking-tight text-sm">Calendar of Activities</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Two-week preview of official dates</div>
          </div>
          <span class="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">${ico('calendar', 'w-3.5 h-3.5 text-slate-400')} May 2026</span>
        </div>
        <div class="grid grid-cols-7 gap-1.5">${calGrid}</div>
      </div>
      `;

      const modalHtml = (S.selectedCalActivity !== null && S.selectedCalActivity !== undefined) ? (() => {
        const act = S.activities[S.selectedCalActivity];
        if (!act) return '';
        return `
        <div id="calDetailOverlay" onclick="if(event.target === this) { S.selectedCalActivity = null; render(); }" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col ">
            <style>
              
            </style>
            <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <h3 class="font-bold text-slate-800 text-lg">Activity Details</h3>
              <button onclick="S.selectedCalActivity = null; render();" class="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">${ico('close', 'w-5 h-5')}</button>
            </div>
            <div class="p-6 space-y-5 overflow-y-auto">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
                  ${ico('calendar', 'w-6 h-6')}
                </div>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 leading-snug">${act.title}</h4>
                  <div class="mt-1.5 flex gap-2">${pill('indigo', act.scope)}${pill(act.status === 'Submitted' ? 'emerald' : 'slate', act.status)}</div>
                </div>
              </div>
              
              <div class="border-t border-slate-100 pt-5 space-y-4">
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">${ico('calendar', 'w-4 h-4')}</div>
                  <div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</div>
                    <div class="font-semibold text-slate-800 mt-0.5">${act.date}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">${ico('clock', 'w-4 h-4')}</div>
                  <div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time</div>
                    <div class="font-semibold text-slate-800 mt-0.5">${act.time}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">${ico('mappin', 'w-4 h-4')}</div>
                  <div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Venue</div>
                    <div class="font-semibold text-slate-800 mt-0.5">${act.venue}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button onclick="S.selectedCalActivity = null; render();" class="px-5 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm">Close</button>
            </div>
          </div>
        </div>
        `;
      })() : '';

      return `<div class="grid grid-cols-2 xl:grid-cols-4 gap-5">${statsHtml}</div>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
    <div class="xl:col-span-2 space-y-6">
      <div>
        <div class="flex items-end justify-between mb-4">
          <div><div class="text-slate-900 font-bold tracking-tight text-base">Your Sections</div><div class="text-xs text-slate-500 mt-0.5">CWTS &amp; LTS classes you handle this semester</div></div>
          <button class="text-sm text-emerald-700 inline-flex items-center gap-1">View all ${ico('arrowup', 'w-4 h-4')}</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">${I_CLASSES.map(c => classCardHtml(c, 'card')).join('')}</div>
      </div>
    </div>
    <div class="xl:col-span-1 space-y-6">
      ${calWidgetHtml}
      <div class="premium-card">
        <div class="px-5 py-4 border-b border-slate-100"><div class="text-slate-900 font-bold tracking-tight">Submission Tracker</div><div class="text-xs text-slate-500 mt-0.5">Upcoming activity reports</div></div>
        <ul class="divide-y divide-slate-100">${subTracker}</ul>
        <div class="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
          <div class="text-xs text-slate-500">2 due this week</div>
          <button onclick="S.instrPage = 'Accomplishment Reports'; render();" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm shadow-md shadow-emerald-200">Submit Report</button>
        </div>
      </div>
    </div>
  </div>
  ${modalHtml}`;
    }

    function iClasses() {
      const activeFilter = S.classesFilter || 'all';
      const filteredClasses = I_CLASSES.filter(c => {
        if (activeFilter !== 'all' && !c.code.startsWith(activeFilter)) return false;
        if (S.classesSearch) {
          const q = S.classesSearch.toLowerCase();
          const labelMap = { CWTS: 'cwts only', LTS: 'lts only' };
          if (labelMap[activeFilter] !== q) {
            return c.code.toLowerCase().includes(q) ||
              c.title.toLowerCase().includes(q) ||
              c.schedule.toLowerCase().includes(q) ||
              c.room.toLowerCase().includes(q);
          }
        }
        return true;
      });

      const filterBtnHtml = `
        <div class="relative inline-block text-left w-48 font-medium">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ${ico('filter', 'w-4 h-4 text-slate-500')}
          </span>
          <input id="classesFilterBtn" type="text" autocomplete="off"
                 class="w-full pl-9 pr-8 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-indigo-300 transition-colors shadow-sm cursor-pointer"
                 placeholder="Filter by Program"
                 value="${S.classesSearch || ''}" />
          <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ${ico('chevron', 'w-3.5 h-3.5')}
          </span>
          ${S.showClassesFilterMenu ? `
          <div id="classesFilterDropdown" class="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50">
            <div class="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-50 mb-1">Filter by Program</div>
            ${[
            { val: 'all', label: 'All Classes' },
            { val: 'CWTS', label: 'CWTS Only' },
            { val: 'LTS', label: 'LTS Only' }
          ].map(opt => {
            const isSel = activeFilter === opt.val;
            return `
              <button data-classes-filter-opt="${opt.val}" class="w-full text-left px-3.5 py-1.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${isSel ? 'text-emerald-600 font-semibold bg-indigo-50/40' : 'text-slate-700'}">
                <span>${opt.label}</span>
                ${isSel ? ico('check', 'w-4 h-4 text-emerald-600') : ''}
              </button>
              `;
          }).join('')}
          </div>
          ` : ''}
        </div>
      `;

      return `<div class="space-y-5">
    ${pageHdr('My Classes', 'All sections you handle this semester', filterBtnHtml)}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">${filteredClasses.map(c => classCardHtml(c, 'full')).join('')}</div>
  </div>`;
    }

    const I_PLANS = [];

    function iPlans() {
      // Merge local drafts/pending with approved activities from shared state
      const approvedFromShared = (S.activities || [])
        .filter(a => a.status === 'Submitted' || a.status === 'Approved')
        .map(a => ({ title: a.title, section: a.scope || '-', date: a.date, venue: a.venue || '-', status: a.status === 'Submitted' ? 'Pending' : 'Approved', desc: a.description || '', duration: a.time || '-', _shared: true }));
      const allPlans = [...I_PLANS, ...approvedFromShared.filter(ap => !I_PLANS.some(p => p.title === ap.title))];
      const planTbl = `
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th class="py-2 px-3 font-medium">Activity</th>
                <th class="py-2 px-3 font-medium">Section</th>
                <th class="py-2 px-3 font-medium">Date</th>
                <th class="py-2 px-3 font-medium">Venue</th>
                <th class="py-2 px-3 font-medium w-[120px]">Status</th>
              </tr>
            </thead>
            <tbody>
              ${allPlans.map((r, i) => `
                <tr class="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onclick="${r._shared ? '' : `S.selectedPlanIndex = ${i}; render();`}">
                  <td class="py-3 px-3 text-slate-900 font-medium">${r.title}</td>
                  <td class="py-3 px-3 text-slate-700">${r.section}</td>
                  <td class="py-3 px-3 text-slate-700">${r.date}</td>
                  <td class="py-3 px-3 text-slate-700">${r.venue}</td>
                  <td class="py-3 px-3 text-slate-700">${r.status === 'Revision' ? pill('amber', `<span class="inline-flex items-center gap-1">${ico('alertc', 'w-3 h-3')}Revision</span>`) : pill(r.status === 'Approved' ? 'emerald' : r.status === 'Pending' ? 'indigo' : 'slate', r.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      const classOpts = I_CLASSES.map(c => `<option>${c.code} &middot; ${c.sec}</option>`).join('');
      return `<div class="space-y-5">
    ${pageHdr('Activity Plans', 'Plan, schedule, and submit activities for coordinator approval')}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      ${card(planTbl, { title: 'Upcoming & Drafts', cls: 'lg:col-span-2' })}
      ${card(`<div class="space-y-3 text-sm">
        <div><div class="text-xs text-slate-500 mb-1">Title</div><input id="planTitleInput" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-300" placeholder="e.g. Tree-Planting Drive" /></div>
        <div class="grid grid-cols-2 gap-2">
          <div><div class="text-xs text-slate-500 mb-1">Date</div><input id="planDateInput" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-200" /></div>
          <div><div class="text-xs text-slate-500 mb-1">Duration (hrs)</div><input id="planDurationInput" type="number" value="3" class="w-full px-3 py-2 rounded-lg border border-slate-200" /></div>
        </div>
        <div><div class="text-xs text-slate-500 mb-1">Section</div><select id="planSectionInput" class="w-full px-3 py-2 rounded-lg border border-slate-200">${classOpts}</select></div>
        <div><div class="text-xs text-slate-500 mb-1">Objectives</div><textarea id="planObjInput" rows="3" placeholder="State 2-3 measurable objectives-" class="w-full px-3 py-2 rounded-lg border border-slate-200"></textarea></div>
        <div>
          <div class="text-xs text-slate-500 mb-1">Attachments</div>
          <label class="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 cursor-pointer transition text-sm">
            ${ico('upload', 'w-4 h-4')} <span id="planFileLabel">Add File</span>
            <input type="file" id="planFileInput" class="hidden" multiple />
          </label>
        </div>
        <div class="flex items-center gap-2 pt-1">
          <button id="planSaveDraftBtn" class="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Save Draft</button>
          <button id="planSubmitBtn" class="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Submit for Approval</button>
        </div>
      </div>`, { title: 'Plan Template' })}
    </div>
    ${S.selectedPlanIndex !== null ? (() => {
          const p = I_PLANS[S.selectedPlanIndex];
          return `
    <div id="planDetailModalOverlay" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 class="font-semibold text-slate-800 text-lg">Activity Details</h3>
          <button onclick="S.selectedPlanIndex = null; render();" class="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">${ico('close', 'w-5 h-5')}</button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900">${p.title}</h2>
              <div class="text-sm text-slate-500 mt-1">${p.section}</div>
            </div>
            ${p.status === 'Revision' ? pill('amber', `<span class="inline-flex items-center gap-1">${ico('alertc', 'w-3 h-3')}Revision</span>`) : pill(p.status === 'Approved' ? 'emerald' : p.status === 'Pending' ? 'indigo' : 'slate', p.status)}
          </div>
          
          ${p.status === 'Revision' && p.feedback ? `
          <div class="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-200 shadow-sm relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
            <div class="flex items-start gap-3 pl-2">
              <div class="text-amber-600 mt-0.5">${ico('alertc', 'w-5 h-5')}</div>
              <div>
                <h4 class="text-sm font-bold text-amber-900 mb-1 tracking-tight">Coordinator Feedback</h4>
                <p class="text-sm text-amber-800 leading-relaxed font-medium">${p.feedback}</p>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-50 rounded-lg p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Date</div>
              <div class="text-sm font-medium text-slate-900">${p.date}</div>
            </div>
            <div class="bg-slate-50 rounded-lg p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Duration</div>
              <div class="text-sm font-medium text-slate-900">${p.duration}</div>
            </div>
            <div class="bg-slate-50 rounded-lg p-3 col-span-2">
              <div class="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Venue</div>
              <div class="text-sm font-medium text-slate-900">${p.venue}</div>
            </div>
          </div>

          <div class="mb-6">
            <h4 class="text-sm font-medium text-slate-900 mb-2">Description</h4>
            <p class="text-sm text-slate-600 leading-relaxed">${p.desc || 'No description provided.'}</p>
          </div>

          ${p.file ? `
          <div>
            <h4 class="text-sm font-medium text-slate-900 mb-2">Attachments</h4>
            <div class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
              <div class="w-10 h-10 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                ${ico('filecheck', 'w-5 h-5')}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-900 truncate">${p.file}</div>
                <div class="text-xs text-slate-500">Document file</div>
              </div>
              <button class="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">Download</button>
            </div>
          </div>
          ` : ''}
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          ${p.status === 'Revision' ? `
            <button onclick="
              S.editingPlanIndex = ${S.selectedPlanIndex};
              S.selectedPlanIndex = null;
              
              setTimeout(() => {
                const plan = I_PLANS[S.editingPlanIndex];
                const titleInput = document.getElementById('planTitleInput');
                if (titleInput) { titleInput.value = plan.title; titleInput.focus(); }
                const dInput = document.getElementById('planDateInput');
                if (dInput && plan.date) {
                  const d = new Date(plan.date);
                  if (!isNaN(d)) dInput.value = d.toISOString().split('T')[0];
                }
                const durInput = document.getElementById('planDurationInput');
                if (durInput) durInput.value = parseInt(plan.duration) || 3;
                const secInput = document.getElementById('planSectionInput');
                if (secInput) {
                  for(let i=0; i<secInput.options.length; i++) {
                    if(secInput.options[i].text.includes(plan.section)) { secInput.selectedIndex = i; break; }
                  }
                }
                const objInput = document.getElementById('planObjInput');
                if (objInput) objInput.value = plan.desc || '';
                const submitBtn = document.getElementById('planSubmitBtn');
                if (submitBtn) submitBtn.innerHTML = 'Update Activity';
              }, 50);
              render();
            " class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
              ${ico('pencil', 'w-4 h-4')} Revise Activity
            </button>
          ` : ''}
          <button onclick="
            I_PLANS.splice(${S.selectedPlanIndex}, 1);
            S.selectedPlanIndex = null;
            render();
          " class="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2">
            ${ico('trash', 'w-4 h-4')} Delete
          </button>
        </div>
      </div>
    </div>
    `
        })() : ''}
  </div>`;
    }

    function iReports() {
      const listHtml = I_REPORTS.map((r, i) => {
        const sm = statusMeta(r.status); return `<li class="px-5 py-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer" onclick="S.selectedReportIndex = ${i}; render();">
    <div class="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">${ico('filetext', 'w-4 h-4')}</div>
    <div class="flex-1 min-w-0"><div class="text-sm text-slate-900 truncate">${r.title}</div><div class="text-xs text-slate-500">${r.cls} &middot; ${r.due}</div></div>
    ${pill(sm.pill, `<span class="inline-flex items-center gap-1">${ico(sm.ico, 'w-3 h-3')}${r.status}</span>`)}
    ${ico('chevron', 'w-4 h-4 text-slate-300')}
  </li>`;
      }).join('');
      const planOpts = I_PLANS.map(p => `<option value="${p.title}">${p.title}</option>`).join('');
      return `<div class="space-y-5">
    <datalist id="activityDatalist">${planOpts}</datalist>
    ${pageHdr('Accomplishment Reports', 'Document and submit completed activities')}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      ${card(`<ul class="-mx-5 -my-5 divide-y divide-slate-100">${listHtml}</ul>`, { title: 'All Reports', cls: 'lg:col-span-2' })}
      ${card(`<div class="space-y-3 text-sm">
        <div><div class="text-xs text-slate-500 mb-1">Linked Activity</div><input type="text" id="reportLinkedActivity" list="activityDatalist" placeholder="Select or type an activity..." class="w-full px-3 py-2 rounded-lg border border-slate-200" /></div>
        <div><div class="text-xs text-slate-500 mb-1">Beneficiaries</div><input type="text" inputmode="numeric" pattern="[0-9]*" id="reportBenInput" value="42" class="w-full px-3 py-2 rounded-lg border border-slate-200" /></div>
        <div><div class="text-xs text-slate-500 mb-1">Narrative</div><textarea id="reportNarInput" rows="4" placeholder="Describe the activity, outputs, and impact-" class="w-full px-3 py-2 rounded-lg border border-slate-200"></textarea></div>
        <label class="block border-2 border-dashed border-emerald-200 rounded-lg p-4 text-center bg-emerald-50/50 cursor-pointer hover:bg-emerald-50">
          ${ico('upload', 'w-5 h-5 text-emerald-600 mx-auto')}
          <span id="reportFileLabel" class="text-xs text-slate-600 mt-1 block">Drop photos, attendance sheet, Accomplishment Reports</span>
          <input type="file" id="reportFileInput" class="hidden" multiple onchange="document.getElementById('reportFileLabel').innerText = this.files.length + ' file(s) attached'" />
        </label>
        <div class="flex items-center gap-2 pt-1">
          <button onclick="
            const t = document.getElementById('reportLinkedActivity').value;
            const b = document.getElementById('reportBenInput').value;
            const n = document.getElementById('reportNarInput').value;
            const r = { title: t + (t.includes('Report') ? '' : ' Report'), cls: 'CWTS 1 &middot; Sec A', due: 'Saved just now', status: 'Draft', beneficiaries: parseInt(b)||0, narrative: n };
            if (S.editingReportIndex !== null) I_REPORTS[S.editingReportIndex] = { ...I_REPORTS[S.editingReportIndex], ...r };
            else I_REPORTS.unshift(r);
            S.editingReportIndex = null;
            showToast('Report draft has been saved.', 'info', 'Draft Saved');
            render();
          " class="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Save Draft</button>
          <button onclick="
            const t = document.getElementById('reportLinkedActivity').value;
            const b = document.getElementById('reportBenInput').value;
            const n = document.getElementById('reportNarInput').value;
            const r = { title: t + (t.includes('Report') ? '' : ' Report'), cls: 'CWTS 1 &middot; Sec A', due: 'Submitted just now', status: 'Submitted', beneficiaries: parseInt(b)||0, narrative: n };
            if (S.editingReportIndex !== null) I_REPORTS[S.editingReportIndex] = { ...I_REPORTS[S.editingReportIndex], ...r };
            else I_REPORTS.unshift(r);
            S.editingReportIndex = null;
            render();
            showToast('Report submitted for approval.', 'success', 'Report Submitted');
          " class="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">${ico('send', 'w-4 h-4')} Submit</button>
        </div>
      </div>`, { title: 'New Report Draft' })}
    </div>
    ${S.selectedReportIndex !== null ? (() => {
          const r = I_REPORTS[S.selectedReportIndex];
          return `
    <div id="reportDetailModalOverlay" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 class="font-semibold text-slate-800 text-lg">Report Details</h3>
          <button onclick="S.selectedReportIndex = null; render();" class="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">${ico('close', 'w-5 h-5')}</button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900">${r.title}</h2>
              <div class="text-sm text-slate-500 mt-1">${r.cls} &middot; ${r.due}</div>
            </div>
            ${pill(statusMeta(r.status).pill, `<span class="inline-flex items-center gap-1">${ico(statusMeta(r.status).ico, 'w-3 h-3')}${r.status}</span>`)}
          </div>
          
          ${r.status === 'Revisions' && r.feedback ? `
          <div class="mb-6 bg-amber-50 rounded-lg p-4 border border-amber-200 shadow-sm relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
            <div class="flex items-start gap-3 pl-2">
              <div class="text-amber-600 mt-0.5">${ico('alertc', 'w-5 h-5')}</div>
              <div>
                <h4 class="text-sm font-bold text-amber-900 mb-1 tracking-tight">Coordinator Feedback</h4>
                <p class="text-sm text-amber-800 leading-relaxed font-medium">${r.feedback}</p>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-50 rounded-lg p-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Beneficiaries</div>
              <div class="text-sm font-medium text-slate-900">${r.beneficiaries || 0}</div>
            </div>
          </div>

          <div class="mb-6">
            <h4 class="text-sm font-medium text-slate-900 mb-2">Narrative</h4>
            <p class="text-sm text-slate-600 leading-relaxed">${r.narrative || 'No narrative provided.'}</p>
          </div>

          ${r.file ? `
          <div>
            <h4 class="text-sm font-medium text-slate-900 mb-2">Attachments</h4>
            <div class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
              <div class="w-10 h-10 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                ${ico('filecheck', 'w-5 h-5')}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-900 truncate">${r.file}</div>
                <div class="text-xs text-slate-500">Document file</div>
              </div>
              <button class="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">Download</button>
            </div>
          </div>
          ` : ''}
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          ${(r.status === 'Draft' || r.status === 'Revisions') ? `
            <button onclick="
              S.editingReportIndex = ${S.selectedReportIndex};
              S.selectedReportIndex = null;
              setTimeout(() => {
                const rep = I_REPORTS[S.editingReportIndex];
                const linkInput = document.getElementById('reportLinkedActivity');
                if (linkInput) {
                  let t = rep.title || '';
                  if (t.endsWith(' Report')) t = t.slice(0, -7);
                  linkInput.value = t;
                }
                const benInput = document.getElementById('reportBenInput');
                if (benInput) benInput.value = rep.beneficiaries || '';
                const narInput = document.getElementById('reportNarInput');
                if (narInput) { narInput.value = rep.narrative || ''; narInput.focus(); }
              }, 50);
              render();
            " class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
              ${ico('pencil', 'w-4 h-4')} Edit Report
            </button>
          ` : ''}
          <button onclick="
            I_REPORTS.splice(${S.selectedReportIndex}, 1);
            S.selectedReportIndex = null;
            render();
          " class="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2">
            ${ico('trash', 'w-4 h-4')} Delete
          </button>
        </div>
      </div>
    </div>
    `
        })() : ''}
  </div>`;
    }

    const I_ANNOUNCEMENTS = [];

    function iAnnouncements() {
      const items = I_ANNOUNCEMENTS.map(a => `<li class="flex gap-4">
    <div class="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br ${a.color} flex items-center justify-center text-white text-xs tracking-tight">${a.initials}</div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <span class="text-slate-700">${a.author}</span><span class="w-1 h-1 rounded-full bg-slate-300 inline-block"></span><span>${a.time}</span>
        ${a.pinned ? `<span class="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-emerald-700">${ico('pin', 'w-3 h-3')} Pinned</span>` : ''}
      </div>
      <div class="text-sm text-slate-900 mt-1">${a.title}</div>
      <p class="text-sm text-slate-600 mt-1 leading-relaxed">${a.body}</p>
    </div>
  </li>`).join('');
      return `<div class="space-y-5">
    ${pageHdr('Announcements', 'Official updates from the NSTP & Dean\'s offices', `<div class="relative">${ico('search', 'w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2')}<input placeholder="Search announcements-" class="pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-slate-200 w-64" /></div>`)}
    ${card(`<ul class="space-y-5">${items}</ul>`)}
  </div>`;
    }

    function iCalendar() {
      const calDays = [
        { d: 14, label: 'TUE', events: [{ t: 'Faculty Council Meeting', c: 'bg-indigo-500' }] },
        { d: 15, label: 'WED', events: [] },
        { d: 16, label: 'THU', events: [{ t: 'Midterm Reports Due', c: 'bg-rose-500' }] },
        { d: 17, label: 'FRI', events: [] },
        { d: 18, label: 'SAT', events: [] },
        { d: 19, label: 'SUN', events: [] },
        { d: 20, label: 'MON', events: [{ t: 'OCR Upload Window', c: 'bg-emerald-500' }] },
      ];

      S.activities.forEach(act => {
        const d = new Date(act.date);
        if (!isNaN(d) && d.getMonth() === 4) {
          const dateVal = d.getDate();
          const dayMatch = calDays.find(cd => cd.d === dateVal);
          if (dayMatch) {
            if (!dayMatch.events.some(e => e.t === act.title)) {
              dayMatch.events.push({ t: act.title, c: act.color || 'bg-emerald-500' });
            }
          }
        }
      });

      const calGrid = calDays.map(d => `<div class="border border-slate-200 rounded-2xl p-4 min-h-[140px] bg-white shadow-sm hover:border-emerald-300 hover:shadow-md transition duration-200">
        <div class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">${d.label}</div>
        <div class="text-slate-900 tracking-tight text-2xl mt-1 font-bold">${d.d}</div>
        <div class="mt-3 space-y-1.5">${d.events.map(e => `<div class="${e.c} text-[11px] px-2.5 py-1.5 rounded-lg text-white truncate font-medium shadow-sm">${e.t}</div>`).join('')}</div>
      </div>`).join('');

      const actList = S.activities.map((a, i) => `<li onclick="S.selectedCalActivity = ${i}; render();" class="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition">
        <div class="w-1.5 self-stretch rounded-full ${a.color}"></div>
        <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">${ico('calendar', 'w-5 h-5')}</div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-slate-900 truncate">${a.title}</div>
          <div class="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap font-medium">
            <span class="inline-flex items-center gap-1">${ico('calendar', 'w-3.5 h-3.5 text-slate-400')}${a.date}</span>
            <span class="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
            <span class="inline-flex items-center gap-1">${ico('clock', 'w-3.5 h-3.5 text-slate-400')}${a.time}</span>
            <span class="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
            <span class="inline-flex items-center gap-1">${ico('mappin', 'w-3.5 h-3.5 text-slate-400')}${a.venue}</span>
          </div>
        </div>
        ${pill('indigo', a.scope)}
        ${pill(a.status === 'Submitted' ? 'emerald' : 'slate', a.status)}
      </li>`).join('');

      const modalHtml = S.selectedCalActivity !== null && S.selectedCalActivity !== undefined ? (() => {
        const act = S.activities[S.selectedCalActivity];
        if (!act) return '';
        return `
        <div id="calDetailOverlay" onclick="if(event.target === this) { S.selectedCalActivity = null; render(); }" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col ">
            <style>
              
            </style>
            <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
              <h3 class="font-bold text-slate-800 text-lg">Activity Details</h3>
              <button onclick="S.selectedCalActivity = null; render();" class="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">${ico('close', 'w-5 h-5')}</button>
            </div>
            <div class="p-6 space-y-5 overflow-y-auto">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 shrink-0">
                  ${ico('calendar', 'w-6 h-6')}
                </div>
                <div>
                  <h4 class="text-lg font-bold text-slate-900 leading-snug">${act.title}</h4>
                  <div class="mt-1.5 flex gap-2">${pill('indigo', act.scope)}${pill(act.status === 'Submitted' ? 'emerald' : 'slate', act.status)}</div>
                </div>
              </div>
              
              <div class="border-t border-slate-100 pt-5 space-y-4">
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">${ico('calendar', 'w-4 h-4')}</div>
                  <div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</div>
                    <div class="font-semibold text-slate-800 mt-0.5">${act.date}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">${ico('clock', 'w-4 h-4')}</div>
                  <div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time</div>
                    <div class="font-semibold text-slate-800 mt-0.5">${act.time}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-sm text-slate-600">
                  <div class="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">${ico('mappin', 'w-4 h-4')}</div>
                  <div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Venue</div>
                    <div class="font-semibold text-slate-800 mt-0.5">${act.venue}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button onclick="S.selectedCalActivity = null; render();" class="px-5 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm">Close</button>
            </div>
          </div>
        </div>
        `;
      })() : '';

      return `<div class="space-y-5">
        ${pageHdr('Activity Calendar', 'Plan and view official activities for CWTS & LTS')}
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">${calGrid}</div>
        ${card(`<ul class="-mx-6 -my-5 divide-y divide-slate-100">${actList}</ul>`, { title: 'All Scheduled Activities', subtitle: `${S.activities.length} published events` })}
        ${modalHtml}
      </div>`;
    }


    function renderInstructor() {
      const pd = PROFILE_DATA[S.email] || PROFILE_DATA.instructor || {};
      const userName = pd.fullName || 'Prof. Julian Santos';
      const userInitials = getInitials(userName) || 'JS';
      const first = userName.replace(/^(Dr\.|Prof\.|1Lt\.|Col\.|Capt\.|Lt\.)\s+/i, '').split(' ')[0];

      // Dynamic Sync of I_CLASSES
      I_CLASSES.length = 0;
      const instructorSections = (typeof SECTIONS !== 'undefined') ? SECTIONS.filter(s => {
        return s.instructor && s.instructor.toLowerCase() === userName.toLowerCase();
      }) : [];
      
      let totalStudents = 0;
      
      instructorSections.forEach(s => {
        let mainCode = s.code;
        let secName = '';
        const dashIdx = s.code.indexOf('-');
        if (dashIdx !== -1) {
          mainCode = s.code.substring(0, dashIdx).trim();
          secName = 'Sec ' + s.code.substring(dashIdx + 1).trim();
        }
        
        totalStudents += s.students || 0;
        
        I_CLASSES.push({
          code: mainCode,
          sec: secName,
          title: s.program === 'CWTS' ? 'Civic Welfare Training Service' : (s.program === 'LTS' ? 'Literacy Training Service' : 'Reserve Officers\' Training Corps'),
          students: s.students || 0,
          room: s.room || 'TBA',
          sched: s.schedule || 'Sat 8:00 AM',
          accent: s.program === 'CWTS' ? 'from-emerald-500 to-teal-500' : (s.program === 'LTS' ? 'from-indigo-500 to-blue-500' : 'from-rose-500 to-orange-500'),
          bc: s.program === 'CWTS' ? 'emerald' : (s.program === 'LTS' ? 'indigo' : 'rose'),
          badge: s.status || 'Active',
          rawCode: s.code
        });
      });

      // Update I_STATS dynamically
      I_STATS[0].value = instructorSections.length.toString();
      I_STATS[1].value = totalStudents.toString();

      const nav = [
        { name: 'Overview', ico: 'grid' },
        { name: 'My Classes', ico: 'book' },
        { name: 'Planning & Reports', isHeader: true },
        { name: 'Activity Plans', ico: 'clipboard', badge: 4 },
        { name: 'Accomplishment Reports', ico: 'filetext', badge: 3 },
        { name: 'Updates', isHeader: true },
        { name: 'Announcements', ico: 'megaphone' },
      ].map(n => n.isHeader ? n : { ...n, active: S.instrPage === n.name });
      const pageMap = { 'Overview': iOverview(), 'My Classes': iClasses(), 'Activity Plans': iPlans(), 'Accomplishment Reports': iReports(), 'Announcements': iAnnouncements() };
      return renderShell({ theme: 'emerald', brand: 'DNSC CWTS &middot; LTS', brandSub: 'Instructor Portal', navItems: nav, userName: userName, userRole: 'CWTS &middot; LTS Instructor', userInitials: userInitials, greeting: S.instrPage === 'Overview' ? `Good morning, ${first}` : S.instrPage, context: 'NSTP Management System', ctaLabel: S.instrPage === 'Activity Plans' ? 'New Activity Plan' : S.instrPage === 'Accomplishment Reports' ? 'New Report' : 'New Activity Plan', content: (pageMap[S.instrPage] || '') + iStudentModalHtml() });
    }

    function iStudentModalHtml() {
      if (!S.instrSelectedSection) return '';
      const secCode = S.instrSelectedSection;
      const students = SECTION_STUDENTS[secCode] || [];
      const rows = students.map((st, i) => {
        return `<tr class="border-b border-slate-50 hover:bg-emerald-50/40 transition">
          <td class="py-2.5 px-3 text-slate-400 text-xs text-center">${i + 1}</td>
          <td class="py-2.5 px-3 text-slate-600 text-sm">${st.studentNo || '-'}</td>
          <td class="py-2.5 px-3 font-medium text-slate-900 text-sm">${st.name}</td>
          <td class="py-2.5 px-3"><span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">${st.program || secCode.replace(/-\\d+[A-Z]$/, '')}</span></td>
          <td class="py-2.5 px-3 text-slate-600 text-sm">${st.dob || '-'}</td>
          <td class="py-2.5 px-3 text-slate-600 text-sm">${st.gender || '-'}</td>
          <td class="py-2.5 px-3 text-slate-600 text-sm max-w-[160px] truncate" title="${st.address || ''}">${st.address || '-'}</td>
          <td class="py-2.5 px-3 text-slate-600 text-sm">${st.cellNo || '-'}</td>
          <td class="py-2.5 px-3 text-slate-600 text-sm">${st.email || '-'}</td>
          <td class="py-2.5 px-3 text-center">${typeof gradeStatusBadge === 'function' ? gradeStatusBadge(st.grade) : (st.grade || '—')}</td>
        </tr>`;
      }).join('');
      const emptyRow = `<tr><td colspan="10" class="py-10 text-center text-slate-400 text-sm">No students enrolled in this section.</td></tr>`;
      return `
  <div id="instrStudentModalOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
     <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-6xl mx-4 flex flex-col max-h-[88vh]">
      
      <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-between shrink-0 rounded-t-2xl">
        <div>
          <div class="font-semibold tracking-tight">${secCode} &middot; Student Section</div>
          <div class="text-emerald-100 text-xs mt-0.5">${students.length} enrolled</div>
        </div>
        <button id="instrStudentModalClose" class="text-emerald-100 hover:text-white p-1 transition">${ico('close', 'w-5 h-5')}</button>
      </div>
      <div class="overflow-auto flex-1">
        <table class="w-full text-sm min-w-[1000px]">
          <thead class="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
            <tr class="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th class="py-3 px-3 font-medium w-8 text-center">#</th>
              <th class="py-3 px-3 font-medium">Student No.</th>
              <th class="py-3 px-3 font-medium">Student Name</th>
              <th class="py-3 px-3 font-medium">Program</th>
              <th class="py-3 px-3 font-medium">Date of Birth</th>
              <th class="py-3 px-3 font-medium">Gender</th>
              <th class="py-3 px-3 font-medium">Address</th>
              <th class="py-3 px-3 font-medium">Contact No.</th>
              <th class="py-3 px-3 font-medium">Email Address</th>
              <th class="py-3 px-3 font-medium text-center">Grade</th>
            </tr>
          </thead>
          <tbody>${rows || emptyRow}</tbody>
        </table>
      </div>
    </div>
  </div>`;
    }
