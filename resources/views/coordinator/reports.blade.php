@extends('layouts.coordinator')

@section('title', 'Reports & OCR - Coordinator Dashboard')


@section('content')

<x-page-header title="Reports & Data Processing" subtitle="Generate program reports and process physical documents via OCR">
</x-page-header>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    <div class="space-y-6">
        <x-card title="Generate Official Reports" subtitle="Export data for university submission">
            <div class="p-4 space-y-4">
                <div class="space-y-1">
                    <label class="text-xs font-semibold text-slate-600">Report Type</label>
                    <select class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300 shadow-sm">
                        <option>Terminal Report</option>
                        <option>Master Enrollment List</option>
                        <option>Consolidated Grade Sheet</option>
                        <option>Financial Summary</option>
                    </select>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-semibold text-slate-600">Program</label>
                        <select class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300 shadow-sm">
                            <option>All Programs (CWTS, LTS, ROTC)</option>
                            <option>CWTS Only</option>
                            <option>LTS Only</option>
                            <option>ROTC Only</option>
                        </select>
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-semibold text-slate-600">School Year</label>
                        <select class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-300 shadow-sm">
                            <option>2025-2026</option>
                            <option>2024-2025</option>
                        </select>
                    </div>
                </div>

                <div class="pt-4 flex justify-end gap-3">
                    <button class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">Preview</button>
                    <button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm">
                        <x-icon name="download" class="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </div>
        </x-card>
    </div>

    <div class="space-y-6">
        <x-card title="OCR Processing" subtitle="Extract text from physical registration forms">
            <div class="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl m-4 bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                    <x-icon name="upload" class="w-6 h-6" />
                </div>
                <h4 class="text-sm font-bold text-slate-800">Upload Scanned Documents</h4>
                <p class="text-xs text-slate-500 mt-1 mb-4">Supported formats: JPG, PNG, PDF</p>
                <button class="px-4 py-2 text-sm font-semibold rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition shadow-sm">
                    Select Files
                </button>
            </div>
            
            <div class="px-4 pb-4">
                <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent OCR Tasks</div>
                <ul class="space-y-2">
                    <li class="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white">
                        <div class="flex items-center gap-3">
                            <x-icon name="filetext" class="w-5 h-5 text-indigo-500" />
                            <div>
                                <div class="text-sm font-medium text-slate-800">batch_registrations_01.pdf</div>
                                <div class="text-[10px] text-slate-500">Processed today at 10:45 AM</div>
                            </div>
                        </div>
                        <span class="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-600">Completed</span>
                    </li>
                </ul>
            </div>
        </x-card>
    </div>
</div>

@endsection
