/**
 * UI Component Utilities
 * Handles global UI interactions like sidebar toggles, dropdowns, and modals.
 */

export function initSidebar() {
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sidebar = document.querySelector('aside');
            if (sidebar) {
                sidebar.classList.toggle('-translate-x-full');
            }
        });
    }
}

export function initNotifications() {
    const notifBellBtn = document.getElementById('notifBellBtn');
    const notifPanel = document.getElementById('notifPanel');
    const notifOverlay = document.getElementById('notifOverlay');
    const notifClose = document.getElementById('notifClose');

    if (notifBellBtn && notifPanel) {
        notifBellBtn.addEventListener('click', () => {
            notifPanel.classList.toggle('translate-x-full');
            if (notifOverlay) notifOverlay.classList.toggle('hidden');
        });
    }

    if (notifClose && notifPanel) {
        notifClose.addEventListener('click', () => {
            notifPanel.classList.add('translate-x-full');
            if (notifOverlay) notifOverlay.classList.add('hidden');
        });
    }

    if (notifOverlay && notifPanel) {
        notifOverlay.addEventListener('click', () => {
            notifPanel.classList.add('translate-x-full');
            notifOverlay.classList.add('hidden');
        });
    }
}

export function initPasswordToggles() {
    window.togglePasswordVisibility = function(inputId, btnEl) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        const svg = btnEl.querySelector('svg');
        if (svg) {
            svg.style.opacity = isPassword ? '0.5' : '1';
        }
    };
}

export function initUI() {
    document.addEventListener('DOMContentLoaded', () => {
        initSidebar();
        initNotifications();
        initPasswordToggles();
    });
}
