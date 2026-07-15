export function attachSectionEvents() {
    // Edit section button click
    document.querySelectorAll('[data-edit-section]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sc = btn.dataset.editSection;
            if (typeof S !== 'undefined' && typeof SECTIONS !== 'undefined') {
                const sec = SECTIONS.find(s => s.code === sc);
                if (sec) {
                    S.editingSectionCode = sc;
                    S.editingSectionData = { ...sec };
                }
                if (typeof render === 'function') render();
            }
        });
    });

    // Delete section button click
    document.querySelectorAll('[data-delete-section]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sc = btn.dataset.deleteSection;
            if (confirm(`Are you sure you want to delete section ${sc}?`)) {
                if (typeof SECTIONS !== 'undefined') {
                    const idx = SECTIONS.findIndex(s => s.code === sc);
                    if (idx !== -1) SECTIONS.splice(idx, 1);
                }
                if (typeof SECTION_STUDENTS !== 'undefined') {
                    delete SECTION_STUDENTS[sc];
                }
                if (window.showToast) window.showToast(`Section ${sc} deleted.`, 'success', 'Section Deleted');
                if (typeof render === 'function') render();
            }
        });
    });

    // Edit section inputs
    const editSectionProgram = document.getElementById('editSectionProgram');
    if (editSectionProgram) editSectionProgram.addEventListener('change', e => {
        if (S.editingSectionData) S.editingSectionData.program = e.target.value;
    });

    const editSectionInstructor = document.getElementById('editSectionInstructor');
    if (editSectionInstructor) editSectionInstructor.addEventListener('change', e => {
        if (S.editingSectionData) S.editingSectionData.instructor = e.target.value;
    });

    const editSectionTime = document.getElementById('editSectionTime');
    if (editSectionTime) editSectionTime.addEventListener('input', e => {
        if (S.editingSectionData) S.editingSectionData.time = e.target.value;
    });

    const editSectionRoom = document.getElementById('editSectionRoom');
    if (editSectionRoom) editSectionRoom.addEventListener('input', e => {
        if (S.editingSectionData) S.editingSectionData.room = e.target.value;
    });

    // Save section edit
    const saveSectionEdit = document.getElementById('saveSectionEditBtn');
    if (saveSectionEdit) saveSectionEdit.addEventListener('click', () => {
        if (typeof S !== 'undefined' && typeof SECTIONS !== 'undefined' && S.editingSectionData) {
            const idx = SECTIONS.findIndex(s => s.code === S.editingSectionCode);
            if (idx !== -1) {
                SECTIONS[idx] = { ...S.editingSectionData };
                if (window.showToast) window.showToast(`Section ${S.editingSectionCode} updated.`, 'success', 'Section Updated');
            }
            S.editingSectionCode = null;
            S.editingSectionData = null;
            if (typeof render === 'function') render();
        }
    });

    // Cancel section edit
    const cancelSectionEditBtn = document.getElementById('cancelSectionEditBtn');
    if (cancelSectionEditBtn) cancelSectionEditBtn.addEventListener('click', () => {
        if (typeof S !== 'undefined') {
            S.editingSectionCode = null;
            S.editingSectionData = null;
            if (typeof render === 'function') render();
        }
    });

    // Add section
    const addSectionBtn = document.getElementById('addSectionBtn');
    if (addSectionBtn) addSectionBtn.addEventListener('click', () => {
        if (typeof S !== 'undefined') {
            S.showAddSectionModal = true;
            if (typeof render === 'function') render();
        }
    });

    const closeAddSectionBtn = document.getElementById('closeAddSectionBtn');
    if (closeAddSectionBtn) closeAddSectionBtn.addEventListener('click', () => {
        if (typeof S !== 'undefined') {
            S.showAddSectionModal = false;
            if (typeof render === 'function') render();
        }
    });

    const saveNewSectionBtn = document.getElementById('saveNewSectionBtn') || document.getElementById('sectionFormCreate');
    if (saveNewSectionBtn) saveNewSectionBtn.addEventListener('click', () => {
        const code = (document.getElementById('secCode') || document.getElementById('newSecCode'))?.value.trim();
        const program = (document.getElementById('secProgram') || document.getElementById('newSecProgram'))?.value;
        const room = (document.getElementById('secRoom') || document.getElementById('newSecRoom'))?.value.trim();
        const semester = (document.getElementById('secSemester') || document.getElementById('newSecSemester'))?.value.trim() || '1st Semester';
        const instructor = (document.getElementById('secInstructor') || document.getElementById('newSecInstructor'))?.value;
        const schoolYear = document.getElementById('secSchoolYear')?.value.trim() || '2025-2026';

        if (!code) { alert('Section code is required'); return; }

        const importedStudents = window.modalImportedStudents || (typeof S !== 'undefined' ? S.modalImportedStudents : null) || [];

        const originalText = saveNewSectionBtn.innerHTML;
        saveNewSectionBtn.innerHTML = 'Creating...';
        saveNewSectionBtn.disabled = true;

        fetch('/api/sections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                program: program,
                room: room || 'TBA',
                school_year: schoolYear,
                semester: semester,
                instructor_name: instructor || null,
                students: importedStudents,
                upload_token: window.modalUploadToken || null
            })
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status !== 201) {
                throw new Error(body.message || 'Failed to create section.');
            }

            if (window.showToast) {
                window.showToast(body.message || `Section ${code} created successfully.`, 'success', 'Section Added');
            } else {
                alert(`Section ${code} created successfully!`);
            }

            const overlay = document.getElementById('newSectionOverlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }

            window.modalImportedStudents = null;
            if (typeof S !== 'undefined') {
                S.modalImportedStudents = null;
                S.showAddSectionModal = false;
            }

            setTimeout(() => window.location.reload(), 1000);
        })
        .catch(err => {
            alert('Error creating section: ' + err.message);
            console.error(err);
        })
        .finally(() => {
            saveNewSectionBtn.innerHTML = originalText;
            saveNewSectionBtn.disabled = false;
        });
    });

    // Delete individual student from section details
    document.querySelectorAll('[data-delete-student]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!confirm('Are you sure you want to remove this student? They will be moved to the Student Archive.')) return;
            
            const sno = btn.dataset.deleteStudent;
            const sc = btn.dataset.sectionCode;

            if (typeof SECTION_STUDENTS !== 'undefined' && SECTION_STUDENTS[sc] && typeof S !== 'undefined') {
                const arr = SECTION_STUDENTS[sc];
                const idx = arr.findIndex(st => typeof st === 'object' ? st.studentNo === sno : false);
                if (idx !== -1) {
                    const studentRecord = arr[idx];
                    
                    // Archive sync
                    const ucSec = sc.toUpperCase();
                    const prog = studentRecord.program || (ucSec.includes('ROTC') ? 'ROTC' : (ucSec.includes('LTS') ? 'LTS' : 'CWTS'));
                    const secInfo = typeof SECTIONS !== 'undefined' ? SECTIONS.find(s => s.code === sc) : null;
                    const instructor = studentRecord.instructor || (secInfo ? secInfo.instructor : 'Unknown Instructor');

                    const archivedRecord = {
                        studentNo: studentRecord.studentNo,
                        name: studentRecord.name,
                        gender: studentRecord.gender || 'Unknown',
                        section: sc,
                        program: prog,
                        instructor: instructor,
                        finalGrade: studentRecord.finalGrade !== undefined ? studentRecord.finalGrade : null,
                        remarks: studentRecord.remarks || 'Dropped',
                        schoolYear: studentRecord.schoolYear || '2025-2026',
                        semester: studentRecord.semester || '1st Semester',
                        dateArchived: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    };

                    const existIdx = S.studentArchive.findIndex(s => s.studentNo === studentRecord.studentNo);
                    if (existIdx !== -1) {
                        S.studentArchive[existIdx] = archivedRecord;
                    } else {
                        S.studentArchive.push(archivedRecord);
                    }

                    arr.splice(idx, 1);
                    if (secInfo) {
                        secInfo.students = arr.length;
                    }
                    if (window.showToast) window.showToast(`Student removed from ${sc} and archived.`, 'success', 'Student Removed');
                    if (typeof render === 'function') render();
                }
            }
        });
    });

    // Quick Add Student
    const quickAddStudentBtn = document.getElementById('quickAddStudentBtn');
    if (quickAddStudentBtn) quickAddStudentBtn.addEventListener('click', () => {
        const sc = S.selectedSectionCode;
        if (!sc) return;

        const sno = document.getElementById('qaStudentNo')?.value.trim();
        const sname = document.getElementById('qaStudentName')?.value.trim();
        
        if (!sno || !sname) { alert('Please enter both Student No. and Name.'); return; }

        if (typeof SECTION_STUDENTS !== 'undefined' && SECTION_STUDENTS[sc]) {
            const arr = SECTION_STUDENTS[sc];
            if (arr.find(st => typeof st === 'object' && st.studentNo === sno)) {
                alert('Student number already exists in this section.');
                return;
            }

            arr.unshift({ studentNo: sno, name: sname });
            if (typeof SECTIONS !== 'undefined') {
                const sec = SECTIONS.find(s => s.code === sc);
                if (sec) sec.students = arr.length;
            }

            if (window.showToast) window.showToast(`Added ${sname} to ${sc}.`, 'success', 'Student Added');
            
            // Clear inputs
            if (document.getElementById('qaStudentNo')) document.getElementById('qaStudentNo').value = '';
            if (document.getElementById('qaStudentName')) document.getElementById('qaStudentName').value = '';
            
            if (typeof render === 'function') render();
        }
    });

    // Section view details
    document.querySelectorAll('[data-view-section]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof S !== 'undefined') {
                S.selectedSectionCode = btn.dataset.viewSection;
                if (typeof render === 'function') render();
            }
        });
    });

    const closeSectionViewBtn = document.getElementById('closeSectionViewBtn');
    if (closeSectionViewBtn) closeSectionViewBtn.addEventListener('click', () => {
        if (typeof S !== 'undefined') {
            S.selectedSectionCode = null;
            if (typeof render === 'function') render();
        }
    });

    const backToSectionsBtn = document.getElementById('backToSectionsBtn');
    if (backToSectionsBtn) backToSectionsBtn.addEventListener('click', () => {
        if (typeof S !== 'undefined') {
            S.selectedSectionCode = null;
            if (typeof render === 'function') render();
        }
    });

    // Import Master List XLSX Logic
    const importXlsxBtn = document.getElementById('importXlsxBtn');
    const xlsxImportInput = document.getElementById('xlsxImportInput');
    
    if (importXlsxBtn && xlsxImportInput) {
        importXlsxBtn.addEventListener('click', () => xlsxImportInput.click());
    }
    
    if (xlsxImportInput) {
        xlsxImportInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            // Change button state to loading
            const originalText = importXlsxBtn.innerHTML;
            importXlsxBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Importing...`;
            importXlsxBtn.disabled = true;

            fetch('/api/students/import', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status !== 200) {
                    throw new Error(body.message || 'Failed to import master list.');
                }
                
                const loads = [];
                if (window.loadStudentsFromDatabase) loads.push(window.loadStudentsFromDatabase());
                if (window.loadSectionsFromDatabase) loads.push(window.loadSectionsFromDatabase());
                if (window.fetchDashboardMetrics) loads.push(window.fetchDashboardMetrics().catch(() => {}));
                
                Promise.all(loads).finally(() => {
                    if (typeof render === 'function') render();
                    
                    if (window.showToast) {
                        window.showToast(`Imported ${body.imported_students} student record(s) successfully.`, 'success', 'Import Successful');
                    } else {
                        alert(`Student Master List imported successfully!\n- ${body.imported_students} student record(s) saved.`);
                    }
                    
                    // Reload the page to reflect blade data if JS state doesn't fully handle it
                    setTimeout(() => window.location.reload(), 1000);
                });
            })
            .catch(err => {
                if (window.showToast) {
                    window.showToast('Import failed: ' + err.message, 'error', 'Error');
                } else {
                    alert('Import failed: ' + err.message);
                }
                console.error(err);
            })
            .finally(() => {
                xlsxImportInput.value = '';
                importXlsxBtn.innerHTML = originalText;
                importXlsxBtn.disabled = false;
            });
        });
    }
}
