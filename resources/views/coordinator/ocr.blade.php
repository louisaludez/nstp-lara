@extends('layouts.coordinator')

@section('title', 'OCR Grade Import - DNSC NSTP Portal')

@section('content')
<div class="space-y-6" id="ocr-container">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">OCR Grade Import</h1>
            <p class="text-sm text-slate-500 mt-1">Upload XLSX/XLS grade sheets to automatically record grades and enrollments in the database</p>
        </div>
    </div>

    <!-- MAIN INTERFACE STATE: UPLOAD -->
    <div id="uploadState" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Upload Box Column -->
        <div class="lg:col-span-2 space-y-5">
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[350px]">
                <!-- Drag and Drop Zone -->
                <div id="ocrDropZone" class="group relative flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-slate-50/50 cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-400 transition-all duration-300">
                    <div class="w-16 h-16 rounded-2xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:shadow-indigo-100 transition-all duration-300 mb-4">
                        <x-icon name="upload" class="w-8 h-8" />
                    </div>
                    <div class="text-slate-800 font-semibold text-base">Drop your XLSX grade sheet here or <span class="text-indigo-600 underline group-hover:text-indigo-700 transition">click to browse</span></div>
                    <div class="text-xs text-slate-400 mt-2 font-medium">Supports Excel formats (.xlsx, .xls) &middot; up to 25 MB</div>
                    <input id="ocrFileInput" type="file" accept=".xlsx,.xls" class="hidden" />
                </div>

                <!-- Info Cards -->
                <div class="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
                    <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-all duration-200">
                        <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Grade Scale</div>
                        <div class="font-bold text-slate-700">1.0 - 5.0</div>
                    </div>
                    <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100/60 hover:shadow-sm transition-all duration-200">
                        <div class="text-[10px] uppercase font-bold tracking-wider text-emerald-500 mb-1">Pass Range</div>
                        <div class="font-bold text-emerald-600">1.0 - 3.0</div>
                    </div>
                    <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-100/60 hover:shadow-sm transition-all duration-200">
                        <div class="text-[10px] uppercase font-bold tracking-wider text-rose-500 mb-1">Fail Range</div>
                        <div class="font-bold text-rose-600">5.0</div>
                    </div>
                </div>

                <!-- Alert Information -->
                <div class="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-800 flex items-start gap-3">
                    <x-icon name="alertc" class="w-5 h-5 shrink-0 text-amber-500" />
                    <div class="space-y-1">
                        <span class="font-bold block">Expected XLSX Column Structure:</span>
                        <p class="leading-relaxed">The sheet must contain at least a <strong>Student Name</strong> column and a <strong>Final Grade</strong> (or GWA) column. A <strong>Section</strong> column is optional; if missing, it will be inferred from the filename.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- History Column -->
        <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between pb-3 border-b border-slate-50 mb-4">
                        <div>
                            <h2 class="font-bold text-slate-900 text-base">Import History</h2>
                            <div class="text-xs text-slate-500 font-medium mt-0.5" id="historyCount">0 file(s) processed</div>
                        </div>
                        <button id="clearHistoryBtn" class="text-xs text-slate-400 hover:text-rose-600 hover:underline font-medium transition hidden">Clear All</button>
                    </div>
                    <ul class="space-y-2 max-h-[400px] overflow-y-auto pr-1" id="ocrUploadHistory">
                        <li id="noHistoryItem" class="text-sm text-slate-400 text-center py-10 flex flex-col items-center gap-2">
                            <x-icon name="upload" class="w-8 h-8 text-slate-300 mb-1" />
                            <span>No uploads yet. Drop an XLSX file to get started.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- VISUAL STATE: LOADING -->
    <div id="loadingState" class="hidden bg-white/80 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] max-w-2xl mx-auto space-y-6 transition-all duration-300">
        <!-- Spinner -->
        <div class="relative w-20 h-20 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
            <div class="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <x-icon name="scan" class="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
        <div class="space-y-2">
            <h3 class="text-lg font-bold text-slate-800" id="loadingTitle">Processing Grade Sheet</h3>
            <p class="text-sm text-slate-500 leading-relaxed max-w-md" id="loadingSubtitle">Reading workbook and resolving columns client-side...</p>
        </div>
        <!-- Progress Bar -->
        <div class="w-full bg-slate-100 rounded-full h-2 max-w-xs overflow-hidden">
            <div id="loadingProgressBar" class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
    </div>

    <!-- VISUAL STATE: RESULTS DASHBOARD -->
    <div id="resultsState" class="hidden space-y-6 transition-all duration-300">
        <!-- Dashboard Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
                <div class="flex items-center gap-2">
                    <span id="resultsComponentTag" class="text-xs px-2.5 py-0.5 rounded-full font-bold">CWTS</span>
                    <h2 class="text-xl font-bold text-slate-900" id="resultsSectionName">CWTS-1A Grades</h2>
                </div>
                <p class="text-xs text-slate-500 mt-1" id="resultsFilename">File: CWTS-1A_grades_import.xlsx</p>
            </div>
            <button id="closeResultsBtn" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm">
                <x-icon name="close" class="w-4 h-4" /> Reset & Upload New
            </button>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Card -->
            <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                    <x-icon name="users" class="w-6 h-6" />
                </div>
                <div>
                    <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Students</div>
                    <div class="text-2xl font-extrabold text-slate-800 mt-0.5" id="metricTotal">0</div>
                </div>
            </div>

            <!-- Passed Card -->
            <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                    <x-icon name="check" class="w-6 h-6" />
                </div>
                <div>
                    <div class="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Passed</div>
                    <div class="text-2xl font-extrabold text-emerald-600 mt-0.5" id="metricPassed">0</div>
                </div>
            </div>

            <!-- Failed Card -->
            <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                    <x-icon name="close" class="w-6 h-6" />
                </div>
                <div>
                    <div class="text-[10px] uppercase font-bold tracking-wider text-rose-400">Failed</div>
                    <div class="text-2xl font-extrabold text-rose-600 mt-0.5" id="metricFailed">0</div>
                </div>
            </div>

            <!-- Pass Rate Card -->
            <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div class="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner">
                    <x-icon name="trend" class="w-6 h-6" />
                </div>
                <div>
                    <div class="text-[10px] uppercase font-bold tracking-wider text-violet-400">Pass Rate</div>
                    <div class="text-2xl font-extrabold text-violet-600 mt-0.5" id="metricPassRate">0%</div>
                </div>
            </div>
        </div>

        <!-- Roster Table Renders -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <!-- Search / Filter Bar -->
            <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                <div class="flex items-center gap-3">
                    <h3 class="font-bold text-slate-800 text-base">Student Grade Roster</h3>
                    <button id="exportResultsBtn" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 shrink-0">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg> Export to Excel
                    </button>
                </div>
                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <!-- Search Input -->
                    <div class="relative flex-1 sm:flex-none">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <x-icon name="search" class="w-4 h-4" />
                        </span>
                        <input id="rosterSearch" type="text" placeholder="Search by student name..." class="w-full sm:w-64 pl-9 pr-3 py-2 text-sm rounded-xl bg-white border border-slate-200 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                </div>
            </div>

            <!-- Roster Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm whitespace-nowrap" id="rosterTable">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                            <th class="py-3.5 px-4 w-10 text-center">#</th>
                            <th class="py-3.5 px-4">Student Name</th>
                            <th class="py-3.5 px-4 w-32">Student ID</th>
                            <th class="py-3.5 px-4 w-28 text-center">Final Grade</th>
                            <th class="py-3.5 px-4 w-32 text-center">Roster Remarks</th>
                            <th class="py-3.5 px-4 w-44 text-center">Database Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50" id="rosterTableBody">
                        <!-- Dynamic list items insert here -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
