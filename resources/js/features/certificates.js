export function attachCertificateEvents() {
    // Generate Report button (Dashboard)
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            if (typeof S !== 'undefined') {
                S.reportGenerated = true;
                if (!S.reportHistory) S.reportHistory = [];
                const typeLabels = { enrollment: 'Enrollment Summary', performance: 'Academic Performance', activities: 'Activity Accomplishment', instructors: 'Instructor Load Report', certificates: 'Certificate Issuance' };
                const filterDesc = [
                    S.reportProgram !== 'All' ? S.reportProgram : 'All Programs',
                    S.reportSemester !== 'All' ? S.reportSemester + ' Sem' : 'All Semesters',
                    S.reportSchoolYear !== 'All' ? S.reportSchoolYear : 'All Years',
                ].join(' · ');
                S.reportHistory.push({
                    label: typeLabels[S.reportType] || S.reportType,
                    type: S.reportType,
                    filters: filterDesc,
                    records: '—',
                    time: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
                });
                if (window.showToast) window.showToast('Report generated successfully. Use the export buttons to save.', 'success', 'Report Ready');
                if (typeof render === 'function') render();
            }
        });
    }

    // Export Queue PDF download
    const exportQueueBtn = document.getElementById('exportQueueBtn');
    if (exportQueueBtn) {
        exportQueueBtn.addEventListener('click', () => {
            if (window.exportQueueToPDF && typeof APPROVALS !== 'undefined') {
                window.exportQueueToPDF(APPROVALS, 'NSTP_Approval_Queue.pdf');
            }
        });
    }

    // Per-row Generate buttons open student modal
    document.querySelectorAll('[data-cert-batch]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.certModal = parseInt(btn.dataset.certBatch);
                if (typeof render === 'function') render();
            }
        });
    });

    // Template selection buttons in the generation modal
    document.querySelectorAll('[data-select-tpl]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.selectedTemplateId = btn.dataset.selectTpl;
                if (typeof render === 'function') render();
            }
        });
    });

    // Batch card click toggle delete button
    document.querySelectorAll('[data-batch-card]').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-delete-batch]') || e.target.closest('[data-cert-batch]')) return;
            const bi = parseInt(card.dataset.batchCard);
            if (typeof S !== 'undefined') {
                S.selectedBatchIdx = S.selectedBatchIdx === bi ? null : bi;
                if (typeof render === 'function') render();
            }
        });
    });

    // Delete batch card
    document.querySelectorAll('[data-delete-batch]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const bi = parseInt(btn.dataset.deleteBatch);
            if (typeof S !== 'undefined') {
                S.batches.splice(bi, 1);
                if (typeof BATCH_STUDENTS !== 'undefined' && BATCH_STUDENTS[bi]) BATCH_STUDENTS.splice(bi, 1);
                S.selectedBatchIdx = null;
                if (typeof render === 'function') render();
            }
        });
    });

    // Cert modal close
    const certModalClose = document.getElementById('certModalClose');
    if (certModalClose) certModalClose.addEventListener('click', () => { if (typeof S !== 'undefined') S.certModal = null; if (typeof render === 'function') render(); });
    const certModalOverlay = document.getElementById('certModalOverlay');
    if (certModalOverlay) certModalOverlay.addEventListener('click', e => { if (e.target === certModalOverlay) { if (typeof S !== 'undefined') S.certModal = null; if (typeof render === 'function') render(); } });

    // Generate Student Certificate PDF
    function generateStudentCertPDF(studentName, batchIdx, serialNo) {
        if (typeof S === 'undefined') return;
        const batch = S.batches[batchIdx];
        if (!batch) return;
        
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            console.error('jsPDF library not loaded');
            return;
        }
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();

        const template = S.certTemplates.find(t => t.id === S.selectedTemplateId) || S.certTemplates[0];
        const palette = {
            indigo: { main: [79, 70, 229], light: [199, 210, 254] },
            emerald: { main: [16, 185, 129], light: [167, 243, 208] },
            amber: { main: [245, 158, 11], light: [253, 230, 138] },
            rose: { main: [244, 63, 94], light: [254, 205, 211] }
        };
        const pal = palette[template.color || 'indigo'] || palette.indigo;

        if (template.img) {
            let format = 'JPEG';
            if (template.img.startsWith('data:image/png')) format = 'PNG';
            else if (template.img.startsWith('data:image/gif')) format = 'GIF';
            doc.addImage(template.img, format, 0, 0, W, H);
        } else {
            // Outer border
            doc.setDrawColor(pal.main[0], pal.main[1], pal.main[2]); doc.setLineWidth(8); doc.rect(16, 16, W - 32, H - 32);
            doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]); doc.setLineWidth(2); doc.rect(24, 24, W - 48, H - 48);
            // Banner
            doc.setFillColor(pal.main[0], pal.main[1], pal.main[2]); doc.rect(24, 24, W - 48, 48, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
            doc.text('DAVAO DEL NORTE STATE COLLEGE', W / 2, 53, { align: 'center' });
        }

        // Title
        doc.setTextColor(30, 41, 59); doc.setFontSize(28); doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICATE OF COMPLETION', W / 2, 116, { align: 'center' });
        doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139);
        doc.text('National Service Training Program (NSTP)', W / 2, 138, { align: 'center' });
        doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]); doc.setLineWidth(1.5); doc.line(80, 150, W - 80, 150);
        // Body
        doc.setFontSize(12); doc.setTextColor(30, 41, 59); doc.setFont('helvetica', 'normal');
        doc.text('This is to certify that', W / 2, 178, { align: 'center' });
        // Student name large and prominent
        doc.setFontSize(26); doc.setFont('helvetica', 'bold'); doc.setTextColor(pal.main[0], pal.main[1], pal.main[2]);
        doc.text(studentName, W / 2, 210, { align: 'center' });
        // Serial number directly below name
        const certNo = serialNo || `NSTP-${Date.now().toString().slice(-6)}`;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
        doc.text(`Serial No.: ${certNo}`, W / 2, 226, { align: 'center' });
        // Program line
        doc.setFontSize(12); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 41, 59);
        doc.text('has successfully completed all requirements of the', W / 2, 250, { align: 'center' });
        doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
        doc.text(`${batch.program} - ${batch.name}`, W / 2, 272, { align: 'center' });
        doc.setFontSize(12); doc.setFont('helvetica', 'normal');
        doc.text('for Academic Year 2025 - 2026.', W / 2, 292, { align: 'center' });
        doc.setDrawColor(pal.light[0], pal.light[1], pal.light[2]); doc.setLineWidth(1.5); doc.line(80, 308, W - 80, 308);
        // Signatures
        const sigY = 352;
        [W * 0.22, W * 0.5, W * 0.78].forEach((x, i) => {
            const lbl = ['NSTP Coordinator', 'College President', 'Registrar'][i];
            doc.setDrawColor(148, 163, 184); doc.setLineWidth(1); doc.line(x - 70, sigY, x + 70, sigY);
            doc.setFontSize(9); doc.setTextColor(100, 116, 139);
            doc.setFont('helvetica', 'bold'); doc.text(lbl, x, sigY + 14, { align: 'center' });
            doc.setFont('helvetica', 'normal'); doc.text('Davao Del Norte State College', x, sigY + 26, { align: 'center' });
        });
        // Footer
        const issued = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.setFontSize(8); doc.setTextColor(148, 163, 184);
        doc.text(`Issued: ${issued}`, 40, H - 34);
        doc.text(`Certificate No.: ${certNo}`, W - 40, H - 34, { align: 'right' });
        
        const safe = studentName.replace(/[^a-z0-9]/gi, '_');
        doc.save(`Certificate_${safe}.pdf`);
    }

    document.querySelectorAll('[data-student-cert]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof S === 'undefined' || typeof BATCH_STUDENTS === 'undefined') return;
            const si = parseInt(btn.dataset.studentCert);
            const bi = parseInt(btn.dataset.batchIdx);
            const batch = S.batches[bi];
            const student = BATCH_STUDENTS[bi]?.[si];
            if (!student || !batch) return;
            const name = typeof student === 'string' ? student : student.name;
            const serialNo = typeof student === 'string' ? `NSTP-${Date.now().toString().slice(-6)}` : (student.serialNo || `NSTP-${Date.now().toString().slice(-6)}`);
            generateStudentCertPDF(name, bi, serialNo);
            
            // Add to Recently Issued
            S.recentCerts.unshift({
                name,
                program: batch.program,
                id: serialNo,
                issued: 'Just now'
            });

            if (window.logAudit) window.logAudit('Generated', 'Certificates', name, `Issued individual NSTP certificate for ${name} (${batch.program}). Control No: ${serialNo}`, 'system');

            if (window.showToast) window.showToast(`Certificate generated for <strong>${name}</strong>.`, 'success', 'Certificate Issued');
            if (typeof render === 'function') render();
        });
    });

    // Generate All from modal footer
    const certModalGenAll = document.getElementById('certModalGenAll');
    if (certModalGenAll) {
        certModalGenAll.addEventListener('click', () => {
            if (typeof S === 'undefined' || typeof BATCH_STUDENTS === 'undefined') return;
            const bi = S.certModal;
            if (bi === null) return;
            const batch = S.batches[bi];
            const students = BATCH_STUDENTS[bi] || [];
            if (!students.length) return;
            
            // Generate PDFs staggered pass each student's real serial number
            students.forEach((student, i) => {
                const name = typeof student === 'string' ? student : student.name;
                const serialNo = typeof student === 'string' ? `NSTP-${Date.now().toString().slice(-6)}-${i + 1}` : (student.serialNo || `NSTP-${Date.now().toString().slice(-6)}-${i + 1}`);
                setTimeout(() => generateStudentCertPDF(name, bi, serialNo), i * 300);
            });
            
            // Add all to Recently Issued at once
            const now = new Date();
            const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
            students.forEach((student, i) => {
                const name = typeof student === 'string' ? student : student.name;
                const serialNo = typeof student === 'string' ? `NSTP-${Date.now().toString().slice(-6)}-${i + 1}` : (student.serialNo || `NSTP-${Date.now().toString().slice(-6)}-${i + 1}`);
                S.recentCerts.unshift({
                    name,
                    program: batch?.program || 'NSTP',
                    id: serialNo,
                    issued: 'Today ' + timeStr
                });
            });

            if (window.logAudit) window.logAudit('Generated', 'Certificates', batch.name, `Issued batch NSTP certificates for ${batch.name} (${students.length} certs).`, 'system');

            if (window.showToast) window.showToast(`<strong>${students.length}</strong> certificate(s) generated for ${batch?.name || 'batch'}.`, 'success', 'Batch Generated');
            S.certModal = null;
            if (typeof render === 'function') render();
        });
    }

    // Generate Batch (all) header button generate batch PDFs
    const generateBatchAllBtn = document.getElementById('generateBatchAllBtn');
    if (generateBatchAllBtn) generateBatchAllBtn.addEventListener('click', () => {
        if (typeof S !== 'undefined' && window.generateCertPDF) {
            S.batches.forEach((b, i) => setTimeout(() => window.generateCertPDF(b), i * 400));
        }
    });

    // Recently Issued list item click toggle delete button
    document.querySelectorAll('[data-recent-item]').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('[data-delete-recent]')) return;
            const ri = parseInt(item.dataset.recentItem);
            if (typeof S !== 'undefined') {
                S.selectedRecentCertIdx = S.selectedRecentCertIdx === ri ? null : ri;
                if (typeof render === 'function') render();
            }
        });
    });

    // Delete recent certificate
    document.querySelectorAll('[data-delete-recent]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ri = parseInt(btn.dataset.deleteRecent);
            if (typeof S !== 'undefined') {
                S.recentCerts.splice(ri, 1);
                S.selectedRecentCertIdx = null;
                if (typeof render === 'function') render();
            }
        });
    });
}
