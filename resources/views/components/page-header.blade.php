@props([
    'title',
    'subtitle' => ''
])

<div class="flex items-end justify-between gap-4 flex-wrap">
    <div>
        <div class="text-slate-900 tracking-tight text-xl">{{ $title }}</div>
        @if($subtitle)
            <div class="text-sm text-slate-500 mt-0.5">{{ $subtitle }}</div>
        @endif
    </div>
    @isset($actions)
        <div class="flex items-center gap-2">
            {{ $actions }}
        </div>
    @endisset
</div>
