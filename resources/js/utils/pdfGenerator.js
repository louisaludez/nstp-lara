/**
 * PDF Generation Utilities
 * Uses jsPDF to generate reports, audit logs, and certificates.
 */

export function exportQueueToPDF(approvalsData, filename = 'NSTP_Approval_Queue.pdf') {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        console.error('jsPDF library not loaded');
        return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const now = new Date().toLocaleString();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 56, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NSTP - Pending Report Approvals', 40, 34);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exported: ${now}`, 40, 48);

    // Table header
    let y = 80;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('#', 40, y);
    doc.text('Report Title', 65, y);
    doc.text('Instructor', 280, y);
    doc.text('Section', 390, y);
    doc.text('Submitted', 470, y);
    doc.text('Priority', 540, y);
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(40, y, pageW - 40, y);
    y += 14;

    // Rows
    doc.setFont('helvetica', 'normal');
    approvalsData.forEach((a, i) => {
        doc.setTextColor(30, 41, 59);
        doc.text(String(i + 1), 40, y);
        doc.text(doc.splitTextToSize(a.title, 200)[0], 65, y);
        doc.text(a.instructor, 280, y);
        doc.text(a.section, 390, y);
        doc.text(a.submitted, 470, y);
        
        if (a.risk === 'Urgent') doc.setTextColor(220, 38, 38);
        else doc.setTextColor(100, 116, 139);
        
        doc.text(a.risk || 'Normal', 540, y);
        doc.setTextColor(30, 41, 59);
        y += 6;
        doc.setDrawColor(241, 245, 249);
        doc.line(40, y, pageW - 40, y);
        y += 14;
    });

    // Footer
    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Total: ${approvalsData.length} item(s) pending review  |  Davao Del Norte State College - NSTP`, 40, y);

    doc.save(filename);
}

export function generateCertPDF(batch, template) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    batch.students.forEach((s, i) => {
        if (i > 0) doc.addPage();
        
        if (template && template.img) {
            let format = 'JPEG';
            if (template.img.startsWith('data:image/png')) format = 'PNG';
            else if (template.img.startsWith('data:image/gif')) format = 'GIF';
            doc.addImage(template.img, format, 0, 0, W, H);
        }

        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(36);
        const nameW = doc.getTextWidth(s.name);
        doc.text(s.name, (W - nameW) / 2, 280);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const detailTxt = `has successfully completed the ${batch.program} program`;
        const dW = doc.getTextWidth(detailTxt);
        doc.text(detailTxt, (W - dW) / 2, 330);

        doc.setFontSize(12);
        const noTxt = `Serial No: ${s.serialNo}`;
        doc.text(noTxt, 50, H - 50);
    });

    doc.save(`NSTP_Certificates_${batch.program}_${batch.date.replace(/ /g, '_')}.pdf`);
}

window.exportQueueToPDF = exportQueueToPDF;
window.generateCertPDF = generateCertPDF;
