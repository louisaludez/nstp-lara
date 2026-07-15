export function attachLayoutEvents() {
    // Sidebar Workspace Toggle
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.sidebarOpen = !S.sidebarOpen;
                if (typeof render === 'function') render();
            }
        });
    }

    // Profile panel open/close
    document.querySelectorAll('[data-profile-btn]').forEach(btn => {
        btn.addEventListener('click', () => { 
            S.profilePanel = !S.profilePanel; 
            S.profileShowPw = false; 
            S.editingProfile = false; 
            if (typeof render === 'function') render(); 
        });
    });

    const profileClose = document.getElementById('profileClose');
    if (profileClose) profileClose.addEventListener('click', () => { S.profilePanel = false; S.editingProfile = false; if (typeof render === 'function') render(); });
    
    const profileOverlay = document.getElementById('profileOverlay');
    if (profileOverlay) profileOverlay.addEventListener('click', () => { S.profilePanel = false; S.editingProfile = false; if (typeof render === 'function') render(); });
    
    const profileLogout = document.getElementById('profileLogout');
    if (profileLogout) profileLogout.addEventListener('click', () => {
        if (window.logAudit) window.logAudit('Logged Out', 'Authentication', S.email, 'Logged out via user profile menu.', 'system');
        S.role = null; S.email = null; S.profilePanel = false; 
        if (typeof render === 'function') render();
    });

    const profilePwToggle = document.getElementById('profilePwToggle');
    if (profilePwToggle) profilePwToggle.addEventListener('click', () => { S.profileShowPw = !S.profileShowPw; if (typeof render === 'function') render(); });

    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) editProfileBtn.addEventListener('click', () => { S.editingProfile = true; if (typeof render === 'function') render(); });
    
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', () => { S.editingProfile = false; if (typeof render === 'function') render(); });
    
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

                const cred = (typeof CREDENTIALS !== 'undefined' ? CREDENTIALS : []).find(c => c.email.toLowerCase() === oldEmail || c.email.toLowerCase() === String(S.email).toLowerCase());
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
            if (window.showToast) window.showToast('Your profile has been updated successfully.', 'success', 'Profile Saved');
            if (typeof render === 'function') render();
        });
    }

    // Logout via sidebar button
    document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.logAudit) window.logAudit('Logged Out', 'Authentication', S.email, 'Logged out via sidebar button.', 'system');
            S.role = null;
            S.email = null;
            if (typeof render === 'function') render();
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
            if (typeof render === 'function') render();
        });
    });

    // Global Outside Click Dropdown Dismissers
    if (!window.hasAuditFilterOutsideClickListener) {
        document.addEventListener('click', () => {
            let changed = false;
            if (typeof S !== 'undefined') {
                if (S.showAuditFilterMenu) { S.showAuditFilterMenu = false; changed = true; }
                if (S.showSectionsFilterMenu) { S.showSectionsFilterMenu = false; changed = true; }
                if (S.showClassesFilterMenu) { S.showClassesFilterMenu = false; changed = true; }
                if (S.showRostersFilterMenu) { S.showRostersFilterMenu = false; changed = true; }
                if (S.showRCalFilterMenu) { S.showRCalFilterMenu = false; changed = true; }
            }
            if (changed && typeof render === 'function') render();
        });
        window.hasAuditFilterOutsideClickListener = true;
    }
}
