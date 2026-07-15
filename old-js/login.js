/* ================================================================
   LOGIN
================================================================ */

function renderLogin() {
  const errHtml = S.loginError
    ? `<div id="loginError" class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            ${ico('alertc', 'w-4 h-4 shrink-0')} ${S.loginError}
           </div>`
    : '';

  return `<div class="min-h-screen w-full bg-cover bg-center flex items-center justify-center p-6 relative" style="background-image: url('/images/dnsc_bg2.png')">
    <div class="absolute inset-0" style="backdrop-filter: blur(3px); background-color: rgba(15, 23, 42, 0.45);"></div>
    <div class="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

      <!-- Left brand panel -->
      <div class="p-8 md:p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/5"></div>
        <div class="absolute bottom-0 -left-10 w-72 h-72 rounded-full bg-white/5"></div>
        <div class="relative">
          <img src="/images/DSNC.png" class="w-16 h-16 object-contain mb-6" alt="DNSC Logo" />
          <div class="text-[11px] tracking-[0.3em] uppercase text-slate-400 mb-2">Davao Del Norte State College</div>
          <div class="text-white tracking-tight text-3xl leading-tight">NSTP Management System</div>
        </div>
      </div>

      <!-- Right login form -->
      <div class="p-8 md:p-10 flex flex-col justify-center">
        <div class="text-xs uppercase tracking-[0.18em] text-slate-400">Sign In</div>
        <div class="text-slate-900 tracking-tight text-2xl mt-1">Welcome back</div>
        <p class="text-sm text-slate-500 mt-1">Enter your credentials to continue.</p>

        <div class="mt-6 space-y-4">
          ${errHtml}
          <label class="block">
            <span class="text-xs text-slate-500">Email</span>
            <div class="mt-1 relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('mail', 'w-4 h-4')}</span>
              <input id="loginEmail" type="email" placeholder="Enter your email"
                class="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition" />
            </div>
          </label>
          <label class="block">
            <span class="text-xs text-slate-500">Password</span>
            <div class="mt-1 relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('lock', 'w-4 h-4')}</span>
              <input id="loginPassword" type="password" placeholder="Enter your password"
                class="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition" />
              <button type="button" onclick="togglePasswordVisibility('loginPassword', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none" title="Toggle password visibility">
                ${ico('eye', 'w-4 h-4')}
              </button>
            </div>
          </label>
        </div>

        <button id="loginBtn" class="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-sm shadow-md transition-all">
          ${ico('arrow', 'w-4 h-4')} Sign In
        </button>
        <div class="mt-4 text-xs text-slate-500 text-center">Trouble signing in? Contact the NSTP office.</div>
      </div>
    </div>
  </div>`;
}

