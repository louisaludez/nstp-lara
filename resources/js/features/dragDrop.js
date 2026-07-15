export function setupDragDrop() {
    window.moveCadet = function (id, from, to) {
        if (from === to || typeof S === 'undefined') return;
        let cadet;
        if (from === 'unassigned') {
            cadet = S.unassigned.find(c => c.id === id);
            S.unassigned = S.unassigned.filter(c => c.id !== id);
        } else {
            cadet = (S.platoons[from] || []).find(c => c.id === id);
            if (S.platoons[from]) S.platoons[from] = S.platoons[from].filter(c => c.id !== id);
        }
        if (!cadet) return;
        if (to === 'unassigned') {
            S.unassigned = [...S.unassigned, cadet];
        } else {
            if (!S.platoons[to]) S.platoons[to] = [];
            S.platoons[to] = [...S.platoons[to], cadet];
        }
    };

    window.onDrop = function (e, zone) {
        e.preventDefault();
        document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('dz-over'));
        if (typeof S !== 'undefined' && S.dragging) {
            window.moveCadet(S.dragging.id, S.dragging.from, zone);
            S.dragging = null;
            if (typeof render === 'function') render();
        }
    };
}
