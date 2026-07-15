export function attachSystemEvents() {
    // Data Reset Methods
    window.triggerPortalDataReset = function() {
        if (!confirm("WARNING: This will reset all frontend data (approvals, tasks, and state) to their defaults. Are you sure?")) {
            return;
        }
        window.nstpResetFrontendData();
    };

    window.nstpResetFrontendData = function() {
        if (typeof S !== 'undefined') {
            // S will be rebuilt entirely on next reload or we can clear key parts
            localStorage.removeItem('NSTP_GLOBAL_STATE');
        }
        // Force reload to clear memory
        window.location.reload();
    };

    const dataResetBtn = document.getElementById('dataResetBtn');
    if (dataResetBtn) {
        dataResetBtn.addEventListener('click', () => {
            window.triggerPortalDataReset();
        });
    }
}
