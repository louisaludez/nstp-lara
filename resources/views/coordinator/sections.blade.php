@extends('layouts.coordinator')

@section('title', 'Sections - Coordinator Dashboard')


@section('content')

@if(session('success'))
<div class="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5 shadow-sm">
    <x-icon name="check2" class="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
    <div>
        <div class="font-bold">Success!</div>
        <div>{{ session('success') }}</div>
    </div>
</div>
@endif

@if($errors->any())
<div class="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5 shadow-sm">
    <x-icon name="alertc" class="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
    <div>
        <div class="font-bold">Error submitting form:</div>
        <ul class="list-disc list-inside mt-1 space-y-0.5">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
</div>
@endif

<x-page-header title="Sections Management" subtitle="Manage CWTS, LTS, and ROTC classes and student enrollments">
    <x-slot name="actions">
        <input type="file" id="xlsxImportInput" accept=".xlsx,.xls,.csv" class="hidden" />
        <button id="importXlsxBtn" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition mr-2">
            <x-icon name="upload" class="w-4 h-4" /> Import Master List XLSX File
        </button>
        <button onclick="document.getElementById('newSectionOverlay').classList.remove('hidden')" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
            <x-icon name="plus" class="w-4 h-4" /> New Section
        </button>
    </x-slot>
</x-page-header>

<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 mb-6">
    @foreach($progDefs as $p)
        <button data-program-filter="{{ $p['key'] }}" class="bg-white rounded-2xl p-5 shadow-sm text-left transition-all border border-slate-100 hover:border-slate-300 hover:shadow-md cursor-pointer w-full">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full {{ $p['color'] }} text-white flex items-center justify-center text-base font-bold shrink-0">{{ $p['letter'] }}</div>
                <div>
                    <div class="text-slate-900 font-semibold tracking-tight">{{ $p['label'] }}</div>
                    <div class="text-xs text-slate-500">{{ $p['full'] }}</div>
                </div>
            </div>
            <div class="space-y-3">
                <div>
                    <div class="flex items-center justify-between text-sm mb-1">
                        <span class="text-slate-500">Students</span>
                        <span class="text-slate-700 font-medium">{{ $p['studentCount'] }} / {{ $p['maxStudents'] }}</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-1.5"><div class="{{ $p['bar'] }} h-1.5 rounded-full" style="width: {{ $p['percent'] }}%"></div></div>
                </div>
                <div class="text-xs text-slate-500 flex items-center justify-between">
                    <span>{{ $p['sectionCount'] }} {{ Str::plural('Section', $p['sectionCount']) }}</span>
                    <span>{{ $p['percent'] }}% Capacity</span>
                </div>
            </div>
        </button>
    @endforeach
</div>

<x-card title="All Sections">
    <x-table>
        <x-slot name="header">
            <th class="py-2 px-3 font-medium">Section</th>
            <th class="py-2 px-3 font-medium">Program</th>
            <th class="py-2 px-3 font-medium">School Year</th>
            <th class="py-2 px-3 font-medium">Students</th>
            <th class="py-2 px-3 font-medium">Instructor</th>
            <th class="py-2 px-3 font-medium">Room</th>
            <th class="py-2 px-3 font-medium">Semester</th>
            <th class="py-2 px-3 font-medium text-right">Actions</th>
        </x-slot>

        @forelse($sections as $r)
        <tr class="border-b border-slate-50 hover:bg-indigo-50/40 cursor-pointer transition" data-program="{{ $r->program }}" onclick="window.location.href='{{ route('coordinator.section_students', $r->code) }}'">
            <td class="py-3 px-3 text-slate-900">{{ $r->code }}</td>
            <td class="py-3 px-3">
                <span class="text-xs px-2 py-0.5 rounded-full {{ $r->program === 'CWTS' ? 'bg-indigo-50 text-indigo-700' : ($r->program === 'LTS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700') }}">
                    {{ $r->program }}
                </span>
            </td>
            <td class="py-3 px-3">
                <span class="text-xs px-2 py-0.5 rounded-full {{ $r->schoolYear === '2025-2026' ? 'bg-violet-50 text-violet-700' : 'bg-rose-50 text-rose-700' }}">
                    {{ $r->schoolYear }}
                </span>
            </td>
            <td class="py-3 px-3 text-slate-700">{{ $r->students }}</td>
            <td class="py-3 px-3 text-slate-700">{{ $r->instructor }}</td>
            <td class="py-3 px-3 text-slate-700">{{ $r->room }}</td>
            <td class="py-3 px-3">
                <span class="text-xs px-2 py-0.5 rounded-full {{ str_contains(strtolower($r->semester), '1st') ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700' }}">
                    {{ $r->semester }}
                </span>
            </td>
            <td class="py-3 px-3 text-right" onclick="event.stopPropagation();">
                <button onclick="openEditSectionModal('{{ $r->id }}', '{{ $r->code }}', '{{ $r->program }}', '{{ $r->schoolYear }}', '{{ $r->room }}', '{{ $r->instructor }}', '{{ $r->semester }}')" class="text-slate-400 hover:text-indigo-600 p-1 transition cursor-pointer" title="Edit Section"><x-icon name="pencil" class="w-4 h-4" /></button>
                <form action="{{ route('coordinator.sections.delete', $r->id) }}" method="POST" class="inline-block" onsubmit="return confirm('Are you sure you want to delete section {{ $r->code }}? This will permanently delete the section.')">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer" title="Delete Section"><x-icon name="trash" class="w-4 h-4" /></button>
                </form>
            </td>
        </tr>
        @empty
        <tr><td colspan="8" class="py-8 text-center text-slate-400 text-sm">No sections found.</td></tr>
        @endforelse
    </x-table>
    @if($sections->hasPages())
        <div class="mt-4 px-4 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
            {{ $sections->links() }}
        </div>
    @endif
