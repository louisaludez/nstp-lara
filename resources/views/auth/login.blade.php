@extends('layouts.guest')

@section('title', 'Login - DNSC NSTP Portal')

@section('content')
<div class="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-6 relative" style="background-image: url('/images/dnsc_bg2.png')">
    <div class="absolute inset-0" style="backdrop-filter: blur(3px); background-color: rgba(15, 23, 42, 0.45);"></div>
    <div class="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        
        <!-- Left brand panel -->
        <div class="p-8 md:p-12 bg-[#202634] text-white relative overflow-hidden flex flex-col justify-center">
            <!-- Decorative circles -->
            <div class="absolute -top-[15%] -right-[25%] w-[450px] h-[450px] rounded-full bg-[#252b3b]"></div>
            <div class="absolute -bottom-[20%] -left-[15%] w-[350px] h-[350px] rounded-full bg-[#252b3b]"></div>
            
            <div class="relative z-10 -mt-8">
                <img src="/images/DSNC.png" class="w-[72px] h-[72px] object-contain mb-8" alt="DNSC Logo" />
                <div class="text-[11px] tracking-[0.25em] font-medium text-slate-400 mb-3 uppercase">Davao Del Norte State College</div>
                <div class="text-white tracking-tight text-[2.5rem] leading-[1.1] font-medium mb-12">NSTP Management System</div>
                
                <div class="mb-4 text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-400">Accounts</div>
                <div class="space-y-3">
                    <div class="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                            <x-icon name="grad" class="w-4 h-4 text-white" />
                        </div>
                        <span class="text-sm font-medium text-slate-200">NSTP Coordinator</span>
                    </div>
                    
                    <div class="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                            <x-icon name="book" class="w-4 h-4 text-white" />
                        </div>
                        <span class="text-sm font-medium text-slate-200">CWTS/LTS Instructor</span>
                    </div>

                    <div class="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <div class="w-8 h-8 rounded-lg bg-[#0f172a] border border-slate-700 flex items-center justify-center shrink-0">
                            <x-icon name="shield" class="w-4 h-4 text-white" />
                        </div>
                        <span class="text-sm font-medium text-slate-200">ROTC 1st Class Officer</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right login form -->
        <div class="p-8 md:p-12 flex flex-col justify-center">
            <div class="text-xs uppercase tracking-[0.18em] text-slate-400 font-medium">Sign In</div>
            <div class="text-slate-900 tracking-tight text-3xl mt-1">Welcome back</div>
            <p class="text-sm text-slate-500 mt-1.5">Enter your credentials to continue.</p>

            <form action="{{ route('login') }}" method="POST" class="mt-8 space-y-4">
                @csrf
                @if (session('error'))
                    <div id="loginError" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                        <x-icon name="alertc" class="w-4 h-4 shrink-0" /> {{ session('error') }}
                    </div>
                @endif
                
                <label class="block">
                    <span class="text-xs font-medium text-slate-500 mb-1.5 block">Email</span>
                    <div class="relative">
                        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><x-icon name="mail" class="w-4 h-4" /></span>
                        <input name="email" id="loginEmail" type="email" placeholder="e.g. coordinator@dnsc.edu.ph" required value="{{ old('email') }}"
                            class="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition @error('email') border-rose-300 focus:border-rose-300 focus:ring-rose-50 @enderror" />
                    </div>
                    @error('email')
                        <p class="text-rose-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </label>
                
                <label class="block">
                    <span class="text-xs font-medium text-slate-500 mb-1.5 block">Password</span>
                    <div class="relative">
                        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><x-icon name="lock" class="w-4 h-4" /></span>
                        <input name="password" id="loginPassword" type="password" placeholder="Enter your password" required
                            class="w-full pl-10 pr-10 py-3 text-sm rounded-lg border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition @error('password') border-rose-300 focus:border-rose-300 focus:ring-rose-50 @enderror" />
                        <button type="button" onclick="togglePasswordVisibility('loginPassword', this)" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none" title="Toggle password visibility">
                            <x-icon name="eye" class="w-4 h-4" />
                        </button>
                    </div>
                    @error('password')
                        <p class="text-rose-500 text-xs mt-1">{{ $message }}</p>
                    @enderror
                </label>
                
                <button type="submit" id="loginBtn" class="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-sm shadow-sm transition-all">
                    <x-icon name="arrow" class="w-4 h-4" /> Sign In
                </button>
            </form>
            
            <div class="mt-6 text-xs text-slate-500 text-center">Trouble signing in? Contact the NSTP office.</div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    function togglePasswordVisibility(inputId, btnEl) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        
        // This is a simplified icon toggle - in a real Blade component we'd just swap elements
        // but for now we just change the opacity of the SVG as a visual cue.
        const svg = btnEl.querySelector('svg');
        if (svg) {
            svg.style.opacity = isPassword ? '0.5' : '1';
        }
    }
</script>
@endpush
