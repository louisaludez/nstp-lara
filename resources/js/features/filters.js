export function attachFilterEvents() {
    // Audit Logs Filter
    const auditFilterBtn = document.getElementById('auditFilterBtn');
    if (auditFilterBtn) {
        auditFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.showAuditFilterMenu = !S.showAuditFilterMenu;
                if (typeof render === 'function') render();
            }
        });
    }
    const auditSearchInput = document.getElementById('auditSearchInput');
    if (auditSearchInput) {
        auditSearchInput.addEventListener('input', (e) => {
            if (typeof S !== 'undefined') {
                S.auditSearch = e.target.value;
                S.focusedFilterInputId = 'auditSearchInput';
                S.focusedFilterCursor = e.target.selectionStart;
                if (typeof render === 'function') render();
            }
        });
    }

    document.querySelectorAll('[data-audit-filter-opt]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.auditFilter = btn.dataset.auditFilterOpt;
                S.showAuditFilterMenu = false;
                if (typeof render === 'function') render();
            }
        });
    });

    const exportAuditCSV = document.getElementById('exportAuditCSV');
    if (exportAuditCSV) exportAuditCSV.addEventListener('click', () => {
        const logs = []; // In real scenario, fetch logs
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

    // Student Archive Events
    const archiveSearchInput = document.getElementById('archiveSearchInput');
    if (archiveSearchInput) {
        archiveSearchInput.addEventListener('input', (e) => {
            if (typeof S !== 'undefined') {
                S.archiveSearch = e.target.value;
                S.focusedFilterInputId = 'archiveSearchInput';
                S.focusedFilterCursor = e.target.selectionStart;
                if (typeof render === 'function') render();
            }
        });
    }

    // Dashboard Incomplete Profiles Widget Search
    const dashboardArchiveSearch = document.getElementById('dashboardArchiveSearch');
    if (dashboardArchiveSearch) {
        dashboardArchiveSearch.addEventListener('input', (e) => {
            if (typeof S !== 'undefined') {
                S.dashboardArchiveSearch = e.target.value;
                S.focusedFilterInputId = 'dashboardArchiveSearch';
                S.focusedFilterCursor = e.target.selectionStart;
                if (typeof render === 'function') render();
            }
        });
    }

    // Sections & Students Filter
    const sectionsFilterBtn = document.getElementById('sectionsFilterBtn');
    if (sectionsFilterBtn) {
        sectionsFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.showSectionsFilterMenu = !S.showSectionsFilterMenu;
                if (typeof render === 'function') render();
            }
        });
    }
    const sectionsSearchInput = document.getElementById('sectionsSearchInput');
    if (sectionsSearchInput) {
        sectionsSearchInput.addEventListener('input', (e) => {
            if (typeof S !== 'undefined') {
                S.secSearch = e.target.value;
                S.focusedFilterInputId = 'sectionsSearchInput';
                S.focusedFilterCursor = e.target.selectionStart;
                if (typeof render === 'function') render();
            }
        });
    }

    document.querySelectorAll('[data-sections-filter-opt]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.secTab = btn.dataset.sectionsFilterOpt;
                S.showSectionsFilterMenu = false;
                if (typeof render === 'function') render();
            }
        });
    });

    // Instructors Search Filter
    const instSearchInput = document.getElementById('instSearchInput');
    if (instSearchInput) {
        instSearchInput.addEventListener('input', (e) => {
            if (typeof S !== 'undefined') {
                S.instSearch = e.target.value;
                S.focusedFilterInputId = 'instSearchInput';
                S.focusedFilterCursor = e.target.selectionStart;
                if (typeof render === 'function') render();
            }
        });
    }

    document.querySelectorAll('[data-inst-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.instTab = btn.dataset.instTab;
                S.instSearch = '';
                if (typeof render === 'function') render();
            }
        });
    });

    // My Classes Filter
    const classesFilterBtn = document.getElementById('classesFilterBtn');
    if (classesFilterBtn) {
        classesFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.showClassesFilterMenu = !S.showClassesFilterMenu;
                if (typeof render === 'function') render();
            }
        });
    }
    const classesSearchInput = document.getElementById('classesSearchInput');
    if (classesSearchInput) {
        classesSearchInput.addEventListener('input', (e) => {
            if (typeof S !== 'undefined') {
                S.classesSearch = e.target.value;
                S.focusedFilterInputId = 'classesSearchInput';
                S.focusedFilterCursor = e.target.selectionStart;
                if (typeof render === 'function') render();
            }
        });
    }

    document.querySelectorAll('[data-classes-filter-opt]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.classesFilter = btn.dataset.classesFilterOpt;
                S.showClassesFilterMenu = false;
                if (typeof render === 'function') render();
            }
        });
    });

    // Assign Officer Section (Rosters) Filter
    const rostersFilterBtn = document.getElementById('rostersFilterBtn');
    if (rostersFilterBtn) {
        rostersFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.showRostersFilterMenu = !S.showRostersFilterMenu;
                if (typeof render === 'function') render();
            }
        });
    }
    const rosterSearchInput = document.getElementById('rosterSearchInput');
    if (rosterSearchInput) {
        rosterSearchInput.addEventListener('input', (e) => {
            if (typeof S !== 'undefined') {
                S.rosterSearch = e.target.value;
                S.focusedFilterInputId = 'rosterSearchInput';
                S.focusedFilterCursor = e.target.selectionStart;
                if (typeof render === 'function') render();
            }
        });
    }
    const rosterSearchBtn = document.getElementById('rosterSearchBtn');
    if (rosterSearchBtn) {
        rosterSearchBtn.addEventListener('click', () => {
            if (typeof render === 'function') render();
        });
    }

    document.querySelectorAll('[data-rosters-filter-opt]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.rosterFilterPlatoon = btn.dataset.rostersFilterOpt;
                S.showRostersFilterMenu = false;
                if (typeof render === 'function') render();
            }
        });
    });

    // ROTC Calendar Filter
    const rCalFilterBtn = document.getElementById('rCalFilterBtn');
    if (rCalFilterBtn) {
        rCalFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.showRCalFilterMenu = !S.showRCalFilterMenu;
                if (typeof render === 'function') render();
            }
        });
    }
    const rCalSearchInput = document.getElementById('rCalSearchInput');
    if (rCalSearchInput) {
        rCalSearchInput.addEventListener('input', (e) => {
            if (typeof S !== 'undefined') {
                S.calSearch = e.target.value;
                S.focusedFilterInputId = 'rCalSearchInput';
                S.focusedFilterCursor = e.target.selectionStart;
                if (typeof render === 'function') render();
            }
        });
    }

    document.querySelectorAll('[data-rcal-filter-opt]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.rCalFilter = btn.dataset.rcalFilterOpt;
                S.showRCalFilterMenu = false;
                if (typeof render === 'function') render();
            }
        });
    });

    // Platoon search
    const platSearch = document.getElementById('platSearch');
    if (platSearch) {
        platSearch.addEventListener('input', e => {
            if (typeof S !== 'undefined') {
                S.platSearch = e.target.value;
                if (typeof render === 'function') render();
            }
        });
    }

    // Keep focus on the active input and restore cursor position after DOM render updates
    if (typeof S !== 'undefined' && S.focusedFilterInputId) {
        const inp = document.getElementById(S.focusedFilterInputId);
        if (inp) {
            inp.focus();
            const pos = S.focusedFilterCursor || inp.value.length;
            inp.setSelectionRange(pos, pos);
        }
        S.focusedFilterInputId = null;
        S.focusedFilterCursor = null;
    }
}
