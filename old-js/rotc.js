    /* ================================================================
       ROTC PAGES
    ================================================================ */
    const R_REPORTS = [];
    const R_BULLETIN = [];

    function rStatusMeta(s) {
      return { draft: { label: 'Draft', pill: 'slate', ico: 'pencil' }, review: { label: 'Under Review', pill: 'indigo', ico: 'send' }, approved: { label: 'Approved', pill: 'emerald', ico: 'check2' }, revisions: { label: 'Revisions', pill: 'rose', ico: 'alertc' } }[s] || { label: 'Draft', pill: 'slate', ico: 'pencil' };
    }

    function bulletinCard() {
      const items = R_BULLETIN.map(b => `<li class="px-6 py-4">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${b.color}">${b.tag}</span>
      ${b.pinned ? `<span class="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">${ico('pin', 'w-3 h-3')} Pinned</span>` : ''}
      <span class="ml-auto text-[11px] text-slate-400">${b.time}</span>
    </div>
    <div class="text-sm text-slate-900 leading-snug">${b.title}</div>
  </li>`).join('');
      return `<section class="bg-white border border-slate-200 rounded-md">
    <div class="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
      <div class="w-9 h-9 rounded bg-slate-900 text-amber-300 flex items-center justify-center">${ico('megaphone', 'w-4 h-4')}</div>
      <div><div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">Bulletin Board</div><div class="text-slate-900 tracking-tight">Official Notices</div></div>
    </div>
    <ul class="divide-y divide-slate-100">${items}</ul>
    <div class="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
      <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">Next Formation</div>
      <div class="flex items-center gap-3 text-sm text-slate-700">
        <div class="flex items-center gap-1.5">${ico('clock', 'w-3.5 h-3.5 text-slate-400')} 0700H</div>
        <span class="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
        <div class="flex items-center gap-1.5">${ico('mappin', 'w-3.5 h-3.5 text-slate-400')} Parade Grounds</div>
      </div>
    </div>
  </section>`;
    }

    function rOverview() {
      const defaultStats = [
        { key: 'total_cadets', label: 'Total Cadets', value: '0', sub: 'ROTC component' },
        { key: 'active_platoons', label: 'Active Platoons', value: '0', sub: 'From sections table' },
        { key: 'reports_open', label: 'Reports Open', value: '0', sub: 'Pending review' },
        { key: 'approved_ytd', label: 'Approved YTD', value: '0', sub: 'From database' },
      ];
      let stats = (window.DASHBOARD_METRICS?.stats?.length ? window.DASHBOARD_METRICS.stats : defaultStats);
      stats = stats.filter(s => s.key !== 'pass_rate' && s.key !== 'incomplete_profiles');
      const statBoxes = stats.map(s => `<div class="bg-white border border-slate-200 rounded-md p-5" data-metric="${s.key}">
    <div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">${s.label}</div>
    <div class="text-slate-900 tracking-tight text-3xl mt-2" data-metric-value>${s.value}</div>
    <div class="text-xs text-slate-500 mt-1" data-metric-sub>${s.sub || ''}</div>
  </div>`).join('');
      const repItems = R_REPORTS.map(r => {
        const sm = rStatusMeta(r.status); const barClr = r.status === 'approved' ? 'bg-emerald-500' : r.status === 'revisions' ? 'bg-rose-500' : r.status === 'review' ? 'bg-indigo-500' : 'bg-slate-400'; return `<div class="px-6 py-4 hover:bg-slate-50">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">${ico('filetext', 'w-4 h-4')}</div>
        <div class="min-w-0"><div class="text-sm text-slate-900 truncate">${r.title}</div><div class="text-xs text-slate-500">${r.due}</div></div>
      </div>
      ${pill(sm.pill, `<span class="inline-flex items-center gap-1">${ico(sm.ico, 'w-3 h-3')}${sm.label}</span>`)}
    </div>
    <div class="mt-3 flex items-center gap-3">
      <div class="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ${barClr}" style="width:${r.progress}%"></div></div>
      <div class="text-[11px] text-slate-500 w-10 text-right tabular-nums">${r.progress}%</div>
    </div>
  </div>`;
      }).join('');

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = now.getDate();

      let cells = '';
      for (let i = 0; i < firstDay; i++) cells += '<div></div>';
      for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today;
        const actIdx = S.activities.findIndex(a => {
          try {
            const dateObj = new Date(a.date);
            return dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === d;
          } catch (e) { return false; }
        });
        const hasEvent = actIdx !== -1;

        let cls = '';
        let clickAttr = '';
        if (isToday) {
          cls = 'w-7 h-7 flex items-center justify-center text-xs rounded-full bg-indigo-600 text-white font-semibold cursor-pointer';
          if (hasEvent) {
            clickAttr = `onclick="S.selectedCalActivity = ${actIdx}; render();"`;
          }
        } else if (hasEvent) {
          cls = 'w-7 h-7 flex items-center justify-center text-xs rounded-full bg-indigo-50 text-indigo-700 font-semibold ring-1 ring-indigo-200 cursor-pointer hover:bg-indigo-100 transition';
          clickAttr = `onclick="S.selectedCalActivity = ${actIdx}; render();"`;
        } else {
          cls = 'w-7 h-7 flex items-center justify-center text-xs rounded-full text-slate-600';
        }
        cells += `<div ${clickAttr} class="${cls}">${d}</div>`;
      }

      const calWidgetHtml = `
      <div class="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="text-slate-900 font-bold tracking-tight text-sm">Calendar of Activities</div>
            <div class="text-xs text-slate-500 mt-0.5">${monthNames[month]} ${year}</div>
          </div>
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">${ico('calendar', 'w-4 h-4')}</div>
        </div>
        <div class="grid grid-cols-7 gap-1 mb-1">${dayNames.map(d => `<div class="text-center text-[10px] font-medium text-slate-400 uppercase">${d}</div>`).join('')}</div>
        <div class="grid grid-cols-7 gap-1">${cells}</div>
        <div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
          <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>Today</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-50 ring-1 ring-indigo-200 inline-block font-semibold"></span>Has activity</span>
        </div>
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

      return `<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">${statBoxes}</div>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
    <section class="xl:col-span-2 bg-white border border-slate-200 rounded-md">
      <div class="px-6 py-4 border-b border-slate-200"><div class="text-[11px] uppercase tracking-[0.18em] text-slate-500">Documentation</div><div class="text-slate-900 tracking-tight">Accomplishment Reports</div></div>
      <div class="divide-y divide-slate-100">${repItems}</div>
    </section>
    <div class="xl:col-span-1 space-y-6">
      ${calWidgetHtml}
    </div>
  </div>
  ${modalHtml}`;
    }

    const SPEC_COLORS = { Rifle: 'bg-rose-50 text-rose-700 border-rose-100', Signal: 'bg-indigo-50 text-indigo-700 border-indigo-100', Medical: 'bg-emerald-50 text-emerald-700 border-emerald-100', Support: 'bg-amber-50 text-amber-700 border-amber-100' };
    const SPEC_DOT = { Rifle: 'bg-rose-500', Signal: 'bg-indigo-500', Medical: 'bg-emerald-500', Support: 'bg-amber-500' };

    function rPlatoon() {
      let entries = Object.entries(S.platoons);
      if (S.platSearch) {
        const term = S.platSearch.toLowerCase();
        entries = entries.filter(([name]) => name.toLowerCase().includes(term));
      }
      if (S.platoonFilter === '1st') {
        entries = entries.filter(([name]) => (S.platoonSemesters[name] || '1st Semester') === '1st Semester');
      } else if (S.platoonFilter === '2nd') {
        entries = entries.filter(([name]) => (S.platoonSemesters[name] || '1st Semester') === '2nd Semester');
      }

      const thead = `<thead><tr class="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
        <th class="py-2 px-3 font-medium">Platoon Name</th>
        <th class="py-2 px-3 font-medium">Total Cadets</th>
        <th class="py-2 px-3 font-medium">Status</th>
      </tr></thead>`;

      const tbody = `<tbody>${entries.map(([name, members]) => {
        const sem = S.platoonSemesters[name] || '1st Semester';
        return `<tr data-plat-row="${name}" class="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition">
          <td class="py-3 px-3 text-slate-900 font-medium">${name} Platoon</td>
          <td class="py-3 px-3 text-slate-700">${members.length} Cadets</td>
          <td class="py-3 px-3">${pill(sem === '1st Semester' ? 'emerald' : 'amber', sem)}</td>
        </tr>`;
      }).join('')}</tbody>`;

      const clickableTbl = `<div class="overflow-x-auto"><table class="w-full text-sm">${thead}${tbody}</table></div>`;

      const newPlatoonModal = S.platoonForm ? `
  <div id="newPlatoonOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg mx-4">
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div class="text-slate-900 tracking-tight">New Platoon</div>
          <div class="text-xs text-slate-500">Fill in the details to add a new ROTC platoon</div>
        </div>
        <button id="platoonFormClose" class="text-slate-400 hover:text-slate-700 p-1">${ico('close', 'w-4 h-4')}</button>
      </div>
      <div class="p-6 space-y-4 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-slate-500 mb-1">Platoon Name</div>
            <input id="platNameInput" placeholder="e.g. Delta" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" />
          </div>
          <div>
            <div class="text-xs text-slate-500 mb-1">Status</div>
            <select id="platStatusInput" class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-300">
              <option>1st Semester</option>
              <option>2nd Semester</option>
            </select>
          </div>
        </div>
        <div>
          <div class="text-xs text-slate-500 mb-1">Import Cadets List XLSX File</div>
          <button id="modalPlatXlsxBtn" class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-sm">
            ${ico('upload', 'w-4 h-4')} Upload XLSX List
          </button>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
        <button id="platoonFormCancel" onclick="S.platoonForm = false; render();" class="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</button>
        <button id="platoonFormCreate" onclick="
          const name = document.getElementById('platNameInput')?.value?.trim();
          const sem = document.getElementById('platStatusInput')?.value || '1st Semester';
          if (!name) { document.getElementById('platNameInput').focus(); return; }
          if (!S.platoons[name]) S.platoons[name] = [];
          if (!S.platoonSemesters) S.platoonSemesters = {};
          S.platoonSemesters[name] = sem;
          S.platoonForm = false;
          showToast('Platoon <strong>' + name + '</strong> has been created.', 'success', 'Platoon Created');
          render();
        " class="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800">${ico('shield', 'w-4 h-4')} Create Platoon</button>
      </div>
    </div>
  </div>` : '';

      const totalCadets = Object.values(S.platoons).reduce((sum, arr) => sum + arr.length, 0);

      const platoonModal = S.selectedPlatoon ? (() => {
        const name = S.selectedPlatoon;
        const students = S.platoons[name] || [];
        const rows = students.map((st, i) => {
          const isSel = S.selectedStudentRow === i;
          return `<tr data-rotc-student-row="${i}" class="border-b border-slate-50 cursor-pointer transition ${isSel ? 'bg-rose-50/60' : 'hover:bg-indigo-50/40'}">
            <td class="py-2.5 px-3 text-slate-400 text-xs text-center">${i + 1}</td>
            <td class="py-2.5 px-3 font-medium text-slate-900 text-sm">${st.name}</td>
            <td class="py-2.5 px-3"><span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${st.rank}</span></td>
            <td class="py-2.5 px-3"><span class="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">${st.spec}</span></td>
            <td class="py-2.5 px-3 text-slate-600 text-sm">${st.dob || '-??'}</td>
            <td class="py-2.5 px-3 text-slate-600 text-sm">${st.gender || '-??'}</td>
            <td class="py-2.5 px-3 text-slate-600 text-sm max-w-[160px] truncate">${st.address || '-??'}</td>
            <td class="py-2.5 px-3 text-slate-600 text-sm">${st.cellNo || '-??'}</td>
            <td class="py-2.5 px-3 text-slate-600 text-sm">${st.email || '-??'}</td>
            <td class="py-2.5 px-3 text-right w-24">${isSel ? `<button onclick="event.stopPropagation(); S.platoons['${name}'].splice(${i}, 1); S.selectedStudentRow = null; render();" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700">${ico('close', 'w-3 h-3')} Remove</button>` : `<span class="text-slate-300">${ico('chevron', 'w-4 h-4')}</span>`}</td>
          </tr>`;
        }).join('');
        const emptyRow = `<tr><td colspan="10" class="py-10 text-center text-slate-400 text-sm">No officers assigned to this section.</td></tr>`;
        return `
  <div id="platoonModalOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
     <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-6xl mx-4 flex flex-col max-h-[88vh]">
      
      <div class="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0 rounded-t-2xl">
        <div>
          <div class="font-semibold tracking-tight">${name} Platoon -?? Assign Cadets Section</div>
          <div class="text-slate-300 text-xs mt-0.5">${students.length} assigned &middot; Click a row to select &amp; remove</div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="delete S.platoons['${name}']; S.selectedPlatoon = null; S.selectedStudentRow = null; render();" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 transition">${ico('trash', 'w-3.5 h-3.5')} Delete Section</button>
          <button onclick="S.selectedPlatoon = null; S.selectedStudentRow = null; render();" class="text-slate-300 hover:text-white p-1 ml-2">${ico('close', 'w-5 h-5')}</button>
        </div>
      </div>
      <div class="overflow-auto flex-1">
        <table class="w-full text-sm min-w-[1000px]">
          <thead class="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
            <tr class="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th class="py-3 px-3 font-medium w-8">#</th>
              <th class="py-3 px-3 font-medium">Officer Name</th>
              <th class="py-3 px-3 font-medium">Rank</th>
              <th class="py-3 px-3 font-medium">Specialty</th>
              <th class="py-3 px-3 font-medium">Date of Birth</th>
              <th class="py-3 px-3 font-medium">Gender</th>
              <th class="py-3 px-3 font-medium">Residential Address</th>
              <th class="py-3 px-3 font-medium">Cell #</th>
              <th class="py-3 px-3 font-medium">Email Address</th>
              <th class="py-3 px-3 font-medium w-24">Action</th>
            </tr>
          </thead>
          <tbody>${students.length ? rows : emptyRow}</tbody>
        </table>
      </div>
      <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/60 shrink-0">
        <div class="text-[11px] uppercase tracking-wider text-slate-500 mb-3">Assign Officer to ${name} Section</div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          <div><div class="text-xs text-slate-500 mb-1">Officer Name</div><input id="platStudentName" placeholder="Officer Name (Last, First M.)" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
          <div><div class="text-xs text-slate-500 mb-1">Rank</div><input id="platStudentRank" placeholder="Rank" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
          <div><div class="text-xs text-slate-500 mb-1">Specialty</div><input id="platStudentSpec" placeholder="Specialty" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
          <div><div class="text-xs text-slate-500 mb-1">Date of Birth</div><input id="platStudentDob" placeholder="Date of Birth" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div><div class="text-xs text-slate-500 mb-1">Gender</div><select id="platStudentGender" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-300"><option value="">Gender</option><option>Male</option><option>Female</option></select></div>
          <div class="col-span-2"><div class="text-xs text-slate-500 mb-1">Residential Address</div><input id="platStudentAddr" placeholder="Residential Address" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
          <div><div class="text-xs text-slate-500 mb-1">Cell #</div><input id="platStudentCell" placeholder="Cell #" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
        </div>
        <div class="flex items-end gap-2">
          <div class="flex-1 max-w-sm"><div class="text-xs text-slate-500 mb-1">Email Address</div><input id="platStudentEmail" placeholder="Email Address" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
          <button onclick="
            const n = document.getElementById('platStudentName').value;
            const r = document.getElementById('platStudentRank').value || 'Pvt';
            const s = document.getElementById('platStudentSpec').value || 'Rifle';
            if(n) { S.platoons['${name}'].push({ id: 'c'+Date.now(), name: n, rank: r, spec: s, dob: document.getElementById('platStudentDob').value, gender: document.getElementById('platStudentGender').value, address: document.getElementById('platStudentAddr').value, cellNo: document.getElementById('platStudentCell').value, email: document.getElementById('platStudentEmail').value }); showToast('<strong>' + n + '</strong> added to ${name} Platoon.', 'success', 'Cadet Added'); render(); }
          " class="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800">${ico('plus', 'w-4 h-4')} Add Cadets</button>
        </div>
      </div>
    </div>
  </div>`;
      })() : '';

      const activePlatoonFilterLabel = { All: 'All Platoons', '1st': '1st Semester', '2nd': '2nd Semester' }[S.platoonFilter || 'All'];
      const filterBtnHtml = `
        <div class="relative inline-block text-left font-medium">
          <button id="platFilterBtn" type="button"
                 onclick="event.stopPropagation(); S.showPlatoonFilterMenu = !S.showPlatoonFilterMenu; render();"
                 class="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-indigo-300 transition shadow-sm cursor-pointer" title="Click to filter platoons">
            ${ico('filter', 'w-4 h-4 text-slate-500')}
            <span>${activePlatoonFilterLabel}</span>
            <span class="text-slate-400 ml-1 pointer-events-none">
              ${ico('chevron', 'w-3.5 h-3.5')}
            </span>
          </button>
          ${S.showPlatoonFilterMenu ? `
          <div id="platFilterDropdown" class="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50 text-left">
            <div class="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-50 mb-1">Filter by Semester</div>
            ${[
            { val: 'All', label: 'All Platoons' },
            { val: '1st', label: '1st Semester' },
            { val: '2nd', label: '2nd Semester' }
          ].map(opt => {
            const isSel = S.platoonFilter === opt.val;
            return `
              <button onclick="event.stopPropagation(); S.platoonFilter = '${opt.val}'; S.showPlatoonFilterMenu = false; render();" class="w-full text-left px-3.5 py-1.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${isSel ? 'text-indigo-600 font-semibold bg-indigo-50/40' : 'text-slate-700'}">
                <span>${opt.label}</span>
                ${isSel ? ico('check', 'w-4 h-4 text-indigo-600') : ''}
              </button>
              `;
          }).join('')}
          </div>
          ` : ''}
        </div>
      `;

      return `<div class="space-y-5">
        ${newPlatoonModal}
        <input type="file" id="platXlsxImportInput" accept=".xlsx,.xls" class="hidden" />
        <input type="file" id="modalPlatXlsxInput" accept=".xlsx,.xls" class="hidden" />
        ${pageHdr('Platoon Management Overview', 'Click a platoon to view its assigned officers or upload a master list.', `
          ${filterBtnHtml}
          <button id="newPlatoonBtn" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition">${ico('shield', 'w-4 h-4')} New Platoon</button>
        `)}
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">${ico('users', 'w-6 h-6')}</div>
            <div><div class="text-2xl font-bold text-slate-900">${totalCadets}</div><div class="text-xs text-slate-500">Total Assigned Officers</div></div>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">${ico('shield', 'w-6 h-6')}</div>
            <div><div class="text-2xl font-bold text-slate-900">${Object.keys(S.platoons).length}</div><div class="text-xs text-slate-500">Active Platoons</div></div>
          </div>
        </div>

        ${card(`<div class="flex items-center gap-2 mb-4 justify-start">
          <div class="relative flex-1 max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ${ico('search', 'w-4 h-4')}
            </span>
            <input id="platSearchInput" type="text" autocomplete="off"
                   placeholder="Search platoons..." 
                   value="${S.platSearch || ''}" 
                   class="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-300 transition" />
          </div>
        </div>${clickableTbl}`)}

        ${platoonModal}
      </div>`;
    }


    const R_ROSTER = [];

    function rRosters() {
      let filteredRoster = R_ROSTER;
      if (S.rosterSearch) {
        const term = S.rosterSearch.toLowerCase();
        filteredRoster = filteredRoster.filter(r => r.name.toLowerCase().includes(term) || r.id.toLowerCase().includes(term));
      }
      if (S.rosterFilterPlatoon && S.rosterFilterPlatoon !== 'All') {
        filteredRoster = filteredRoster.filter(r => r.platoon === S.rosterFilterPlatoon);
      }

      const rTbl = tbl([
        { key: 'id', label: 'Officer ID' },
        { key: 'name', label: 'Name', fn: r => `<span class="text-slate-900">${r.name}</span>` },
        { key: 'rank', label: 'Rank' },
        { key: 'platoon', label: 'Platoon', fn: r => pill(r.platoon === 'Unassigned' ? 'slate' : 'indigo', r.platoon) },
        { key: 'spec', label: 'Specialty' },
        { key: 'status', label: 'Status', fn: r => pill(r.status === '1st Semester' ? 'emerald' : 'amber', r.status) },
      ], filteredRoster, (r) => `data-officer-row="${r.id}"`);

      const officerModal = S.selectedOfficer ? (() => {
        const off = R_ROSTER.find(o => o.id === S.selectedOfficer);
        if (!off) return '';
        if (!S.officerStudents) S.officerStudents = {};
        if (!S.officerStudents[S.selectedOfficer]) {
          S.officerStudents[S.selectedOfficer] = [];
        }
        const offStudents = S.officerStudents[S.selectedOfficer];

        const rows = offStudents.map((st, i) => `<tr class="border-b border-slate-50 hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 text-slate-400 text-xs text-center">${i + 1}</td>
          <td class="py-2.5 px-3 font-medium text-slate-900 text-sm">${st.name}</td>
          <td class="py-2.5 px-3 text-slate-600 text-sm">${st.gender}</td>
          <td class="py-2.5 px-3 text-slate-600 text-sm">${st.dob}</td>
          <td class="py-2.5 px-3 text-slate-600 text-sm">${st.address}</td>
        </tr>`).join('');

        return `
        <div id="officerStudentsOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl mx-4 flex flex-col max-h-[85vh]">
            <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <div class="text-slate-900 tracking-tight text-lg font-semibold">
                  Students under Officer ${off.name.replace('Officer ', '')}
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  ${off.platoon} Platoon &middot; ${off.rank} &middot; ${offStudents.length} students assigned
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="
                  const o = R_ROSTER.find(x => x.id === '${off.id}');
                  if (o) {
                    const newName = prompt('Edit Officer Name:', o.name.replace('Officer ', ''));
                    if (newName !== null && newName.trim()) {
                      o.name = 'Officer ' + newName.trim();
                      render();
                    }
                  }
                " class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition">${ico('pencil', 'w-3.5 h-3.5')} Edit Officer</button>
                <button onclick="
                  const ws = XLSX.utils.json_to_sheet(S.officerStudents['${off.id}']);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Cadets');
                  XLSX.writeFile(wb, '${off.name}_Cadets.xlsx');
                " class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 transition">${ico('download', 'w-3.5 h-3.5')} Export List</button>
                <button id="deleteOfficerSecBtn" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition">${ico('trash', 'w-3.5 h-3.5')} Delete Platoon</button>
                <button id="officerStudentsClose" class="text-slate-400 hover:text-slate-700 p-1 bg-slate-50 hover:bg-slate-100 rounded-md transition">${ico('close', 'w-5 h-5')}</button>
              </div>
            </div>
            <div class="overflow-y-auto flex-1 p-0">
              <table class="w-full text-sm text-left">
                <thead class="sticky top-0 bg-slate-50 border-b border-slate-100">
                  <tr class="text-[11px] uppercase tracking-wider text-slate-500">
                    <th class="py-2.5 px-3 text-center w-12">#</th>
                    <th class="py-2.5 px-3 font-medium">Student Name</th>
                    <th class="py-2.5 px-3 font-medium">Gender</th>
                    <th class="py-2.5 px-3 font-medium">Date of Birth</th>
                    <th class="py-2.5 px-3 font-medium">Address</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>`;
      })() : '';

      const activeRosterLabel = { All: 'All Platoons', Alpha: 'Alpha Platoon', Bravo: 'Bravo Platoon', Charlie: 'Charlie Platoon', Unassigned: 'Unassigned' }[S.rosterFilterPlatoon || 'All'];
      const filterControlsHtml = `
        <div class="flex flex-wrap items-center gap-3 mb-4 justify-start">
          <div class="flex items-center gap-1.5 max-w-md w-full">
            <div class="relative flex-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ${ico('search', 'w-4 h-4 text-slate-400')}
              </span>
              <input id="rosterSearchInput" type="text" autocomplete="off"
                     placeholder="Search officer ID or name..." 
                     value="${S.rosterSearch || ''}" 
                     class="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-300 transition shadow-sm" />
            </div>
            <button id="rosterSearchBtn" type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm cursor-pointer">
              Search
            </button>
          </div>

          <div class="relative font-medium w-48 shrink-0">
            <button id="rostersFilterBtn" type="button"
                   class="w-full pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-indigo-300 transition shadow-sm flex items-center justify-between cursor-pointer">
              <span>${activeRosterLabel}</span>
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ${ico('chevron', 'w-3.5 h-3.5')}
              </span>
            </button>
            ${S.showRostersFilterMenu ? `
            <div id="rostersFilterDropdown" class="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50">
              <div class="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-50 mb-1">Filter by Platoon</div>
              ${[
            { val: 'All', label: 'All Platoons' },
            { val: 'Alpha', label: 'Alpha Platoon' },
            { val: 'Bravo', label: 'Bravo Platoon' },
            { val: 'Charlie', label: 'Charlie Platoon' },
            { val: 'Unassigned', label: 'Unassigned' }
          ].map(opt => {
            const isSel = S.rosterFilterPlatoon === opt.val;
            return `
                <button data-rosters-filter-opt="${opt.val}" class="w-full text-left px-3.5 py-1.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${isSel ? 'text-indigo-600 font-semibold bg-indigo-50/40' : 'text-slate-700'}">
                  <span>${opt.label}</span>
                  ${isSel ? ico('check', 'w-4 h-4 text-indigo-600') : ''}
                </button>
                `;
          }).join('')}
            </div>
            ` : ''}
          </div>
        </div>
      `;

      return `<div class="space-y-5">
    ${pageHdr('Assign Officer Section Overview', 'Master list of officers with rank, platoon, and specialty', `
      <div class="flex items-center gap-2">
        <button id="exportOfficerBtn" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition">${ico('download', 'w-4 h-4')} Export</button>
        <button id="addOfficerBtn" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition">${ico('userplus', 'w-4 h-4')} Add Officer</button>
      </div>`)}
    ${card(`${filterControlsHtml}${rTbl}`)}
    ${officerModal}
    ${S.officerForm ? `
    <div id="officerFormOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg mx-4">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div><div class="text-slate-900 font-semibold tracking-tight">Add New Officer</div><div class="text-xs text-slate-500">Enter officer details to add to the section</div></div>
          <button id="officerFormClose" class="text-slate-400 hover:text-slate-700 p-1">${ico('close', 'w-5 h-5')}</button>
        </div>
        <div class="p-6 space-y-4 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div><div class="text-xs text-slate-500 mb-1">Officer ID</div><input id="newOffId" placeholder="e.g. 2024-XXXXX" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
            <div><div class="text-xs text-slate-500 mb-1">Rank</div><input id="newOffRank" placeholder="Rank" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
          </div>
            <div><div class="text-xs text-slate-500 mb-1">Name</div><input id="newOffName" placeholder="Last, First M." class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><div class="text-xs text-slate-500 mb-1">Platoon</div><select id="newOffPlat" class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-300"><option value="">Platoon</option><option>Alpha</option><option>Bravo</option><option>Charlie</option><option>Delta</option></select></div>
            <div><div class="text-xs text-slate-500 mb-1">Specialty</div><input id="newOffSpec" placeholder="Specialty" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300" /></div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 rounded-b-2xl">
          <button id="officerFormCancel" class="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button id="officerFormSave" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition">${ico('check', 'w-4 h-4')} Save Officer</button>
        </div>
      </div>
    </div>` : ''}
  </div>`;
    }

    const R_DESIGNS = [];

    function rDesigns() {
      const dTbl = tbl([
        { key: 'title', label: 'Activity', fn: r => `<span class="text-slate-900 font-medium">${r.title}</span>` },
        { key: 'phase', label: 'Phase' },
        { key: 'date', label: 'Date' },
        { key: 'duration', label: 'Duration' },
        { key: 'status', label: 'Status', fn: r => { const sm = rStatusMeta(r.status); return pill(sm.pill, `<span class="inline-flex items-center gap-1">${ico(sm.ico, 'w-3 h-3')}${sm.label}</span>`); } },
      ], R_DESIGNS, (r, i) => `onclick="S.selectedDesignIndex = ${i}; render();"`);

      return `<div class="space-y-5">
    ${pageHdr('Activity Designs Submission', 'Plan drill exercises, training, and community operations')}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      ${card(dTbl, { title: 'Designs in Cycle', cls: 'lg:col-span-2' })}
      ${card(`<div class="space-y-3 text-sm">
        <div><div class="text-xs text-slate-500 mb-1">Activity Title</div><input id="rdTitle" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400" placeholder="e.g. Tactical Drill Sequence" /></div>
        <div><div class="text-xs text-slate-500 mb-1">Phase</div><select id="rdPhase" class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"><option>Field Exercise</option><option>Training</option><option>Community</option><option>Inspection</option></select></div>
        <div class="grid grid-cols-2 gap-2">
          <div><div class="text-xs text-slate-500 mb-1">Date</div><input id="rdDate" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-200" /></div>
          <div><div class="text-xs text-slate-500 mb-1">Duration</div><input id="rdDuration" value="3 hrs" class="w-full px-3 py-2 rounded-lg border border-slate-200" /></div>
        </div>
        <div><div class="text-xs text-slate-500 mb-1">Objectives</div><textarea id="rdObj" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400" placeholder="Mission, expected outcomes, safety considerations..."></textarea></div>
        <label class="block border-2 border-dashed border-slate-200 rounded-lg p-3 text-center bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition">
          ${ico('upload', 'w-4 h-4 text-slate-400 mx-auto')}
          <span id="rDesignFileLabel" class="text-xs text-slate-600 mt-1 block">Attach supplementary documents</span>
          <input type="file" id="rDesignFileInput" class="hidden" multiple onchange="document.getElementById('rDesignFileLabel').innerText = this.files.length + ' file(s) attached'" />
        </label>
        <div class="flex items-center gap-2 pt-1">
          <button onclick="
            const t = document.getElementById('rdTitle').value || 'Untitled Design';
            const p = document.getElementById('rdPhase').value;
            const d = document.getElementById('rdDate').value;
            const formatD = d ? new Date(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'TBA';
            const dur = document.getElementById('rdDuration').value;
            const obj = document.getElementById('rdObj').value;
            const item = { title: t, phase: p, date: formatD, duration: dur, status: 'draft', objectives: obj };
            if (S.editingDesignIndex !== null && S.editingDesignIndex !== undefined) R_DESIGNS[S.editingDesignIndex] = { ...R_DESIGNS[S.editingDesignIndex], ...item };
            else R_DESIGNS.unshift(item);
            const fl = document.getElementById('rDesignFileLabel');
            if(fl) fl.innerText = 'Attach supplementary documents';
            S.editingDesignIndex = null;
            render();
          " class="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">${S.editingDesignIndex !== null && S.editingDesignIndex !== undefined ? 'Update Draft' : 'Save Draft'}</button>
          <button onclick="
            const t = document.getElementById('rdTitle').value;
            if(!t) return alert('Please enter an Activity Title');
            const p = document.getElementById('rdPhase').value;
            const d = document.getElementById('rdDate').value;
            const formatD = d ? new Date(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'TBA';
            const dur = document.getElementById('rdDuration').value;
            const obj = document.getElementById('rdObj').value;
            const item = { title: t, phase: p, date: formatD, duration: dur, status: 'review', objectives: obj };
            if (S.editingDesignIndex !== null && S.editingDesignIndex !== undefined) R_DESIGNS[S.editingDesignIndex] = { ...R_DESIGNS[S.editingDesignIndex], ...item };
            else R_DESIGNS.unshift(item);
            const fl = document.getElementById('rDesignFileLabel');
            if(fl) fl.innerText = 'Attach supplementary documents';
            S.editingDesignIndex = null;
            render();
          " class="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-200">${ico('send', 'w-4 h-4')} ${S.editingDesignIndex !== null && S.editingDesignIndex !== undefined ? 'Update & Submit' : 'Submit'}</button>
          ${S.editingDesignIndex !== null && S.editingDesignIndex !== undefined ? `<button onclick="S.editingDesignIndex = null; render();" class="text-xs text-slate-400 hover:text-slate-600 ml-auto">Cancel Edit</button>` : ''}
        </div>
      </div>`, { title: S.editingDesignIndex !== null && S.editingDesignIndex !== undefined ? 'Edit Activity Design' : 'New Design Brief' })}
    </div>
    ${S.selectedDesignIndex !== null && S.selectedDesignIndex !== undefined ? (() => {
          const d = R_DESIGNS[S.selectedDesignIndex];
          const sm = rStatusMeta(d.status);
          return `
    <div id="rDesignDetailModalOverlay" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <h3 class="font-semibold text-white text-lg">Activity Design Details</h3>
          <button onclick="S.selectedDesignIndex = null; render();" class="p-2 -mr-2 text-slate-300 hover:text-white rounded-full transition-colors">${ico('close', 'w-5 h-5')}</button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900">${d.title}</h2>
              <div class="text-sm text-slate-500 mt-1">${d.phase} &middot; ${d.date} &middot; ${d.duration}</div>
            </div>
            ${pill(sm.pill, sm.label)}
          </div>
          
          ${d.status === 'revisions' && d.feedback ? `
          <div class="mb-6 bg-rose-50 rounded-lg p-4 border border-rose-200 shadow-sm relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
            <div class="flex items-start gap-3 pl-2">
              <div class="text-rose-600 mt-0.5">${ico('alertc', 'w-5 h-5')}</div>
              <div>
                <h4 class="text-sm font-bold text-rose-900 mb-1 tracking-tight">Revision Requested</h4>
                <p class="text-sm text-rose-800 leading-relaxed font-medium">${d.feedback}</p>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="mb-6">
            <h4 class="text-sm font-medium text-slate-900 mb-2">Objectives & Narrative</h4>
            <p class="text-sm text-slate-600 leading-relaxed">${d.objectives || 'No objectives provided.'}</p>
          </div>

          ${d.file ? `
          <div class="mb-6">
            <h4 class="text-sm font-medium text-slate-900 mb-2">Attached Documents</h4>
            <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 group hover:border-slate-300 transition-colors cursor-pointer">
              <div class="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                ${ico('filetext', 'w-6 h-6')}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-900 truncate">${d.file}</div>
                <div class="text-xs text-slate-500">Supplementary Material &middot; 2.4 MB</div>
              </div>
              <div class="text-slate-300 group-hover:text-slate-600 transition-colors">
                ${ico('download', 'w-5 h-5')}
              </div>
            </div>
          </div>
          ` : ''}
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          ${(d.status === 'draft' || d.status === 'revisions') ? `
            <button onclick="
              S.editingDesignIndex = ${S.selectedDesignIndex};
              S.selectedDesignIndex = null;
              setTimeout(() => {
                const des = R_DESIGNS[S.editingDesignIndex];
                const titleInput = document.getElementById('rdTitle');
                if (titleInput) { titleInput.value = des.title; titleInput.focus(); }
                const phaseInput = document.getElementById('rdPhase');
                if (phaseInput) phaseInput.value = des.phase;
                const dateInput = document.getElementById('rdDate');
                if (dateInput && des.date && des.date !== 'TBA') {
                   const dateObj = new Date(des.date);
                   if (!isNaN(dateObj)) dateInput.value = dateObj.toISOString().split('T')[0];
                }
                const durInput = document.getElementById('rdDuration');
                if (durInput) durInput.value = des.duration;
                const objInput = document.getElementById('rdObj');
                if (objInput) objInput.value = des.objectives || '';
              }, 50);
              render();
            " class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
              ${ico('pencil', 'w-4 h-4')} Edit Design
            </button>
          ` : ''}
          <button onclick="
            R_DESIGNS.splice(${S.selectedDesignIndex}, 1);
            S.selectedDesignIndex = null;
            render();
          " class="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2">
            ${ico('trash', 'w-4 h-4')} Delete
          </button>
        </div>
      </div>
    </div>`;
        })() : ''}
  </div>`;
    }

    const R_CAL_DAYS = [
      { d: 14, label: 'TUE', events: [] },
      { d: 15, label: 'WED', events: [{ t: 'Section briefing', c: 'bg-indigo-500' }] },
      { d: 16, label: 'THU', events: [{ t: 'Drill day 07:00H', c: 'bg-amber-500' }] },
      { d: 17, label: 'FRI', events: [] },
      { d: 18, label: 'SAT', events: [{ t: 'Q1 Reports due', c: 'bg-rose-500' }] },
      { d: 19, label: 'SUN', events: [] },
      { d: 20, label: 'MON', events: [{ t: 'Strength report', c: 'bg-emerald-500' }] },
    ];

    function rCalendar() {
      const calGrid = R_CAL_DAYS.map(d => `<div class="border border-slate-200 rounded-md p-3 min-h-[160px] bg-white">
    <div class="text-[10px] uppercase tracking-wider text-slate-500">${d.label}</div>
    <div class="text-slate-900 tracking-tight text-xl mt-0.5">${d.d}</div>
    <div class="mt-3 space-y-1.5">${d.events.map(e => `<div class="${e.c} text-[11px] px-2 py-1 rounded text-white truncate">${e.t}</div>`).join('')}</div>
  </div>`).join('');

      const upcomingEvents = [
        { d: 'MAY 16', t: 'Saturday Drill -?? Formation 0700H', v: 'Parade Grounds', color: 'bg-amber-500', type: 'drill' },
        { d: 'MAY 18', t: 'Q1 Accomplishment Reports Due', v: 'Officer Console', color: 'bg-rose-500', type: 'report' },
        { d: 'MAY 23', t: 'Tactical Inspection', v: 'Field Site B', color: 'bg-indigo-500', type: 'briefing' },
        { d: 'MAY 30', t: 'Civil-Military Outreach', v: 'Brgy. San Pablo', color: 'bg-emerald-500', type: 'outreach' },
      ];

      const activeFilter = S.rCalFilter || 'all';
      const filteredEvents = upcomingEvents.filter(e => {
        if (activeFilter !== 'all' && e.type !== activeFilter) return false;
        if (S.calSearch) {
          const q = S.calSearch.toLowerCase();
          const labelMap = { briefing: 'tactical/briefings', drill: 'drills/exercises', report: 'reports', outreach: 'community outreach' };
          if (labelMap[e.type] !== q) {
            return e.t.toLowerCase().includes(q) || e.v.toLowerCase().includes(q);
          }
        }
        return true;
      });

      const upcoming = filteredEvents.map(e => `<li class="px-5 py-4 flex items-center gap-4">
    <div class="w-14 text-center shrink-0"><div class="text-[10px] tracking-wider text-slate-400">${e.d.split(' ')[0]}</div><div class="text-slate-900 tracking-tight">${e.d.split(' ')[1]}</div></div>
    <div class="w-1 self-stretch rounded-full ${e.color}"></div>
    <div class="flex-1 min-w-0"><div class="text-sm text-slate-950">${e.t}</div><div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">${ico('mappin', 'w-3 h-3')} ${e.v}</div></div>
    ${ico('chevron', 'w-4 h-4 text-slate-300')}
  </li>`).join('');

      const filterBtnHtml = `
        <div class="relative inline-block text-left w-48 font-medium">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ${ico('filter', 'w-4 h-4 text-slate-500')}
          </span>
          <input id="rCalFilterBtn" type="text" autocomplete="off"
                 class="w-full pl-9 pr-8 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-indigo-300 transition-colors shadow-sm cursor-pointer"
                 placeholder="Filter by Type"
                 value="${S.calSearch || ''}" />
          <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ${ico('chevron', 'w-3.5 h-3.5')}
          </span>
          ${S.showRCalFilterMenu ? `
          <div id="rCalFilterDropdown" class="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50">
            <div class="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-50 mb-1">Filter by Type</div>
            ${[
            { val: 'all', label: 'All Events' },
            { val: 'briefing', label: 'Tactical/Briefings' },
            { val: 'drill', label: 'Drills/Exercises' },
            { val: 'report', label: 'Reports' },
            { val: 'outreach', label: 'Community Outreach' }
          ].map(opt => {
            const isSel = activeFilter === opt.val;
            return `
              <button data-rcal-filter-opt="${opt.val}" class="w-full text-left px-3.5 py-1.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${isSel ? 'text-slate-950 font-semibold bg-slate-100' : 'text-slate-700'}">
                <span>${opt.label}</span>
                ${isSel ? ico('check', 'w-4 h-4 text-slate-955') : ''}
              </button>
              `;
          }).join('')}
          </div>
          ` : ''}
        </div>
      `;

      return `<div class="space-y-5">
    ${pageHdr('Master Calendar', 'Drill days, inspections, and field operations across all platoons', filterBtnHtml)}
    ${card(`<div class="grid grid-cols-7 gap-2">${calGrid}</div>`, { title: 'Week of May 14 -?? May 20, 2026' })}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      ${card(upcoming.length ? `<ul class="divide-y divide-slate-100 -mx-5 -my-5">${upcoming}</ul>` : `<div class="text-center text-sm text-slate-400 py-6">No events found matching filter</div>`, { title: 'Upcoming', cls: 'lg:col-span-3' })}
    </div>
  </div>`;
    }


    function rReports() {
      const listHtml = R_REPORTS.map((r, i) => {
        const sm = rStatusMeta(r.status); return `<li class="px-5 py-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer" onclick="S.selectedRReportIndex = ${i}; render();">
    <div class="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">${ico('filetext', 'w-4 h-4')}</div>
    <div class="flex-1 min-w-0"><div class="text-sm text-slate-900 truncate">${r.title}</div><div class="text-xs text-slate-500">${r.due}</div></div>
    ${pill(sm.pill, `<span class="inline-flex items-center gap-1">${ico(sm.ico, 'w-3 h-3')}${sm.label}</span>`)}
    ${ico('chevron', 'w-4 h-4 text-slate-300')}
  </li>`;
      }).join('');
      const planOpts = R_DESIGNS.map(p => `<option value="${p.title}">${p.title}</option>`).join('');
      return `<div class="space-y-5">
    <datalist id="rActivityDatalist">${planOpts}</datalist>
    ${pageHdr('Report Submission Overview', 'Document and submit completed ROTC activities')}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      ${card(`<ul class="-mx-5 -my-5 divide-y divide-slate-100">${listHtml}</ul>`, { title: 'All Reports', cls: 'lg:col-span-2' })}
      ${card(`<div class="space-y-3 text-sm">
        <div><div class="text-xs text-slate-500 mb-1">Linked Activity</div><input type="text" id="rReportLinkedActivity" list="rActivityDatalist" placeholder="Select or type an activity..." class="w-full px-3 py-2 rounded-lg border border-slate-200" /></div>
        <div><div class="text-xs text-slate-500 mb-1">Cadets Involved</div><input type="text" inputmode="numeric" pattern="[0-9]*" id="rReportBenInput" value="42" class="w-full px-3 py-2 rounded-lg border border-slate-200" /></div>
        <div><div class="text-xs text-slate-500 mb-1">Narrative</div><textarea id="rReportNarInput" rows="4" placeholder="Describe the activity, outputs, and impact-?-" class="w-full px-3 py-2 rounded-lg border border-slate-200"></textarea></div>
        <label class="block border-2 border-dashed border-slate-200 rounded-lg p-4 text-center bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition">
          ${ico('upload', 'w-5 h-5 text-slate-400 mx-auto')}
          <span id="rReportFileLabel" class="text-xs text-slate-600 mt-1 block">Drop photos, attendance sheet, Accomplisment Reports</span>
          <input type="file" id="rReportFileInput" class="hidden" multiple onchange="document.getElementById('rReportFileLabel').innerText = this.files.length + ' file(s) attached'" />
        </label>
        <div class="flex items-center gap-2 pt-1">
          <button onclick="
            const t = document.getElementById('rReportLinkedActivity').value;
            const b = document.getElementById('rReportBenInput').value;
            const n = document.getElementById('rReportNarInput').value;
            const r = { title: t + (t.includes('Report') ? '' : ' Report'), due: 'Saved just now', status: 'draft', progress: 50, narrative: n };
            if (S.editingRReportIndex !== null && S.editingRReportIndex !== undefined) R_REPORTS[S.editingRReportIndex] = { ...R_REPORTS[S.editingRReportIndex], ...r };
            else R_REPORTS.unshift(r);
            S.editingRReportIndex = null;
            render();
          " class="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">Save Draft</button>
          <button onclick="
            const t = document.getElementById('rReportLinkedActivity').value;
            const b = document.getElementById('rReportBenInput').value;
            const n = document.getElementById('rReportNarInput').value;
            const r = { title: t + (t.includes('Report') ? '' : ' Report'), due: 'Submitted just now', status: 'review', progress: 100, narrative: n, file: 'Attached_Report.pdf' };
            if (S.editingRReportIndex !== null && S.editingRReportIndex !== undefined) R_REPORTS[S.editingRReportIndex] = { ...R_REPORTS[S.editingRReportIndex], ...r };
            else R_REPORTS.unshift(r);
            const fl = document.getElementById('rReportFileLabel');
            if(fl) fl.innerText = 'Drop photos, attendance sheet, Accomplishment Reports';
            S.editingRReportIndex = null;
            render();
          " class="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-200">${ico('send', 'w-4 h-4')} Submit</button>
        </div>
      </div>`, { title: 'New Report Draft' })}
    </div>
    ${S.selectedRReportIndex !== null && S.selectedRReportIndex !== undefined ? (() => {
          const r = R_REPORTS[S.selectedRReportIndex];
          return `
    <div id="rReportDetailModalOverlay" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <h3 class="font-semibold text-white text-lg">Report Details</h3>
          <button onclick="S.selectedRReportIndex = null; render();" class="p-2 -mr-2 text-slate-300 hover:text-white rounded-full transition-colors">${ico('close', 'w-5 h-5')}</button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900">${r.title}</h2>
              <div class="text-sm text-slate-500 mt-1">${r.due}</div>
            </div>
            ${pill(rStatusMeta(r.status).pill, `<span class="inline-flex items-center gap-1">${ico(rStatusMeta(r.status).ico, 'w-3 h-3')}${rStatusMeta(r.status).label}</span>`)}
          </div>
          
          ${r.status === 'revisions' && r.feedback ? `
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

          <div class="mb-6">
            <h4 class="text-sm font-medium text-slate-900 mb-2">Narrative</h4>
            <p class="text-sm text-slate-600 leading-relaxed">${r.narrative || 'No narrative provided.'}</p>
          </div>

          ${r.file ? `
          <div class="mb-6">
            <h4 class="text-sm font-medium text-slate-900 mb-2">Attached Documents</h4>
            <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 group hover:border-slate-300 transition-colors cursor-pointer">
              <div class="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                ${ico('filetext', 'w-6 h-6')}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-900 truncate">${r.file}</div>
                <div class="text-xs text-slate-500">Accomplishment Report &middot; 3.1 MB</div>
              </div>
              <div class="text-slate-300 group-hover:text-slate-600 transition-colors">
                ${ico('download', 'w-5 h-5')}
              </div>
            </div>
          </div>
          ` : ''}
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          ${(r.status === 'draft' || r.status === 'revisions') ? `
            <button onclick="
              S.editingRReportIndex = ${S.selectedRReportIndex};
              S.selectedRReportIndex = null;
              setTimeout(() => {
                const rep = R_REPORTS[S.editingRReportIndex];
                const linkInput = document.getElementById('rReportLinkedActivity');
                if (linkInput) {
                  let t = rep.title || '';
                  if (t.endsWith(' Report')) t = t.slice(0, -7);
                  linkInput.value = t;
                }
                const narInput = document.getElementById('rReportNarInput');
                if (narInput) { narInput.value = rep.narrative || ''; narInput.focus(); }
              }, 50);
              render();
            " class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
              ${ico('pencil', 'w-4 h-4')} Edit Report
            </button>
          ` : ''}
          <button onclick="
            R_REPORTS.splice(${S.selectedRReportIndex}, 1);
            S.selectedRReportIndex = null;
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

    function renderROTC() {
      const pd = PROFILE_DATA[S.email] || PROFILE_DATA.rotc || {};
      const userName = pd.fullName || '1Lt. Daniel Castillo';
      const userInitials = getInitials(userName) || 'DC';
      const last = userName.split(' ').pop();
      const nav = [
        { name: 'Overview', ico: 'grid' },
        { name: 'Management', isHeader: true },
        { name: 'Platoon Management', ico: 'shield' },
        { name: 'Assign Officer Section', ico: 'users' },
        { name: 'Planning & Reports', isHeader: true },
        { name: 'Activity Designs', ico: 'clipboard', badge: 2 },
        { name: 'Report Submission', ico: 'filetext', badge: 1 },
      ].map(n => n.isHeader ? n : { ...n, active: S.rotcPage === n.name });
      const pageMap = { 'Overview': rOverview(), 'Platoon Management': rPlatoon(), 'Assign Officer Section': rRosters(), 'Activity Designs': rDesigns(), 'Report Submission': rReports() };
      return renderShell({ theme: 'military', brand: 'DNSC ROTC', brandSub: 'Officer Portal', navItems: nav, userName: userName, userRole: 'First Class Officer', userInitials: userInitials, greeting: S.rotcPage === 'Overview' ? `Stand-to, Lt. ${last}` : S.rotcPage, context: 'NSTP Management System', ctaLabel: 'New Activity Design', content: pageMap[S.rotcPage] || '' });
    }
