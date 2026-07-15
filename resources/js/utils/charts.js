/**
 * Charting Utilities
 * Wrappers for Chart.js rendering
 */

export function renderEnrollmentChart(ctx, data) {
    if (!window.Chart) return null;
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2023', '2024', '2025', '2026'],
            datasets: [
                {
                    label: 'CWTS',
                    data: data.cwts || [300, 350, 380, 400],
                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    borderRadius: 4
                },
                {
                    label: 'LTS',
                    data: data.lts || [150, 180, 200, 210],
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 4
                },
                {
                    label: 'ROTC',
                    data: data.rotc || [200, 220, 250, 280],
                    backgroundColor: 'rgba(244, 63, 94, 0.8)',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } }
            }
        }
    });
}

export function renderPassFailChart(ctx, data) {
    if (!window.Chart) return null;
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Passed', 'Failed', 'Incomplete'],
            datasets: [{
                data: data.passFail || [85, 10, 5],
                backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } }
            }
        }
    });
}

window.renderEnrollmentChart = renderEnrollmentChart;
window.renderPassFailChart = renderPassFailChart;
