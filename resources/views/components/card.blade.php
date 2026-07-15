@props([
    'title' => '',
    'subtitle' => '',
    'class' => ''
])

<div class="premium-card {{ $class }}">
    @if($title || isset($action))
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div class="min-w-0">
            @if($title)
                <div class="text-slate-900 tracking-tight">{{ $title }}</div>
            @endif
            @if($subtitle)
                <div class="text-xs text-slate-500">{{ $subtitle }}</div>
            @endif
        </div>
        @isset($action)
            {{ $action }}
        @endisset
    </div>
    @endif
    <div class="p-5">
        {{ $slot }}
    </div>
</div>