</x-card>

<!-- New Section Modal -->
<div id="newSectionOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm hidden">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg mx-4">
        <form id="newSectionForm" onsubmit="event.preventDefault();">
            @csrf
            <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <div class="text-slate-900 font-bold tracking-tight text-lg">New Section</div>
                    <div class="text-xs text-slate-500 mt-0.5">Fill in the details to add a new section</div>
                </div>
                <button type="button" id="sectionFormClose" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer" onclick="document.getElementById('newSectionOverlay').classList.add('hidden')">
                    <x-icon name="close" class="w-4 h-4" />
                </button>
            </div>
            <div class="p-6 space-y-5 text-sm">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Section Code <span class="text-rose-500">*</span></div>
                        <input name="code" id="newSecCode" placeholder="e.g. CWTS-1A" required class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">NSTP Component <span class="text-rose-500">*</span></div>
                        <select name="program" id="newSecProgram" class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition">
                            <option value="CWTS">CWTS — Civic Welfare</option>
                            <option value="LTS">LTS — Literacy Training</option>
                            <option value="ROTC">ROTC — Reserve Officers</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">School Year</div>
                        <input name="school_year" id="newSecSchoolYear" placeholder="e.g. 2025-2026" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Semester</div>
                        <input name="semester" id="newSecSemester" placeholder="e.g. 1st Semester" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Room</div>
                        <input name="room" id="newSecRoom" placeholder="e.g. B-210" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                </div>

                <div class="border-t border-slate-100 pt-4 space-y-4">
                    <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Compare list with Master List (XLSX only)</div>
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <span>Class List XLSX</span>
                            <span class="text-rose-500">*</span>
                        </div>
                        <label class="block border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition cursor-pointer">
                            <x-icon name="upload" class="w-5 h-5 text-slate-400 mx-auto" />
                            <span id="classFileLabel" class="text-xs text-slate-550 mt-1 block truncate">Upload Class List</span>
                            <input type="file" id="newSecClassFile" accept=".xlsx" class="hidden" />
                        </label>
                    </div>
                    <div id="compareResultContainer" class="hidden text-xs p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800">
                        <div class="font-bold flex items-center justify-between">
                            <span>Comparison Results:</span>
                            <span id="compareCountLabel" class="text-indigo-900 font-extrabold">0 matched</span>
                        </div>
                        <div class="mt-1 text-indigo-750 leading-snug">
                            Matched against the globally imported Master List. Non-matching and anonymous names have been filtered out.
                        </div>
                    </div>
                </div>
            </div>
            <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
                <button type="button" id="sectionFormCancel" class="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer" onclick="document.getElementById('newSectionOverlay').classList.add('hidden')">Cancel</button>
                <button type="button" id="sectionFormCreate" class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer">
                    <x-icon name="users" class="w-4 h-4" /> Create Section
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Section Modal -->
<div id="editSectionOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm hidden">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg mx-4">
        <form id="editSectionForm" method="POST" action="">
            @csrf
            @method('PUT')
            <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <div class="text-slate-900 font-bold tracking-tight text-lg">Edit Section</div>
                    <div class="text-xs text-slate-500 mt-0.5">Modify section configurations</div>
                </div>
                <button type="button" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer" onclick="document.getElementById('editSectionOverlay').classList.add('hidden')">
                    <x-icon name="close" class="w-4 h-4" />
                </button>
            </div>
            <div class="p-6 space-y-5 text-sm">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Section Code <span class="text-rose-500">*</span></div>
                        <input type="text" name="code" id="editSecCode" required class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">NSTP Component <span class="text-rose-500">*</span></div>
                        <select name="program" id="editSecProgram" required class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition">
                            <option value="CWTS">CWTS — Civic Welfare</option>
                            <option value="LTS">LTS — Literacy Training</option>
                            <option value="ROTC">ROTC — Reserve Officers</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">School Year</div>
                        <input type="text" name="school_year" id="editSecSchoolYear" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Semester</div>
                        <input type="text" name="semester" id="editSecSemester" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                    <div>
                        <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Room</div>
                        <input type="text" name="room" id="editSecRoom" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition" />
                    </div>
                </div>
                <div>
                    <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Assign Instructor</div>
                    <select name="instructor_name" id="editSecInstructor" class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition">
                        <option value="">— Select an instructor (optional) —</option>
                        @foreach($instructors ?? [] as $inst)
                            <option value="{{ $inst->name }}">{{ $inst->name }}{{ isset($inst->dept) && $inst->dept ? ' · ' . $inst->dept : '' }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
            <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
                <button type="button" class="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer" onclick="document.getElementById('editSectionOverlay').classList.add('hidden')">Cancel</button>
                <button type="submit" class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer">
                    <x-icon name="check2" class="w-4 h-4" /> Save Changes
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Import Result Modal -->
<div id="importResultModal"
     class="fixed inset-0 z-[100] hidden items-center justify-center bg-slate-900/50 backdrop-blur-sm">

    <div class="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden">

        <div class="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <x-icon name="check2" class="w-5 h-5 text-emerald-600" />
            </div>

            <div>
                <h3 class="text-lg font-bold text-slate-900">
                    Import Successful
                </h3>
                <p class="text-xs text-slate-500">
                    Master list processing completed.
                </p>
            </div>
        </div>

        <div class="p-6">

            <p id="importResultMessage"
               class="text-sm text-slate-600 mb-5">
                Master list imported successfully.
            </p>

            <div class="grid grid-cols-3 gap-3">

                <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <div id="createdStudentsCount"
                         class="text-2xl font-bold text-emerald-700">
                        0
                    </div>

                    <div class="text-xs text-emerald-600 mt-1">
                        Created
                    </div>
                </div>

                <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                    <div id="updatedStudentsCount"
                         class="text-2xl font-bold text-blue-700">
                        0
                    </div>

                    <div class="text-xs text-blue-600 mt-1">
                        Updated
                    </div>
                </div>

                <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                    <div id="skippedStudentsCount"
                         class="text-2xl font-bold text-amber-700">
                        0
                    </div>

                    <div class="text-xs text-amber-600 mt-1">
                        Skipped
                    </div>
                </div>

            </div>

        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">

            <button type="button"
                    id="closeImportResultModal"
                    class="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition">
                Done
            </button>

        </div>

    </div>
</div>

@push('scripts')
    @vite(['resources/js/app.js'])
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Wait slightly for Vite to load app.js if it's deferred
            setTimeout(() => {
                if (window.attachEvents) {
                    window.attachEvents();
                }
            }, 100);

            // Program filtering logic
            const buttons = document.querySelectorAll('[data-program-filter]');
            const rows = document.querySelectorAll('tbody tr[data-program]');
            let activeFilter = null;

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const program = btn.getAttribute('data-program-filter');

                    if (activeFilter === program) {
                        activeFilter = null;
                        // Reset button highlights
                        buttons.forEach(b => {
                            b.classList.remove('ring-2', 'ring-indigo-500', 'border-indigo-300');
                        });
                        // Show all rows
                        rows.forEach(r => r.classList.remove('hidden'));
                    } else {
                        activeFilter = program;
                        // Toggle active highlight class
                        buttons.forEach(b => {
                            if (b.getAttribute('data-program-filter') === program) {
                                b.classList.add('ring-2', 'ring-indigo-500', 'border-indigo-300');
                            } else {
                                b.classList.remove('ring-2', 'ring-indigo-500', 'border-indigo-300');
                            }
                        });
                        // Filter rows
                        rows.forEach(r => {
                            if (r.getAttribute('data-program') === program) {
                                r.classList.remove('hidden');
                            } else {
                                r.classList.add('hidden');
                            }
                        });
                    }
                });
            });
        });

        // Edit Section Modal function
        window.openEditSectionModal = function(id, code, program, schoolYear, room, instructor, semester) {
            const form = document.getElementById('editSectionForm');
            form.action = "{{ route('coordinator.sections.update', ':id') }}".replace(':id', id);

            document.getElementById('editSecCode').value = code;
            document.getElementById('editSecProgram').value = program;
            document.getElementById('editSecSchoolYear').value = schoolYear;
            document.getElementById('editSecRoom').value = room;
            document.getElementById('editSecSemester').value = semester || '1st Semester';

            // Match instructor in dropdown
            const instructorSelect = document.getElementById('editSecInstructor');
            instructorSelect.value = ""; // default
            for (let i = 0; i < instructorSelect.options.length; i++) {
                if (instructorSelect.options[i].value === instructor) {
                    instructorSelect.selectedIndex = i;
                    break;
                }
            }

            document.getElementById('editSectionOverlay').classList.remove('hidden');
        };

        // XLSX File Comparison Logic inside Add New Section Modal
        (function() {
            const classInput = document.getElementById('newSecClassFile');
            const classLabel = document.getElementById('classFileLabel');

            let classStudents = null;

            function normalizeName(name) {
                if (!name) return '';
                return name.toString().toLowerCase().replace(/[^a-z0-9]/g, '').trim();
            }

            function parseExcel(file, callback) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, {type: 'array'});
                        const sheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});

                        let nameIdx = -1;
                        let lastNameIdx = -1;
                        let firstNameIdx = -1;
                        let middleNameIdx = -1;
                        let idIdx = -1;
                        let dobIdx = -1;
                        let pobIdx = -1;
                        let genderIdx = -1;
                        let addressIdx = -1;
                        let cellIdx = -1;
                        let emailIdx = -1;
                        let programIdx = -1;

                        // Detect column indices from the first row (headers)
                        const headerRow = rows[0] || [];
                        headerRow.forEach((cell, c) => {
                            if (!cell) return;
                            const val = cell.toString().toLowerCase().trim();
                            if (val === 'last name' || val === 'lastname' || val === 'last') {
                                lastNameIdx = c;
                            } else if (val === 'first name' || val === 'firstname' || val === 'first') {
                                firstNameIdx = c;
                            } else if (val === 'middle name' || val === 'middlename' || val === 'middle') {
                                middleNameIdx = c;
                            } else if (val.includes('name') || val.includes('student') || val.includes('full')) {
                                nameIdx = c;
                            }

                            if (val.includes('no') || val.includes('id') || val.includes('number') || val.includes('code')) {
                                idIdx = c;
                            }
                            if (val === 'dob' || val.includes('birthday') || (val.includes('birth') && !val.includes('place') && !val.includes('pob'))) {
                                dobIdx = c;
                            }
                            if (val === 'pob' || val.includes('place of birth') || val.includes('birthplace') || val.includes('pob')) {
                                pobIdx = c;
                            }
                            if (val === 'gender' || val === 'sex') {
                                genderIdx = c;
                            }
                            if (val.includes('address')) {
                                addressIdx = c;
                            }
                            if (val.includes('cell') || val.includes('phone') || val.includes('contact') || val.includes('mobile')) {
                                cellIdx = c;
                            }
                            if (val.includes('email') || val.includes('gmail')) {
                                emailIdx = c;
                            }
                            if (val.includes('program') || val.includes('course') || val.includes('class')) {
                                programIdx = c;
                            }
                        });

                        // Fallback detection if headers did not match exactly
                        if (nameIdx === -1 && lastNameIdx === -1) {
                            for (let r = 0; r < Math.min(rows.length, 5); r++) {
                                const row = rows[r];
                                if (!row) continue;
                                for (let c = 0; c < row.length; c++) {
                                    const val = (row[c] || '').toString().toLowerCase().trim();
                                    if (val.includes('last')) lastNameIdx = c;
                                    if (val.includes('first')) firstNameIdx = c;
                                    if (val.includes('middle')) middleNameIdx = c;
                                    if (val.includes('name') && nameIdx === -1) nameIdx = c;
                                    if ((val.includes('no') || val.includes('id') || val.includes('num')) && idIdx === -1) idIdx = c;
                                }
                            }
                        }

                        if (nameIdx === -1 && lastNameIdx === -1) nameIdx = 1; // absolute fallback
                        if (idIdx === -1) idIdx = 0;     // absolute fallback

                        const list = [];
                        rows.forEach((row, index) => {
                            if (index === 0) return; // skip header
                            if (!row) return;

                            let nameStr = '';
                            if (lastNameIdx !== -1 || firstNameIdx !== -1) {
                                const last = (row[lastNameIdx] || '').toString().trim();
                                const first = (row[firstNameIdx] || '').toString().trim();
                                const middle = middleNameIdx !== -1 ? (row[middleNameIdx] || '').toString().trim() : '';

                                if (last || first) {
                                    nameStr = last + ', ' + first;
                                    if (middle) {
                                        if (middle.length === 1) {
                                            nameStr += ' ' + middle + '.';
                                        } else {
                                            nameStr += ' ' + middle;
                                        }
                                    }
                                }
                            } else if (nameIdx !== -1) {
                                nameStr = (row[nameIdx] || '').toString().trim();
                            }

                            const idStr = (row[idIdx] || '').toString().trim();

                            if (!nameStr) return;

                            const normalized = nameStr.toLowerCase();
                            if (normalized === 'name' || normalized === 'student name' || normalized === 'full name' || normalized === 'last name') return;
                            if (normalized.includes('anonymous') || normalized.includes('unknown') || normalized.includes('tba') || normalized.includes('vacant')) return;

                            const dobVal = dobIdx !== -1 ? (row[dobIdx] || '').toString().trim() : '';
                            const pobVal = pobIdx !== -1 ? (row[pobIdx] || '').toString().trim() : '';
                            const genderVal = genderIdx !== -1 ? (row[genderIdx] || '').toString().trim() : 'Female';
                            const addressVal = addressIdx !== -1 ? (row[addressIdx] || '').toString().trim() : '';
                            const cellVal = cellIdx !== -1 ? (row[cellIdx] || '').toString().trim() : '';
                            const emailVal = emailIdx !== -1 ? (row[emailIdx] || '').toString().trim() : '';
                            const programVal = programIdx !== -1 ? (row[programIdx] || '').toString().trim() : '';

                            list.push({
                                name: nameStr,
                                studentNo: idStr || ('2024-' + Math.floor(10000 + Math.random() * 90000)),
                                gender: genderVal,
                                dob: dobVal,
                                birthPlace: pobVal,
                                address: addressVal,
                                cellNo: cellVal,
                                email: emailVal,
                                program: programVal
                            });
                        });

                        callback(list);
                    } catch (err) {
                        console.error(err);
                        alert('Error parsing Excel file. Please upload a valid Class List XLSX file.');
                    }
                };
                reader.readAsArrayBuffer(file);
            }

            function runComparison() {
                if (!classStudents) return;

                // Show loading state
                const container = document.getElementById('compareResultContainer');
                const label = document.getElementById('compareCountLabel');
                if (container && label) {
                    container.classList.remove('hidden');
                    label.textContent = "Matching with Master List...";
                }

                // Generate a unique token for this comparison session
                const uploadToken = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                // Call backend database comparison endpoint
                fetch('/api/sections/compare-class-list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        token: uploadToken,
                        students: classStudents
                    })
                })
                .then(response => response.json())
                .then(res => {
                    if (res.success) {
                        window.modalImportedStudents = res.matched;
                        window.modalUploadToken = uploadToken;

                        if (label) {
                            label.textContent = `${res.matched.length} matched student(s)`;
                        }
                    } else {
                        console.error("Database comparison failed:", res.message);
                        if (label) label.textContent = "Failed to compare with Master List";
                    }
                })
                .catch(err => {
                    console.error("Error connecting to database comparison endpoint:", err);
                    if (label) label.textContent = "Connection to XAMPP database failed";
                });
            }

            if (classInput) {
                classInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    classLabel.textContent = file.name;
                    parseExcel(file, (list) => {
                        classStudents = list;
                        runComparison();
                    });
                });
            }
        })();
    </script>
@endpush

@endsection
