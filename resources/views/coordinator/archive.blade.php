@extends('layouts.coordinator')


@section('title', 'Student Archive - Coordinator Dashboard')



@section('content')

<x-page-header title="Student Archive" subtitle="Centralized repository of all past and present NSTP student records">
    <x-slot name="actions">
        <button class="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm">
            <x-icon name="download" class="w-4 h-4" /> Export CSV
        </button>
    </x-slot>
</x-page-header>

<div class="mt-6 flex flex-wrap items-center gap-3 mb-6">
    <div class="relative flex-1 min-w-[300px]">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><x-icon name="search" class="w-4 h-4" /></span>
        <input type="text" placeholder="Search by name, ID number, or program..." class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-300 transition shadow-sm" />
    </div>
    
    <select class="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:border-indigo-300">
        <option>All Programs</option>
        <option>CWTS</option>
        <option>LTS</option>
        <option>ROTC</option>
    </select>
    
    <select class="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white shadow-sm focus:outline-none focus:border-indigo-300">
        <option>All Statuses</option>
        <option>Completed</option>
        <option>Incomplete</option>
    </select>
</div>

<x-card>
    <x-table>
        <x-slot name="header">
            <th class="py-2 px-3 font-medium">Student ID</th>
            <th class="py-2 px-3 font-medium">Name</th>
            <th class="py-2 px-3 font-medium">Course</th>
            <th class="py-2 px-3 font-medium">Program</th>
            <th class="py-2 px-3 font-medium">Status</th>
            <th class="py-2 px-3 font-medium text-right">Actions</th>
        </x-slot>

        @forelse($students as $s)
        <tr class="border-b border-slate-50 hover:bg-indigo-50/40 cursor-pointer transition">
            <td class="py-3 px-3 text-slate-900 font-medium">{{ $s->id }}</td>
            <td class="py-3 px-3 text-slate-700">{{ $s->name }}</td>
            <td class="py-3 px-3 text-slate-600">{{ $s->course }}</td>
            <td class="py-3 px-3 text-slate-600">{{ $s->program }}</td>
            <td class="py-3 px-3">
                <span class="text-xs px-2 py-0.5 rounded-full {{ $s->status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700' }}">
                    {{ $s->status }}
                </span>
            </td>
            <td class="py-3 px-3 text-right">
                <button class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition">View Details</button>
            </td>
        </tr>
        @empty
        <tr><td colspan="6" class="py-8 text-center text-slate-400 text-sm">No students found.</td></tr>
        @endforelse
    </x-table>
</x-card>

@endsection