@vite(['resources/js/app.js'])
<script>
    document.addEventListener('DOMContentLoaded', () => {
        // Elements configuration
        const uploadState = document.getElementById('uploadState');
        const loadingState = document.getElementById('loadingState');
        const resultsState = document.getElementById('resultsState');

        const ocrDropZone = document.getElementById('ocrDropZone');
        const ocrFileInput = document.getElementById('ocrFileInput');
        const ocrUploadHistory = document.getElementById('ocrUploadHistory');
        const noHistoryItem = document.getElementById('noHistoryItem');
        const historyCount = document.getElementById('historyCount');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');

        const loadingTitle = document.getElementById('loadingTitle');
        const loadingSubtitle = document.getElementById('loadingSubtitle');
        const loadingProgressBar = document.getElementById('loadingProgressBar');

        const resultsSectionName = document.getElementById('resultsSectionName');
        const resultsFilename = document.getElementById('resultsFilename');
        const resultsComponentTag = document.getElementById('resultsComponentTag');
        const closeResultsBtn = document.getElementById('closeResultsBtn');

        const metricTotal = document.getElementById('metricTotal');
        const metricPassed = document.getElementById('metricPassed');
        const metricFailed = document.getElementById('metricFailed');
        const metricPassRate = document.getElementById('metricPassRate');

        const rosterSearch = document.getElementById('rosterSearch');
        const rosterTableBody = document.getElementById('rosterTableBody');

        // Current active result roster cache
        let currentRoster = [];

        // 1. History Persistence Management (Local Storage)
        const loadHistoryFromStorage = () => {
            const stored = localStorage.getItem('NSTP_OCR_HISTORY');
            let history = [];
            try {
                history = stored ? JSON.parse(stored) : [];
            } catch (e) {
                history = [];
            }

            // Remove no history item if there are history entries
            if (history.length > 0) {
                if (noHistoryItem) noHistoryItem.classList.add('hidden');
                if (clearHistoryBtn) clearHistoryBtn.classList.remove('hidden');
                
                // Remove existing history elements except noHistoryItem
                const items = ocrUploadHistory.querySelectorAll('.history-entry');
                items.forEach(el => el.remove());

                // Loop and inject
                history.forEach((entry, idx) => {
                    const li = document.createElement('li');
                    li.className = 'history-entry flex items-center justify-between p-3.5 rounded-xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/20 cursor-pointer transition duration-200 group';
                    
                    let componentClass = entry.summary.component === 'ROTC' 
                        ? 'bg-rose-50 text-rose-700' 
                        : (entry.summary.component === 'LTS' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700');
                    
                    li.innerHTML = `
                        <div class="flex items-center gap-3 min-w-0">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${componentClass}">${entry.summary.component || 'CWTS'}</span>
                            <div class="min-w-0">
                                <div class="text-sm font-bold text-slate-800 truncate">${entry.summary.section}</div>
                                <div class="text-[10px] text-slate-400 font-medium truncate mt-0.5">${entry.filename} &middot; ${entry.time}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <span class="text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition">${entry.summary.total} stds</span>
                            <button class="delete-history-btn p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition duration-200" data-idx="${idx}" title="Delete Record">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    `;

                    // Bind item click to display historical results
                    li.addEventListener('click', (e) => {
                        if (e.target.closest('.delete-history-btn')) return;
                        displayResults(entry);
                    });

                    ocrUploadHistory.appendChild(li);
                });

                // Attach delete button events
                document.querySelectorAll('.delete-history-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const idx = parseInt(btn.dataset.idx);
                        deleteHistoryItem(idx);
                    });
                });

                historyCount.textContent = `${history.length} file(s) processed`;
            } else {
                if (noHistoryItem) noHistoryItem.classList.remove('hidden');
                if (clearHistoryBtn) clearHistoryBtn.classList.add('hidden');
                historyCount.textContent = '0 file(s) processed';
                
                // Clear any existing list items
                const items = ocrUploadHistory.querySelectorAll('.history-entry');
                items.forEach(el => el.remove());
            }
        };

        const saveHistoryToStorage = (entry) => {
            const stored = localStorage.getItem('NSTP_OCR_HISTORY');
            let history = [];
            try {
                history = stored ? JSON.parse(stored) : [];
            } catch (e) {
                history = [];
            }

            // Remove existing history item with same section and filename to prevent duplicates
            history = history.filter(h => !(h.summary.section === entry.summary.section && h.filename === entry.filename));

            history.unshift(entry);
            localStorage.setItem('NSTP_OCR_HISTORY', JSON.stringify(history));
            loadHistoryFromStorage();
        };

        const deleteHistoryItem = (idx) => {
            const stored = localStorage.getItem('NSTP_OCR_HISTORY');
            let history = stored ? JSON.parse(stored) : [];
            history.splice(idx, 1);
            localStorage.setItem('NSTP_OCR_HISTORY', JSON.stringify(history));
            loadHistoryFromStorage();
            if (window.showToast) window.showToast('Import record deleted from history.', 'info', 'Record Removed');
        };

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to clear your entire import history? This does not delete students from the database.")) {
                    localStorage.removeItem('NSTP_OCR_HISTORY');
                    loadHistoryFromStorage();
                    if (window.showToast) window.showToast('Import history cleared.', 'success', 'History Cleared');
                }
            });
        }

        // Initialize history list
        loadHistoryFromStorage();

        // 2. Drag & Drop Actions Setup
        if (ocrDropZone) {
            ocrDropZone.addEventListener('click', () => ocrFileInput && ocrFileInput.click());
            ocrDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                ocrDropZone.classList.add('border-indigo-400', 'bg-indigo-50/40');
            });
            ocrDropZone.addEventListener('dragleave', () => {
                ocrDropZone.classList.remove('border-indigo-400', 'bg-indigo-50/40');
            });
            ocrDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                ocrDropZone.classList.remove('border-indigo-400', 'bg-indigo-50/40');
                if (e.dataTransfer.files.length) {
                    processFile(e.dataTransfer.files[0]);
                }
            });
        }

        if (ocrFileInput) {
            ocrFileInput.addEventListener('click', e => e.stopPropagation());
            ocrFileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    processFile(e.target.files[0]);
                }
            });
        }

        // 3. Process File via SheetJS and Sync with Server
        const processFile = (file) => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (!['xlsx', 'xls'].includes(ext)) {
                if (window.showToast) window.showToast('Only XLSX and XLS formats are supported.', 'error', 'Unsupported File');
                return;
            }

            if (file.size > 25 * 1024 * 1024) {
                if (window.showToast) window.showToast('File size exceeds the 25 MB limit.', 'error', 'File Too Large');
                return;
            }

            // Enter loading visual state
            uploadState.classList.add('hidden');
            loadingState.classList.remove('hidden');
            updateProgress(15, 'Reading workbook...', 'Loading file contents...');

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    updateProgress(35, 'Parsing grade rows...', 'Extracting columns from the first sheet...');

                    const wb = window.XLSX.read(evt.target.result, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rows = window.XLSX.utils.sheet_to_json(ws, { defval: '' });

                    if (!rows.length) {
                        throw new Error('The Excel sheet appears to be empty.');
                    }

                    // Flexible Column Mapping Resolution
                    const getColVal = (row, ...keys) => {
                        for (const k of keys) {
                            const found = Object.keys(row).find(rk => rk.trim().toLowerCase() === k.toLowerCase());
                            if (found !== undefined && String(row[found]).trim() !== '') {
                                return String(row[found]).trim();
                            }
                        }
                        return '';
                    };

                    const classifyGrade = (rawGrade) => {
                        const g = parseFloat(rawGrade);
                        if (isNaN(g)) {
                            const clean = String(rawGrade || '').trim().toLowerCase();
                            if (clean === 'passed' || clean === 'pass' || clean === 'p') return 'Passed';
                            if (clean === 'failed' || clean === 'fail' || clean === 'f') return 'Failed';
                            if (clean === 'pending' || clean === 'active') return 'Pending';
                            return 'N/A';
                        }
                        if (g >= 1.0 && g <= 3.0) return 'Passed';
                        if (g > 3.0 && g <= 5.0) return 'Failed';
                        if (g >= 75.0 && g <= 100.0) return 'Passed';
                        if (g >= 50.0 && g < 75.0) return 'Failed';
                        return 'N/A';
                    };

                    const normalizeRemarks = (rawRemarks) => {
                        if (!rawRemarks) return null;
                        const clean = String(rawRemarks).trim().toLowerCase();
                        if (clean.startsWith('pass') || clean === 'p') return 'Passed';
                        if (clean.startsWith('fail') || clean === 'f') return 'Failed';
                        if (clean.startsWith('pend') || clean === 'active') return 'Pending';
                        return null;
                    };

                    let sectionCode = '';
                    const parsedStudents = [];

                    rows.forEach(row => {
                        const name = getColVal(row, 'Student Name', 'Name', 'Full Name', 'Student', 'Lastname, Firstname', 'Student_Name', 'STUDENT NAME', 'FULLNAME');
                        const grade = getColVal(row, 'Grade', 'Final Grade', 'Final_Grade', 'GWA', 'Score', 'Rating', 'Grades', 'GRADE', 'FINAL GRADE');
                        const sec = getColVal(row, 'Section', 'Section Code', 'Class', 'SECTION');
                        const studentNo = getColVal(row, 'Student No', 'Student Number', 'ID', 'Student_No', 'Student_Number', 'STUDENT NO', 'STUDENT NUMBER');
                        const serialNo = getColVal(row, 'Serial Number', 'Serial No', 'Serial_Number', 'Serial_No', 'SERIAL NUMBER', 'SERIAL NO');
                        const rawRemarks = getColVal(row, 'Remarks', 'Status', 'Remark', 'Remarks/Status', 'REMARKS', 'STATUS', 'REMARK');

                        if (!sectionCode && sec) sectionCode = sec;
                        if (!name) return; // skip headers/empty rows

                        const remarksNormalized = normalizeRemarks(rawRemarks);

                        parsedStudents.push({
                            name,
                            student_no: studentNo || null,
                            serial_no: serialNo || null,
                            grade: grade || null,
                            remarks: remarksNormalized || classifyGrade(grade)
                        });
                    });

                    if (!parsedStudents.length) {
                        throw new Error('No valid students found. Ensure columns like "Name" or "Student Name" exist.');
                    }

                    // Infer section code if missing
                    if (!sectionCode) {
                        sectionCode = file.name
                            .replace(/\.(xlsx|xls)$/i, '')
                            .replace(/[_\s]+/g, '-')
                            .split('-').slice(0, 2).join('-')
                            .toUpperCase() || 'IMPORTED';
                    }

                    updateProgress(60, 'Synchronizing database...', 'Syncing parsed records with DNSC portal database...');

                    // 4. Send AJAX syncing request to Server
                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                    
                    fetch('/coordinator/ocr/import', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            section: sectionCode.toUpperCase(),
                            filename: file.name,
                            students: parsedStudents
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => { throw new Error(err.message || 'Database error occurred.'); });
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            updateProgress(100, 'Import Completed!', 'Grades synced and audit logs generated successfully.');
                            
                            const now = new Date();
                            const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
                            const hours = now.getHours() % 12 || 12;
                            const timeStr = `Today ${hours}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;
                            
                            const historyEntry = {
                                filename: file.name,
                                time: timeStr,
                                summary: data.summary,
                                results: data.results
                            };

                            // Save to persistent storage and update list
                            saveHistoryToStorage(historyEntry);

                            setTimeout(() => {
                                loadingState.classList.add('hidden');
                                displayResults(historyEntry);
                            }, 500);

                            if (window.showToast) window.showToast(`Imported ${data.summary.total} student grades for section <strong>${data.summary.section}</strong>.`, 'success', 'Import Successful');
                        } else {
                            throw new Error(data.message || 'Verification failure.');
                        }
                    })
                    .catch(err => {
                        handleError(err.message || 'Verification failure.');
                    });

                } catch (err) {
                    handleError(err.message);
                }
            };

            reader.onerror = () => handleError('Could not read file. The file may be locked or corrupted.');
            reader.readAsArrayBuffer(file);
        };

        const updateProgress = (pct, title, sub) => {
            loadingProgressBar.style.width = `${pct}%`;
            loadingTitle.textContent = title;
            loadingSubtitle.textContent = sub;
        };

        const handleError = (msg) => {
            console.error('OCR Error:', msg);
            loadingState.classList.add('hidden');
            uploadState.classList.remove('hidden');
            if (ocrFileInput) ocrFileInput.value = '';
            
            alert(`OCR Import Failed: ${msg}`);
            if (window.showToast) window.showToast(msg, 'error', 'Import Failed');
        };

        // 5. Display Roster Results Visual State
        const displayResults = (entry) => {
            uploadState.classList.add('hidden');
            loadingState.classList.add('hidden');
            resultsState.classList.remove('hidden');

            resultsSectionName.textContent = `${entry.summary.section} Grades`;
            resultsFilename.textContent = `File: ${entry.filename} \u00B7 Processed: ${entry.time}`;

            // Component Tag Styling
            resultsComponentTag.textContent = entry.summary.component || 'CWTS';
            resultsComponentTag.className = 'text-xs px-2.5 py-0.5 rounded-full font-bold';
            if (entry.summary.component === 'ROTC') {
                resultsComponentTag.classList.add('bg-rose-50', 'text-rose-700');
            } else if (entry.summary.component === 'LTS') {
                resultsComponentTag.classList.add('bg-emerald-50', 'text-emerald-700');
            } else {
                resultsComponentTag.classList.add('bg-indigo-50', 'text-indigo-700');
            }

            // Summary Metrics
            metricTotal.textContent = entry.summary.total;
            metricPassed.textContent = entry.summary.passed;
            metricFailed.textContent = entry.summary.failed;
            
            const rate = entry.summary.total > 0 
                ? Math.round((entry.summary.passed / entry.summary.total) * 100) 
                : 0;
            metricPassRate.textContent = `${rate}%`;

            // Cache current list
            currentRoster = entry.results;
            
            // Render Table Rows
            renderRosterRows(currentRoster);
            
            // Clear search field
            if (rosterSearch) rosterSearch.value = '';
        };

        const renderRosterRows = (list) => {
            rosterTableBody.innerHTML = '';
            if (list.length === 0) {
                rosterTableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 text-sm">No matching records found.</td></tr>`;
                return;
            }

            list.forEach((std, i) => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-slate-50 hover:bg-slate-50/50 transition duration-150';

                // Remarks Badge
                let remarksBadge = `<span class="inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-400">N/A</span>`;
                if (std.remarks === 'Passed') {
                    remarksBadge = `<span class="inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Passed</span>`;
                } else if (std.remarks === 'Failed') {
                    remarksBadge = `<span class="inline-flex items-center justify-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700">Failed</span>`;
                }

                // Database Status Badge
                let syncBadge = std.is_new
                    ? `<span class="inline-flex items-center justify-center text-[10px] font-semibold px-2 py-0.5 rounded border border-violet-200 bg-violet-50 text-violet-700">Newly Registered</span>`
                    : `<span class="inline-flex items-center justify-center text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700">Matched in Database</span>`;

                tr.innerHTML = `
                    <td class="py-3 px-4 text-center font-medium text-slate-400">${i + 1}</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">${std.name}</td>
                    <td class="py-3 px-4 font-mono text-xs text-slate-500">${std.student_no || 'Pending'}</td>
                    <td class="py-3 px-4 text-center font-bold text-slate-700">${std.grade !== null ? std.grade : '-'}</td>
                    <td class="py-3 px-4 text-center">${remarksBadge}</td>
                    <td class="py-3 px-4 text-center">${syncBadge}</td>
                `;
                rosterTableBody.appendChild(tr);
            });
        };

        // Search filtering logic
        if (rosterSearch) {
            rosterSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (!query) {
                    renderRosterRows(currentRoster);
                    return;
                }
                const filtered = currentRoster.filter(std => 
                    std.name.toLowerCase().includes(query) || 
                    (std.student_no && std.student_no.toLowerCase().includes(query))
                );
                renderRosterRows(filtered);
            });
        }

        // Export current roster to XLSX using SheetJS
        const exportResultsBtn = document.getElementById('exportResultsBtn');
        if (exportResultsBtn) {
            exportResultsBtn.addEventListener('click', () => {
                if (!currentRoster || currentRoster.length === 0) {
                    if (window.showToast) window.showToast('No student records available for export.', 'warning', 'Export Unavailable');
                    return;
                }

                // Filter down to passed students only
                const passedStudents = currentRoster.filter(std => std.remarks === 'Passed');
                if (passedStudents.length === 0) {
                    if (window.showToast) window.showToast('No passed student records available for export.', 'warning', 'Export Unavailable');
                    return;
                }

                const sectionName = resultsSectionName.textContent.replace(' Grades', '').trim();
                const component = resultsComponentTag.textContent.trim();
                
                const wb = window.XLSX.utils.book_new();
                
                // Add header row
                const rows = [
                    ['#', 'Student Name', 'Student No.', 'Section', 'Program / Component', 'Final Grade', 'Remarks', 'Database Match Status']
                ];
                
                passedStudents.forEach((std, i) => {
                    rows.push([
                        i + 1,
                        std.name,
                        std.student_no || 'Pending',
                        sectionName,
                        component,
                        std.grade !== null ? std.grade : '',
                        std.remarks,
                        std.is_new ? 'Newly Registered' : 'Matched in Database'
                    ]);
                });
                
                const ws = window.XLSX.utils.aoa_to_sheet(rows);
                
                // Column widths
                ws['!cols'] = [
                    { wch: 5 },   // #
                    { wch: 28 },  // Student Name
                    { wch: 15 },  // Student No.
                    { wch: 12 },  // Section
                    { wch: 20 },  // Program
                    { wch: 12 },  // Grade
                    { wch: 12 },  // Remarks
                    { wch: 24 }   // DB Status
                ];
                
                window.XLSX.utils.book_append_sheet(wb, ws, sectionName);
                
                const fileName = `NSTP_Grades_${sectionName}_${Date.now().toString().slice(-6)}.xlsx`;
                window.XLSX.writeFile(wb, fileName);
                
                if (window.showToast) window.showToast('Roster exported successfully.', 'success', 'Export Completed');
            });
        }

        // Close results and return to upload state
        if (closeResultsBtn) {
            closeResultsBtn.addEventListener('click', () => {
                resultsState.classList.add('hidden');
                uploadState.classList.remove('hidden');
                if (ocrFileInput) ocrFileInput.value = '';
            });
        }
    });
</script>
@endpush
