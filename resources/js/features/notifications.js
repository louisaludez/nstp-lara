export function attachNotificationEvents() {
    // Notification bell - toggle slide-in panel
    const notifBellBtn = document.getElementById('notifBellBtn');
    if (notifBellBtn) {
        notifBellBtn.addEventListener('click', () => {
            if (typeof S !== 'undefined') {
                S.notifPanel = !S.notifPanel;
                if (S.notifPanel && window.refreshNotifications) {
                    window.refreshNotifications();
                }
                if (typeof render === 'function') render();
            }
        });
    }

    const notifClose = document.getElementById('notifClose');
    if (notifClose) notifClose.addEventListener('click', () => { S.notifPanel = false; if (typeof render === 'function') render(); });
    
    const notifOverlay = document.getElementById('notifOverlay');
    if (notifOverlay) notifOverlay.addEventListener('click', () => { S.notifPanel = false; if (typeof render === 'function') render(); });
    
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
            if (typeof render === 'function') render();
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
}
