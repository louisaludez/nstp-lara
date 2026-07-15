@extends('layouts.coordinator')

@section('title', 'Calendar - Coordinator Dashboard')

@section('content')

<x-page-header title="Program Calendar" subtitle="Manage university-wide NSTP events and deadlines">
    <x-slot name="actions">
        <button onclick="openCreateEventModal()" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm cursor-pointer">
            <x-icon name="plus" class="w-4 h-4" /> New Event
        </button>
    </x-slot>
</x-page-header>

@if(session('success'))
<div class="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5 shadow-sm transition animate-fade-in">
    <x-icon name="check2" class="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
    <div>
        <div class="font-bold">Success!</div>
        <div>{{ session('success') }}</div>
    </div>
</div>
@endif

@if($errors->any())
<div class="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5 shadow-sm">
    <x-icon name="alertc" class="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
    <div>
        <div class="font-bold">Validation Errors:</div>
        <ul class="list-disc list-inside mt-1 space-y-0.5">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
</div>
@endif

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
    <div class="lg:col-span-2">
        <x-card class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-slate-800">{{ $selectedMonth->format('F Y') }}</h3>
                <div class="flex items-center gap-2">
                    <a href="{{ route('coordinator.calendar', ['month' => $prevMonth->month, 'year' => $prevMonth->year]) }}" class="p-2 rounded hover:bg-slate-50 text-slate-400 inline-block shrink-0" title="Previous Month">
                        <x-icon name="chevron" class="w-4 h-4 rotate-90" />
                    </a>
                    <a href="{{ route('coordinator.calendar', ['month' => $nextMonth->month, 'year' => $nextMonth->year]) }}" class="p-2 rounded hover:bg-slate-50 text-slate-400 inline-block shrink-0" title="Next Month">
                        <x-icon name="chevron" class="w-4 h-4 -rotate-90" />
                    </a>
                </div>
            </div>
            
            <div class="grid grid-cols-7 gap-3 mb-2">
                @foreach(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as $dayOfWeekName)
                <div class="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ $dayOfWeekName }}</div>
                @endforeach
            </div>
            
            <div class="grid grid-cols-7 gap-3">
                @for($i = 0; $i < $selectedMonth->copy()->startOfMonth()->dayOfWeek; $i++)
                    <div class="border border-transparent p-3 min-h-[100px]"></div>
                @endfor
                @for($d = 1; $d <= $selectedMonth->daysInMonth; $d++)
                    @php
                        $dayActivities = $activities->filter(function($act) use ($d) {
                            return $act->activity_date->day == $d;
                        });
                        $isToday = ($d == now()->day && $selectedMonth->isCurrentMonth());
                    @endphp
                    <div class="border {{ $isToday ? 'border-indigo-400 ring-2 ring-indigo-50/50 bg-indigo-50/10' : 'border-slate-200' }} rounded-xl p-3 min-h-[100px] bg-white hover:border-indigo-300 hover:shadow-sm transition duration-205 cursor-pointer">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-bold {{ $isToday ? 'text-indigo-600 bg-indigo-100/70 w-6 h-6 rounded-full flex items-center justify-center -mt-1 -ml-1 text-xs shrink-0 font-extrabold' : 'text-slate-750' }}">{{ $d }}</span>
                        </div>
                        @foreach($dayActivities as $act)
                            @php
                                $colorClass = match($act->component) {
                                    'CWTS' => 'bg-indigo-600 text-white border-l-2 border-indigo-700',
                                    'LTS' => 'bg-emerald-600 text-white border-l-2 border-emerald-700',
                                    'ROTC' => 'bg-rose-500 text-white border-l-2 border-rose-600',
                                    default => 'bg-indigo-600 text-white'
                                };
                            @endphp
                            <div class="mt-1 text-[10px] px-2 py-1 rounded truncate {{ $colorClass }} font-semibold tracking-tight shadow-sm" title="{{ $act->title }} ({{ $act->component }})">{{ $act->title }}</div>
                        @endforeach
                    </div>
                @endfor
            </div>
        </x-card>
    </div>
    
    <div class="lg:col-span-1 flex flex-col gap-5">
        <x-card title="Upcoming Events">
            <ul class="divide-y divide-slate-100">
                @forelse($upcomingActivities as $act)
                <li class="p-4 hover:bg-slate-50 transition cursor-pointer">
                    <div class="text-sm font-bold text-slate-800">{{ $act->title }}</div>
                    <div class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <x-icon name="calendar" class="w-3.5 h-3.5 text-slate-400" /> {{ $act->activity_date?->format('F d, Y') }}
                    </div>
                </li>
                @empty
                <li class="p-4 text-center text-sm text-slate-400">No upcoming events.</li>
                @endforelse
            </ul>
        </x-card>
    </div>
</div>

<!-- Create Event Modal -->
<div id="eventOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm hidden transition duration-300">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg mx-4 overflow-hidden transform scale-95 duration-300">
        <form action="{{ route('coordinator.calendar.store') }}" method="POST">
            @csrf
            <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <div>
                    <div class="font-extrabold tracking-tight text-lg">Create Calendar Event</div>
                    <div class="text-xs text-white/80 mt-0.5">Publish an activity directly to the program calendar</div>
                </div>
                <button type="button" class="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer" onclick="closeCreateEventModal()">
                    <x-icon name="close" class="w-5 h-5" />
                </button>
            </div>
            
            <div class="p-6 space-y-4 text-sm max-h-[70vh] overflow-y-auto">
                <div>
                    <label class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">Activity Title <span class="text-rose-500">*</span></label>
                    <input type="text" name="title" required placeholder="e.g. Nationwide Earthquake Drill / CWTS Seminar" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">Program Component <span class="text-rose-500">*</span></label>
                        <select name="component" required class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition">
                            <option value="" disabled selected>Select Component</option>
                            <option value="CWTS">CWTS</option>
                            <option value="LTS">LTS</option>
                            <option value="ROTC">ROTC</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">Scheduled Date <span class="text-rose-500">*</span></label>
                        <input type="date" name="activity_date" required class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">Scheduled Time <span class="text-rose-500">*</span></label>
                        <input type="time" name="activity_time" required value="08:00" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition" />
                    </div>
                    <div>
                        <label class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">Venue / Location <span class="text-rose-500">*</span></label>
                        <input type="text" name="location" required placeholder="e.g. University Gymnasium" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition" />
                    </div>
                </div>

                <div>
                    <label class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 block">Description / Objectives</label>
                    <textarea name="description" rows="3" placeholder="Provide any details, objectives, or instructions..." class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 transition"></textarea>
                </div>
            </div>

            <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 rounded-b-2xl">
                <button type="button" class="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer" onclick="closeCreateEventModal()">Cancel</button>
                <button type="submit" class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition cursor-pointer">
                    <x-icon name="check2" class="w-4 h-4" /> Save Event
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
    window.openCreateEventModal = function() {
        document.getElementById('eventOverlay').classList.remove('hidden');
    }
    window.closeCreateEventModal = function() {
        document.getElementById('eventOverlay').classList.add('hidden');
    }
</script>
@endpush

@endsection
