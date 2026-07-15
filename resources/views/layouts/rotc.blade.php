@extends('layouts.shell', [
    'themeBg' => 'bg-slate-900',
    'themeBdr' => 'border-slate-800',
    'themeMilitary' => true,
    'brand' => 'DNSC ROTC',
    'brandSub' => 'Officer Portal',
    'userName' => auth()->user() ? auth()->user()->name : '1Lt. Officer',
    'userRole' => 'ROTC Commander',
    'userInitials' => auth()->user() ? strtoupper(substr(auth()->user()->name, 0, 2)) : 'RO',
    'greeting' => $greeting ?? 'ROTC Command',
    'context' => 'NSTP Management System'
])

@section('nav')
@php
    $designsCount = \App\Models\ActivityPlan::whereHas('section', fn($q) => $q->where('component', 'ROTC'))
        ->whereIn('status', ['Draft', 'Pending', 'Revision', 'Rejected', 'draft', 'pending', 'revision', 'rejected'])
        ->count();
    $reportsCount = \App\Models\AccomplishmentReport::whereHas('section', fn($q) => $q->where('component', 'ROTC'))
        ->whereIn('status', ['Draft', 'Pending', 'Revision', 'draft', 'pending', 'revision'])
        ->count();
@endphp
{{-- Command Center --}}
<div class="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Command Center</div>
<a href="{{ route('rotc.dashboard') }}"
   class="w-full group flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition
   {{ request()->routeIs('rotc.dashboard') ? 'bg-amber-300 text-slate-900 border-amber-300' : 'text-slate-300 border-transparent hover:bg-slate-800 hover:text-white' }}">
    <x-icon name="grid" class="w-[18px] h-[18px] {{ request()->routeIs('rotc.dashboard') ? 'text-slate-900' : 'text-slate-400 group-hover:text-white' }}" />
    <span class="flex-1 text-sm">Overview</span>
</a>

{{-- Management --}}
<div class="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Management</div>
<a href="{{ route('rotc.platoons') }}"
   class="w-full group flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition
   {{ request()->routeIs('rotc.platoons') ? 'bg-amber-300 text-slate-900 border-amber-300' : 'text-slate-300 border-transparent hover:bg-slate-800 hover:text-white' }}">
    <x-icon name="shield" class="w-[18px] h-[18px] {{ request()->routeIs('rotc.platoons') ? 'text-slate-900' : 'text-slate-400 group-hover:text-white' }}" />
    <span class="flex-1 text-sm">Platoon Management</span>
</a>
<a href="{{ route('rotc.rosters') }}"
   class="w-full group flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition
   {{ request()->routeIs('rotc.rosters') ? 'bg-amber-300 text-slate-900 border-amber-300' : 'text-slate-300 border-transparent hover:bg-slate-800 hover:text-white' }}">
    <x-icon name="users" class="w-[18px] h-[18px] {{ request()->routeIs('rotc.rosters') ? 'text-slate-900' : 'text-slate-400 group-hover:text-white' }}" />
    <span class="flex-1 text-sm">Assign Officer Section</span>
</a>

{{-- Planning & Reports --}}
<div class="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Planning & Reports</div>
<a href="{{ route('rotc.designs') }}"
   class="w-full group flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition
   {{ request()->routeIs('rotc.designs') ? 'bg-amber-300 text-slate-900 border-amber-300' : 'text-slate-300 border-transparent hover:bg-slate-800 hover:text-white' }}">
    <x-icon name="clipboard" class="w-[18px] h-[18px] {{ request()->routeIs('rotc.designs') ? 'text-slate-900' : 'text-slate-400 group-hover:text-white' }}" />
    <span class="flex-1 text-sm">Activity Designs</span>
    <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded border {{ request()->routeIs('rotc.designs') ? 'border-slate-900/20 bg-slate-900/10 text-slate-900' : 'border-slate-700 bg-slate-800 text-slate-400' }}">{{ $designsCount }}</span>
</a>
<a href="{{ route('rotc.reports') }}"
   class="w-full group flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition
   {{ request()->routeIs('rotc.reports') ? 'bg-amber-300 text-slate-900 border-amber-300' : 'text-slate-300 border-transparent hover:bg-slate-800 hover:text-white' }}">
    <x-icon name="filetext" class="w-[18px] h-[18px] {{ request()->routeIs('rotc.reports') ? 'text-slate-900' : 'text-slate-400 group-hover:text-white' }}" />
    <span class="flex-1 text-sm">Report Submission</span>
    <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded border {{ request()->routeIs('rotc.reports') ? 'border-slate-900/20 bg-slate-900/10 text-slate-900' : 'border-slate-700 bg-slate-800 text-slate-400' }}">{{ $reportsCount }}</span>
</a>
<a href="{{ route('rotc.calendar') }}"
   class="w-full group flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition
   {{ request()->routeIs('rotc.calendar') ? 'bg-amber-300 text-slate-900 border-amber-300' : 'text-slate-300 border-transparent hover:bg-slate-800 hover:text-white' }}">
    <x-icon name="calendar" class="w-[18px] h-[18px] {{ request()->routeIs('rotc.calendar') ? 'text-slate-900' : 'text-slate-400 group-hover:text-white' }}" />
    <span class="flex-1 text-sm">Training Calendar</span>
</a>
@endsection
