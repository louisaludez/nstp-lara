export function attachActivityEvents() {
    // Calendar form open
    const calOpen = document.getElementById('calFormOpen');
    if (calOpen) calOpen.addEventListener('click', () => { S.calForm = true; if (typeof render === 'function') render(); });
    const calClose = document.getElementById('calFormClose');
    if (calClose) calClose.addEventListener('click', () => { S.calForm = false; if (typeof render === 'function') render(); });
    const calCancel = document.getElementById('calCancel');
    if (calCancel) calCancel.addEventListener('click', () => { S.calForm = false; if (typeof render === 'function') render(); });

    // Calendar submit all drafts
    const calSubmitAll = document.getElementById('calSubmitAll');
    if (calSubmitAll) calSubmitAll.addEventListener('click', () => {
        S.activities = S.activities.map(a => a.status === 'Draft' ? { ...a, status: 'Submitted' } : a);
        if (typeof render === 'function') render();
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
        if (typeof render === 'function') render();
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
        if (typeof render === 'function') render();
    });

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
        if (typeof render === 'function') render();
    };

    window.deleteActivity = function (idx) {
        if (confirm('Are you sure you want to delete this activity?')) {
            S.activities.splice(idx, 1);
            S.selectedCalActivity = null;
            S.editingActivity = false;
            if (typeof render === 'function') render();
        }
    };

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

        if (typeof I_PLANS !== 'undefined') {
            I_PLANS.unshift({
                title: titleInput.value.trim(),
                section: sectionInput.value.split(' &middot; ')[0],
                date: displayDate,
                duration: durationInput.value + ' hrs',
                venue: 'TBD',
                status: status
            });
        }
        if (typeof render === 'function') render();
    };

    const planSaveDraftBtn = document.getElementById('planSaveDraftBtn');
    if (planSaveDraftBtn) planSaveDraftBtn.addEventListener('click', () => {
        savePlan('Draft');
        const titleVal = document.getElementById('planTitleInput')?.value?.trim();
        if (window.logAudit) window.logAudit('Saved Draft', 'Activity Plans', titleVal, `Saved activity plan draft: "${titleVal}"`, 'edit');
        if (window.showToast) window.showToast('Activity plan saved as draft.', 'info', 'Draft Saved');
    });

    const planSubmitBtn = document.getElementById('planSubmitBtn');
    if (planSubmitBtn) planSubmitBtn.addEventListener('click', () => {
        savePlan('Pending');
        const titleVal = document.getElementById('planTitleInput')?.value?.trim();
        if (window.logAudit) window.logAudit('Submitted Plan', 'Activity Plans', titleVal, `Submitted activity plan for approval: "${titleVal}"`, 'submission');
        if (window.showToast) window.showToast('Activity plan submitted for approval.', 'success', 'Plan Submitted');
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

            if (typeof APPROVALS !== 'undefined') {
                const item = APPROVALS[S.selApproval || 0];
                if (item) {
                    if (typeof I_PLANS !== 'undefined') {
                        const plan = I_PLANS.find(p => p.title.includes(item.title.replace(' Report', '').replace(' Activity', '')));
                        if (plan) {
                            plan.status = 'Revision';
                            plan.feedback = note;
                        }
                    }
                    if (window.logAudit) window.logAudit('Requested revisions', 'Report & Activity Approvals', item.title, `Requested revisions for "${item.title}". Note: "${note}"`, 'approval');
                }

                alert('Revision request sent successfully!');
                APPROVALS.splice(S.selApproval || 0, 1);
            }

            S.selApproval = 0;
            S.revisionModal = false;
            S.revisionNote = '';

            if (window.showToast) window.showToast('Revision request has been sent to the instructor.', 'warning', 'Revision Requested');
            if (typeof render === 'function') render();
        });
    }
    
    const revisionNoteArea = document.getElementById('revisionNoteArea');
    if (revisionNoteArea) {
        revisionNoteArea.addEventListener('input', (e) => {
            S.revisionNote = e.target.value;
        });
    }

    // View Attachments Modal
    const viewAttachmentsBtn = document.getElementById('viewAttachmentsBtn');
    if (viewAttachmentsBtn) viewAttachmentsBtn.addEventListener('click', () => { S.showAttachmentsModal = true; if (typeof render === 'function') render(); });
    const closeAttachmentsBtn = document.getElementById('closeAttachmentsBtn');
    if (closeAttachmentsBtn) closeAttachmentsBtn.addEventListener('click', () => { S.showAttachmentsModal = false; if (typeof render === 'function') render(); });
    const attachmentsModalOverlay = document.getElementById('attachmentsModalOverlay');
    if (attachmentsModalOverlay) attachmentsModalOverlay.addEventListener('click', e => { if (e.target === attachmentsModalOverlay) { S.showAttachmentsModal = false; if (typeof render === 'function') render(); } });

    // Approval selection
    document.querySelectorAll('[data-approval]').forEach(el => {
        el.addEventListener('click', () => {
            if (typeof S !== 'undefined') {
                S.selApproval = parseInt(el.dataset.approval);
                if (typeof render === 'function') render();
            }
        });
    });
}
