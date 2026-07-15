@extends('layouts.rotc')

@section('title', 'Calendar - ROTC Command')

@section('content')

<x-page-header title="Training Calendar" subtitle="Schedule of field exercises and ROTC formations">
</x-page-header>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
    <div class="lg:col-span-2">
        <x-card class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-slate-800">{{ $selectedMonth->format('F Y') }}</h3>
                <div class="flex items-center gap-2">
                    <a href="{{ route('rotc.calendar', ['month' => $prevMonth->month, 'year' => $prevMonth->year]) }}" class="p-2 rounded hover:bg-slate-50 text-slate-400 inline-block shrink-0" title="Previous Month">
                        <x-icon name="chevron" class="w-4 h-4 rotate-90" />
                    </a>
                    <a href="{{ route('rotc.calendar', ['month' => $nextMonth->month, 'year' => $nextMonth->year]) }}" class="p-2 rounded hover:bg-slate-50 text-slate-400 inline-block shrink-0" title="Next Month">
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
                    <div class="border {{ $isToday ? 'border-emerald-400 ring-2 ring-emerald-50/50 bg-emerald-50/10' : 'border-slate-200' }} rounded-xl p-3 min-h-[100px] bg-white hover:border-emerald-300 hover:shadow-sm transition duration-205 cursor-pointer">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-bold {{ $isToday ? 'text-emerald-600 bg-emerald-100/70 w-6 h-6 rounded-full flex items-center justify-center -mt-1 -ml-1 text-xs shrink-0 font-extrabold' : 'text-slate-750' }}">{{ $d }}</span>
                        </div>
                        @foreach($dayActivities as $act)
                            @php
                                $colorClass = match($act->component) {
                                    'CWTS' => 'bg-indigo-600 text-white border-l-2 border-indigo-700',
                                    'LTS' => 'bg-emerald-600 text-white border-l-2 border-emerald-700',
                                    'ROTC' => 'bg-emerald-650 text-white border-l-2 border-emerald-800',
                                    default => 'bg-emerald-600 text-white'
                                };
                            @endphp
                            <div class="mt-1 text-[10px] px-2 py-1 rounded truncate {{ $colorClass }} font-semibold tracking-tight shadow-sm" title="{{ $act->title }} ({{ $act->component }})">{{ $act->title }}</div>
                        @endforeach
                    </div>
                @endfor
            </div>
        </x-card>
    </div>
    
    <div class="lg:col-span-1">
        <x-card title="Upcoming Formations" subtitle="Your schedule for the month">
            <ul class="divide-y divide-slate-100 mt-2">
                @forelse($upcomingActivities as $a)
                <li class="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition">
                    <div class="w-1.5 self-stretch rounded-full {{ $a->color ?? 'bg-emerald-500' }}"></div>
                    <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <x-icon name="calendar" class="w-5 h-5" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-semibold text-slate-900 truncate">{{ $a->title }}</div>
                        <div class="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap font-medium">
                            <span class="inline-flex items-center gap-1"><x-icon name="calendar" class="w-3.5 h-3.5" />{{ $a->activity_date?->format('M d, Y') }}</span>
                            <span class="w-1 h-1 rounded-full bg-slate-300 inline-block"></span>
                            <span class="inline-flex items-center gap-1"><x-icon name="clock" class="w-3.5 h-3.5" />07:00 AM</span>
                        </div>
                    </div>
                </li>
                @empty
                <li class="py-8 text-center text-slate-400 text-sm">No upcoming formations.</li>
                @endforelse
            </ul>
        </x-card>
    </div>
</div>

@endsection
