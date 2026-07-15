@extends('layouts.instructor')


@section('title', 'Announcements - Instructor Console')


@section('content')

<x-page-header title="Announcements" subtitle="Official updates from the NSTP & Dean's offices">
    <x-slot name="actions">
        <div class="relative">
            <x-icon name="search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input placeholder="Search announcements..." class="pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-slate-200 w-64 shadow-sm focus:outline-none focus:border-indigo-300" />
        </div>
    </x-slot>
</x-page-header>

<x-card class="mt-6">
    <ul class="space-y-5 p-6">
        @forelse($announcements as $a)
        <li class="flex gap-4">
            <div class="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br {{ $a->color }} flex items-center justify-center text-white text-xs tracking-tight shadow-sm">{{ $a->initials }}</div>
            <div class="flex-1 min-w-0 pb-5 border-b border-slate-50 last:border-0 last:pb-0">
                <div class="flex items-center gap-2 text-xs text-slate-500">
                    <span class="text-slate-700 font-semibold">{{ $a->author }}</span>
                    <span class="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
                    <span>{{ $a->time }}</span>
                    @if(isset($a->pinned) && $a->pinned)
                        <span class="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <x-icon name="pin" class="w-3 h-3" /> Pinned
                        </span>
                    @endif
                </div>
                <div class="text-base font-bold text-slate-900 mt-1">{{ $a->title }}</div>
                <p class="text-sm text-slate-600 mt-2 leading-relaxed">{{ $a->body }}</p>
            </div>
        </li>
        @empty
        <li class="py-8 text-center text-slate-400 text-sm">No announcements at this time.</li>
        @endforelse
    </ul>
</x-card>

@endsection
