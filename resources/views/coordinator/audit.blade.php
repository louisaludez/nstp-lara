@extends('layouts.coordinator')

@section('title', 'Audit Logs - DNSC NSTP Portal')

@section('content')
<div class="space-y-5" id="audit-logs-container">
    <div class="flex items-center justify-between mb-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Audit Logs Overview</h1>
            <p class="text-sm text-slate-500 mt-1">Immutable record of every action taken in the program office</p>
        </div>
        <div class="flex items-center gap-2">
            <div class="flex items-center gap-2">
                <div class="relative">
                    <span class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <x-icon name="search" class="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input type="text" autocomplete="off" id="searchInput"
                           class="w-48 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-300 transition-colors shadow-sm"
                           placeholder="Search logs..." />
                </div>
                <div class="relative font-medium">
                    <select id="logTypeFilter" class="w-48 pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-indigo-300 transition-colors shadow-sm appearance-none cursor-pointer">
                        <option value="all">All Logs</option>
                        <option value="edit">Edit</option>
                        <option value="approval">Approval</option>
                        <option value="submission">Submission</option>
                        <option value="system">System</option>
                        <option value="alert">Alert</option>
                    </select>
                    <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <x-icon name="chevron" class="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
            <button id="exportCsvBtn" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer">
                <x-icon name="download" class="w-4 h-4" /> Export CSV
            </button>
        </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <ul class="space-y-3 max-h-[600px] overflow-y-auto pr-1 divide-y divide-slate-50">
            @forelse($logs as $log)
            <li class="audit-log-item flex items-start gap-3 py-3 first:pt-0 last:pb-0" 
                data-action-type="{{ strtolower($log->action_type ?? 'system') }}"
                data-search="{{ strtolower(($log->username ?? '') . ' ' . ($log->user_email ?? '') . ' ' . $log->action . ' ' . ($log->target ?? '') . ' ' . ($log->module ?? '') . ' ' . ($log->details ?? '')) }}">
                @php
                    $color = match($log->action_type) {
                        'edit' => 'bg-amber-400',
                        'approval' => 'bg-emerald-400',
                        'submission' => 'bg-blue-400',
                        'alert' => 'bg-rose-400',
                        default => 'bg-indigo-400'
                    };
                @endphp
                <div class="w-2 h-2 mt-2 rounded-full {{ $color }} shrink-0"></div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm text-slate-900">
                        <span class="font-semibold text-slate-700">{{ $log->username ?? $log->user_email ?? 'System' }}</span>
                        <span class="text-slate-500">{{ strtolower($log->action) }}</span>
                        <span class="font-medium text-slate-900">{{ $log->target }}</span>
                        @if($log->module)
                            <span class="text-xs text-slate-400">in {{ $log->module }}</span>
                        @endif
                    </div>
                    @if($log->details)
                        <div class="text-xs text-slate-400 italic mt-0.5">{{ $log->details }}</div>
                    @endif
                    <div class="text-xs text-slate-500 mt-1">{{ $log->performed_at?->format('M d, Y h:i A') ?? $log->created_at?->format('M d, Y h:i A') }}</div>
                </div>
                <span class="inline-flex text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 capitalize font-medium">{{ $log->action_type }}</span>
            </li>
            @empty
            <li class="text-center text-sm text-slate-400 py-8">No audit logs found.</li>
            @endforelse
        </ul>
    </div>
</div>
@endsection

@section('scripts')
@vite(['resources/js/app.js'])
<script>
    window.auditLogsData = {!! json_encode($logs->map(function($log) {
        return [
            'timestamp' => $log->performed_at?->toIso8601String() ?? $log->created_at?->toIso8601String() ?? '',
            'user_email' => $log->user_email ?? $log->username ?? 'System',
            'module' => $log->module ?? '',
            'action' => $log->action ?? '',
            'severity' => $log->action_type ?? 'system',
            'details' => $log->details ?? ''
        ];
    })->toArray()) !!};

    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('searchInput');
        const logTypeFilter = document.getElementById('logTypeFilter');
        const exportCsvBtn = document.getElementById('exportCsvBtn');
        const logItems = document.querySelectorAll('.audit-log-item');

        function filterLogs() {
            const searchText = searchInput.value.toLowerCase().trim();
            const filterType = logTypeFilter.value;

            logItems.forEach(item => {
                const searchData = item.getAttribute('data-search') || '';
                const actionType = item.getAttribute('data-action-type') || '';
                
                const matchesSearch = searchData.includes(searchText);
                const matchesType = (filterType === 'all' || actionType === filterType);

                if (matchesSearch && matchesType) {
                    item.classList.remove('hidden');
                    item.classList.add('flex');
                } else {
                    item.classList.remove('flex');
                    item.classList.add('hidden');
                }
            });
        }

        if (searchInput) searchInput.addEventListener('input', filterLogs);
        if (logTypeFilter) logTypeFilter.addEventListener('change', filterLogs);

        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', function() {
                const filterType = logTypeFilter.value;

                // Filter the window.auditLogsData array based on DOM visibility
                const filteredData = window.auditLogsData.filter((log, idx) => {
                    const item = logItems[idx];
                    if (!item) return false;
                    return !item.classList.contains('hidden');
                });

                if (window.exportAuditCSV) {
                    window.exportAuditCSV(filteredData, filterType);
                } else {
                    console.error('exportAuditCSV is not loaded on window.');
                    alert('CSV Export utility is still loading. Please try again in a moment.');
                }
            });
        }
    });
</script>
@endsection
