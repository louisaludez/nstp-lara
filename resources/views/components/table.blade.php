<div class="overflow-x-auto">
    <table {{ $attributes->merge(['class' => 'w-full text-sm']) }}>
        @isset($header)
        <thead>
            <tr class="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                {{ $header }}
            </tr>
        </thead>
        @endisset
        <tbody>
            {{ $slot }}
        </tbody>
    </table>
</div>
