@extends('layouts.coordinator')

@section('title', 'Coordinator Dashboard - DNSC NSTP Portal')

@section('content')
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5" id="dashboard-stats-grid">
    @foreach($stats as $s)
    <div class="premium-card p-5" data-metric="{{ $s->key }}">
        <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br {{ $s->color }} flex items-center justify-center text-white shadow">
                <x-icon name="{{ $s->ico }}" class="w-5 h-5" />
            </div>
            <span class="text-xs px-2 py-1 rounded-full {{ $s->up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600' }}" data-metric-delta>{{ $s->delta }}</span>
        </div>
        <div class="mt-4 text-slate-900 tracking-tight text-2xl" data-metric-value>{{ $s->value }}</div>
        <div class="text-sm text-slate-500 mt-0.5">{{ $s->label }}</div>
    </div>
    @endforeach
    <div class="premium-card p-5" data-metric="incomplete_profiles">
        <div class="flex items-start justify-between">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow">
                <x-icon name="alertc" class="w-5 h-5" />
            </div>
            <span class="text-xs px-2 py-1 rounded-full {{ $incompleteCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600' }}" data-metric-delta>{{ $incompleteCount > 0 ? 'Flagged' : 'Complete' }}</span>
        </div>
        <div class="mt-4 text-slate-900 tracking-tight text-2xl" data-metric-value>{{ $incompleteCount }}</div>
        <div class="text-sm text-slate-500 mt-0.5">Incomplete Profiles</div>
    </div>
</div>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-6">
    <div class="xl:col-span-3 flex flex-col gap-5">
        <!-- Charts go here, can be hydrated via Alpine or JS -->
        <x-card class="h-80" title="Enrollment Trends" subtitle="Overview of student enrollment over time">
            <div class="w-full h-full flex items-center justify-center text-slate-400">
                (Chart Placeholder - Requires JS Library)
            </div>
        </x-card>
        <x-card class="h-80" title="Pass / Fail Ratio" subtitle="Success metrics across sections">
            <div class="w-full h-full flex items-center justify-center text-slate-400">
                (Chart Placeholder - Requires JS Library)
            </div>
        </x-card>
    </div>
    <div class="xl:col-span-2 flex flex-col gap-5">
        
        <!-- Calendar Mini Widget -->
        <x-card class="p-5">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <div class="text-slate-900 font-bold tracking-tight">Calendar of Activities</div>
                    <div class="text-xs text-slate-500 mt-0.5">{{ date('F Y') }}</div>
                </div>
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <x-icon name="calendar" class="w-4 h-4" />
                </div>
            </div>
            <div class="grid grid-cols-7 gap-1 mb-1">
                @foreach(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as $d)
                <div class="text-center text-[10px] font-medium text-slate-400 uppercase">{{ $d }}</div>
                @endforeach
            </div>
            <div class="grid grid-cols-7 gap-1">
                {{-- Mock calendar generation for visual --}}
                @for($i = 0; $i < date('w', strtotime(date('Y-m-01'))); $i++)
                    <div></div>
                @endfor
                @for($d = 1; $d <= date('t'); $d++)
                    @php $isToday = $d == date('j'); @endphp
                    <div class="w-7 h-7 flex items-center justify-center text-xs rounded-full {{ $isToday ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100 cursor-pointer' }}">
                        {{ $d }}
                    </div>
                @endfor
            </div>
            <div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>Today</span>
                <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-50 ring-1 ring-indigo-200 inline-block font-semibold"></span>Has activity</span>
            </div>
        </x-card>

        <!-- Recent Activities Widget -->
        <x-card class="p-5">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <div class="text-slate-900 tracking-tight">Recent Activities</div>
                    <div class="text-xs text-slate-500">Latest scheduled events</div>
                </div>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <x-icon name="calrange" class="w-4 h-4" />
                </div>
            </div>
            <ul class="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                @forelse($recentActivities as $act)
                <li class="py-3 flex items-center justify-between text-xs">
                    <div>
                        <div class="font-semibold text-slate-800">{{ $act->title }}</div>
                        <div class="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <x-icon name="pin" class="w-3 h-3 text-slate-400" /> {{ $act->location }}
                            &middot;
                            <span>{{ $act->activity_date?->format('M d, Y') }}</span>
                        </div>
                    </div>
                    <span class="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 font-semibold">{{ $act->component }}</span>
                </li>
                @empty
                <li class="py-4 text-center text-sm text-slate-400">
                    No recent activities.
                </li>
                @endforelse
            </ul>
        </x-card>

        <!-- Incomplete Profiles Widget -->
        <x-card class="p-5">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <div class="text-slate-900 font-bold tracking-tight">Incomplete Student Profiles</div>
                    <div class="text-xs text-slate-500 mt-0.5">Flags missing information in records</div>
                </div>
                <div class="px-2 py-0.5 text-xs font-bold rounded-full {{ $incompleteCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700' }}">{{ $incompleteCount }} Flagged</div>
            </div>
            
            <div class="relative mb-3">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><x-icon name="search" class="w-3.5 h-3.5" /></span>
                <input type="text" placeholder="Search flagged students..." class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-300 transition-colors shadow-sm" />
            </div>

            <ul class="max-h-[300px] overflow-y-auto divide-y divide-slate-50 pr-1">
                @forelse($incompleteProfiles as $p)
                <li class="py-2.5 flex items-center justify-between text-xs">
                    <div>
                        <div class="font-semibold text-slate-700">{{ $p->name }}</div>
                        <div class="text-[10px] text-slate-400">{{ $p->id }} &middot; {{ $p->course }}</div>
                    </div>
                    <span class="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 font-semibold">{{ $p->program }}</span>
                </li>
                @empty
                <li class="text-center text-sm text-slate-400 py-8 flex flex-col items-center gap-2">
                    <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><x-icon name="check2" class="w-5 h-5" /></div>
                    <div class="font-bold text-slate-700 text-xs">All Profiles Complete</div>
                    <div class="text-[11px] text-slate-400">All student records have complete data fields.</div>
                </li>
                @endforelse
            </ul>
        </x-card>

    </div>
</div>
@endsection
