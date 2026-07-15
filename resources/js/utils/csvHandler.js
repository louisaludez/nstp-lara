/**
 * CSV Handler Utilities
 * Exports data to CSV format and handles CSV import logic.
 */

export function exportAuditCSV(logs, activeFilter) {
    if (!logs || logs.length === 0) {
        alert('No logs to export.');
        return;
    }

    const header = ['Timestamp', 'User_Email', 'Module', 'Action', 'Severity', 'Details'];
    const rows = logs.map(l => [
        `"${l.timestamp}"`,
        `"${l.user_email}"`,
        `"${l.module}"`,
        `"${l.action}"`,
        `"${l.severity}"`,
        `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csv = [header.join(','), ...rows].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NSTP_Audit_Log_${activeFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportGradesToCSV(students, program) {
    if (!students || students.length === 0) return;

    const headerParts = ['Student ID', 'Name', 'Course', 'Program'];
    const rows = students.map(s => {
        return [
            s.id,
            `"${s.name}"`,
            s.course,
            s.program
        ];
    });

    let csv = headerParts.join(',') + '\n';
    rows.forEach(r => {
        csv += r.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NSTP_${program}_Archive_${new Date().getFullYear()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.exportAuditCSV = exportAuditCSV;
window.exportGradesToCSV = exportGradesToCSV;
