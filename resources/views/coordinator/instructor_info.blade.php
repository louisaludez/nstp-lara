@extends('layouts.coordinator')

@section('title', 'Instructor Profile - DNSC NSTP Portal')

@section('content')

<x-page-header title="Instructor Profile: {{ $instructor->name }}" subtitle="Detailed review of instructor assignments, handled sections, and active student enrollments">
    <x-slot name="actions">
        <a href="{{ route('coordinator.instructors') }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-sm font-semibold">
            <x-icon name="chevron" class="w-4 h-4 rotate-90" /> Back to Instructors
        </a>
    </x-slot>
</x-page-header>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
    <!-- Left Column: Instructor Profile Information Card -->
    <div class="lg:col-span-1">
        <x-card title="Personnel Details">
            <div class="p-5 space-y-6">
                <!-- Avatar / Visual Header -->
                <div class="flex flex-col items-center text-center">
                    <div class="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
                        <x-icon name="users" class="w-10 h-10" />
                    </div>
                    <h3 class="text-slate-900 font-bold text-lg tracking-tight">{{ $instructor->name }}</h3>
                    <span class="text-xs px-2.5 py-1 mt-1 rounded-full font-semibold {{ $instructor->role === 'rotc' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100' }}">
                        {{ $instructor->role === 'rotc' ? 'ROTC Officer' : 'CWTS/LTS Instructor' }}
                    </span>
                </div>

                <div class="border-t border-slate-100 pt-5 space-y-4 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500 font-medium uppercase tracking-wider">Email Address</span>
                        <span class="text-slate-800 font-semibold select-all">{{ $instructor->email }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500 font-medium uppercase tracking-wider">Department</span>
                        <span class="text-xs px-2 py-0.5 rounded-full {{ $instructor->dept === 'CWTS' ? 'bg-indigo-50 text-indigo-700' : ($instructor->dept === 'LTS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700') }}">
                            {{ $instructor->dept }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500 font-medium uppercase tracking-wider">Phone Contact</span>
                        <span class="text-slate-800 font-semibold">{{ $instructor->contact ?? 'N/A' }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500 font-medium uppercase tracking-wider">Status</span>
                        <span class="text-xs px-2 py-0.5 rounded-full {{ $instructor->status === 'Active' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-600 font-bold' }}">
                            {{ $instructor->status }}
                        </span>
                    </div>
                </div>
            </div>
        </x-card>
    </div>

    <!-- Right Column: Handled Sections and Students -->
    <div class="lg:col-span-2 space-y-6">
        <!-- Card 1: Handled Sections -->
        <x-card title="Handled Class Sections">
            <x-table>
                <x-slot name="header">
                    <th class="py-2 px-3 font-medium">Section Name</th>
                    <th class="py-2 px-3 font-medium">Component</th>
                    <th class="py-2 px-3 font-medium">School Year</th>
                    <th class="py-2 px-3 font-medium">Room</th>
                </x-slot>

                @forelse($sections as $sec)
                <tr class="border-b border-slate-50 hover:bg-indigo-50/40 cursor-pointer transition" onclick="window.location.href='{{ route('coordinator.section_students', $sec->section_name) }}'">
                    <td class="py-3 px-3 text-slate-900 font-semibold">{{ $sec->section_name }}</td>
                    <td class="py-3 px-3 text-slate-600">
                        <span class="text-xs px-2 py-0.5 rounded-full {{ $sec->component === 'CWTS' ? 'bg-indigo-50 text-indigo-700' : ($sec->component === 'LTS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700') }}">
                            {{ $sec->component }}
                        </span>
                    </td>
                    <td class="py-3 px-3 text-slate-600">{{ $sec->school_year }}</td>
                    <td class="py-3 px-3 text-slate-600">{{ $sec->room }}</td>
                </tr>
                @empty
                <tr><td colspan="4" class="py-8 text-center text-slate-400 text-sm">No sections assigned to this instructor.</td></tr>
                @endforelse
            </x-table>
            @if($sections->hasPages())
                <div class="mt-4 px-4 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                    {{ $sections->appends(request()->except('sections_page'))->links() }}
                </div>
            @endif
        </x-card>

        <!-- Card 2: Handled Students -->
        <x-card title="Handled Students ({{ $students->total() }})">
            <x-table>
                <x-slot name="header">
                    <th class="py-2 px-3 font-medium">Student ID</th>
                    <th class="py-2 px-3 font-medium">Name</th>
                    <th class="py-2 px-3 font-medium">Course</th>
                    <th class="py-2 px-3 font-medium">Section</th>
                    <th class="py-2 px-3 font-medium">Status</th>
                </x-slot>

                @forelse($students as $s)
                <tr class="border-b border-slate-50 hover:bg-indigo-50/40 transition">
                    <td class="py-3 px-3 text-slate-900 font-semibold">{{ $s->id }}</td>
                    <td class="py-3 px-3 text-slate-700 font-medium">{{ $s->name }}</td>
                    <td class="py-3 px-3 text-slate-600">{{ $s->course }}</td>
                    <td class="py-3 px-3 text-indigo-600 font-semibold">
                        <span class="bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition cursor-pointer" onclick="window.location.href='{{ route('coordinator.section_students', $s->section) }}'">
                            {{ $s->section }}
                        </span>
                    </td>
                    <td class="py-3 px-3">
                        <span class="text-xs px-2 py-0.5 rounded-full {{ in_array($s->status, ['Passed', 'Completed']) ? 'bg-emerald-50 text-emerald-700' : ($s->status === 'Failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700') }}">
                            {{ $s->status }}
                        </span>
                    </td>
                </tr>
                @empty
                <tr><td colspan="5" class="py-8 text-center text-slate-400 text-sm">No students currently handled.</td></tr>
                @endforelse
            </x-table>
            @if($students->hasPages())
                <div class="mt-4 px-4 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                    {{ $students->appends(request()->except('students_page'))->links() }}
                </div>
            @endif
        </x-card>
    </div>
</div>

@endsection
