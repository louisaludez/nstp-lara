<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'DNSC NSTP Portal')</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    @stack('styles')
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
    @php
        $isMilitary = $themeMilitary ?? false;
        $sidebarTextColor = $isMilitary ? 'text-white' : 'text-slate-900';
        $sidebarSubColor = $isMilitary ? 'text-slate-400' : 'text-slate-500';
        $avatarClasses = $isMilitary
            ? 'rounded-md w-9 h-9 bg-slate-800 ring-1 ring-amber-300 text-amber-300 flex items-center justify-center text-sm shrink-0'
            : 'rounded-full w-9 h-9 bg-gradient-to-br from-amber-400 to-rose-400 text-white flex items-center justify-center text-sm shrink-0';
        $logoutBtnColor = $isMilitary ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700';
        $brandUppercase = $isMilitary ? 'uppercase text-sm' : '';
        $subUppercase = $isMilitary ? 'uppercase tracking-wider' : '';
        $contextUppercase = $isMilitary ? 'uppercase tracking-wider' : '';
    @endphp
    <div id="app" class="min-h-screen w-full flex">
        <!-- Sidebar -->
        <aside class="transition-all duration-300 ease-in-out shrink-0 {{ $themeBg ?? 'bg-indigo-50/60' }} border-r {{ $themeBdr ?? 'border-indigo-100' }} flex flex-col h-screen sticky top-0 w-64">
            <div class="px-6 py-6 border-b {{ $themeBdr ?? 'border-indigo-100' }}">
                <div class="flex items-center gap-3">
                    <img src="/images/DSNC.png" class="w-10 h-10 object-contain" alt="DNSC Logo" />
                    <div>
                        <div class="tracking-tight {{ $brandUppercase }} {{ $sidebarTextColor }}">{{ $brand ?? 'DNSC NSTP' }}</div>
                        <div class="text-[11px] {{ $subUppercase }} {{ $sidebarSubColor }}">{{ $brandSub ?? 'Portal' }}</div>
                    </div>
                </div>
            </div>
            <nav class="flex-1 px-3 py-5 space-y-1 sidebar-nav">
                @yield('nav')
            </nav>
            <div class="px-3 py-4 border-t {{ $themeBdr ?? 'border-indigo-100' }}">
                <div class="flex items-center gap-1 rounded-md hover:bg-black/5 transition group">
                    <button class="flex items-center gap-3 px-3 py-2 flex-1 min-w-0 text-left">
                        <div class="{{ $avatarClasses }}">
                            {{ $userInitials ?? 'AD' }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm truncate {{ $sidebarTextColor }} group-hover:underline">{{ $userName ?? 'Admin' }}</div>
                            <div class="text-[11px] truncate {{ $subUppercase }} {{ $sidebarSubColor }}">{{ $userRole ?? 'System Administrator' }}</div>
                        </div>
                    </button>
                    <form method="POST" action="{{ route('logout') }}" class="shrink-0 flex">
                        @csrf
                        <button type="submit" class="{{ $logoutBtnColor }} p-2" title="Logout">
                            <x-icon name="logout" class="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0 flex flex-col">
            <header class="flex items-center justify-between gap-6 px-8 py-5 bg-white/70 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
                <div class="flex items-center gap-4">
                    <button id="sidebarToggleBtn" class="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition duration-200 focus:outline-none flex items-center justify-center shrink-0">
                        <x-icon name="menu" class="w-5 h-5" />
                    </button>
                    <div>
                        <div class="text-xs text-slate-500 {{ $contextUppercase }}">{{ $context ?? 'Davao Del Norte State College' }}</div>
                        <div class="text-slate-900 tracking-tight text-lg">{{ $greeting ?? 'Welcome back' }}</div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="relative hidden md:block">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <x-icon name="search" class="w-4 h-4" />
                        </span>
                        <input type="text" placeholder="Search..." class="w-72 pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 border border-transparent focus:bg-white focus:border-slate-300 focus:outline-none" />
                    </div>
                    <button class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 relative">
                        <x-icon name="bell" class="w-[18px] h-[18px]" />
                    </button>
                </div>
            </header>
            <main class="flex-1 px-8 py-7 space-y-6">
                @yield('content')
            </main>
        </div>
    </div>
    @yield('scripts')
    @stack('scripts')
</body>
</html>
