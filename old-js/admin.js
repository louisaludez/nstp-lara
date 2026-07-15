/* ================================================================
   MAIN RENDER
================================================================ */
function adminAccountsPage() {
  const accountsList = CREDENTIALS.filter(c => c.email !== 'admin123@dnsc.edu.ph');
  const isEditing = S.editingAccEmail != null;
  const editAcc = isEditing ? CREDENTIALS.find(c => c.email === S.editingAccEmail) : null;
  const editPd = isEditing ? (PROFILE_DATA[S.editingAccEmail] || PROFILE_DATA[editAcc?.role] || {}) : {};

  const formTitle = isEditing ? 'Edit Account' : 'Create Account';
  const formSubtitle = isEditing ? 'Update administrative credentials & details' : 'Register new system coordinator or instructor';
  const formIcon = isEditing ? 'pencil' : 'userplus';
  const submitText = isEditing ? 'Save Changes' : 'Create Account';

  const rows = accountsList.map((acc, idx) => {
    const pd = PROFILE_DATA[acc.email] || PROFILE_DATA[acc.role] || {};
    const initials = getInitials(pd.fullName || acc.label) || 'US';
    const roleColor = acc.role === 'coordinator' ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
      : acc.role === 'instructor' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-slate-100 text-slate-800 border-slate-200';
    return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition duration-150">
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br ${acc.grad} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                ${initials}
              </div>
              <div>
                <div class="text-sm font-semibold text-slate-900">${pd.fullName || 'New User'}</div>
                <div class="text-xs text-slate-500 mt-0.5">${pd.gmail || acc.email}</div>
              </div>
            </div>
          </td>
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColor}">
              ${ico(acc.ico, 'w-3 h-3')} ${acc.label}
            </span>
          </td>
          <td class="py-3.5 px-4">
            <div class="text-xs text-slate-700 font-medium">${pd.contact || '-??'}</div>
          </td>
          <td class="py-3.5 px-4">
            <div class="text-xs font-semibold text-slate-800">${pd.degree || '-??'}</div>
            <div class="text-[10px] text-slate-500 truncate max-w-[150px]" title="${pd.degreeTitle || ''}">${pd.degreeTitle || '-??'}</div>
          </td>
          <td class="py-3.5 px-4 font-mono text-xs text-slate-600">
            ${acc.password}
          </td>
          <td class="py-3.5 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="editAccount('${acc.email}')" class="p-1.5 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition duration-200" title="Edit account">
                ${ico('pencil', 'w-4 h-4')}
              </button>
              <button onclick="deleteAccount('${acc.email}')" class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition duration-200" title="Delete account">
                ${ico('trash', 'w-4 h-4')}
              </button>
            </div>
          </td>
        </tr>`;
  }).join('');

  return `
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div class="xl:col-span-1 space-y-6">
          <div class="premium-card p-6">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                ${ico(formIcon, 'w-5 h-5')}
              </div>
              <div>
                <h3 class="font-bold text-slate-900 tracking-tight text-base">${formTitle}</h3>
                <p class="text-xs text-slate-500 mt-0.5">${formSubtitle}</p>
              </div>
            </div>
            <div class="space-y-4 text-sm">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('users', 'w-4 h-4')}</span>
                  <input id="newAccName" type="text" placeholder="e.g. Dr. Juan Dela Cruz" value="${editPd.fullName || ''}" class="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Number</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('bell', 'w-4 h-4')}</span>
                  <input id="newAccContact" type="text" placeholder="e.g. +63 917 123 4567" value="${editPd.contact || ''}" class="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gmail Address (Login Email)</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('mail', 'w-4 h-4')}</span>
                  <input id="newAccGmail" type="email" placeholder="e.g. j.delacruz@dnsc.edu.ph" value="${editPd.gmail || editAcc?.email || ''}" class="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Degree Type</label>
                  <select id="newAccDegree" class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 bg-white focus:outline-none transition">
                    <option value="Bachelor" ${editPd.degree === 'Bachelor' ? 'selected' : ''}>Bachelor</option>
                    <option value="Masteral" ${editPd.degree === 'Masteral' ? 'selected' : ''}>Masteral</option>
                    <option value="Doctoral" ${editPd.degree === 'Doctoral' ? 'selected' : ''}>Doctoral</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Account Role</label>
                  <select id="newAccRole" class="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 bg-white focus:outline-none transition">
                    <option value="coordinator" ${editAcc?.role === 'coordinator' ? 'selected' : ''}>Coordinator</option>
                    <option value="instructor" ${editAcc?.role === 'instructor' ? 'selected' : ''}>CWTS/LTS Instructor</option>
                    <option value="rotcofficer" ${editAcc?.role === 'rotcofficer' ? 'selected' : ''}>ROTC Officer</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Degree Description / Title</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('grad', 'w-4 h-4')}</span>
                  <input id="newAccDegreeTitle" type="text" placeholder="e.g. Master of Science in Information Technology" value="${editPd.degreeTitle || ''}" class="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('lock', 'w-4 h-4')}</span>
                  <input id="newAccPassword" type="password" placeholder="Create a secure password" value="${editAcc?.password || ''}" class="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition" />
                  <button type="button" onclick="togglePasswordVisibility('newAccPassword', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none" title="Toggle password visibility">
                    ${ico('eye', 'w-4 h-4')}
                  </button>
                </div>
              </div>
              ${!isEditing ? `
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm Password</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">${ico('lock', 'w-4 h-4')}</span>
                  <input id="newAccConfirmPassword" type="password" placeholder="Confirm your password" class="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition" />
                  <button type="button" onclick="togglePasswordVisibility('newAccConfirmPassword', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none" title="Toggle password visibility">
                    ${ico('eye', 'w-4 h-4')}
                  </button>
                </div>
              </div>` : ''}
              <div class="flex gap-3">
                ${isEditing ? `
                <button onclick="cancelEditAccount()" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all">
                  Cancel
                </button>` : ''}
                <button onclick="${isEditing ? `saveAccountChanges()` : `createNewAccount()`}" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-purple-100 transition-all">
                  ${ico(isEditing ? 'filecheck' : 'userplus', 'w-4 h-4')} ${submitText}
                </button>
              </div>
            </div>
          </div>

          <div class="premium-card p-6 border border-rose-100 bg-rose-50/10">
            <div class="flex items-center gap-3 border-b border-rose-100 pb-4 mb-5">
              <div class="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
                ${ico('trash', 'w-5 h-5')}
              </div>
              <div>
                <h3 class="font-bold text-rose-900 tracking-tight text-base">Targeted Portal Reset</h3>
                <p class="text-xs text-rose-500 mt-0.5">Wipe operational portal display data</p>
              </div>
            </div>
            <div class="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>Triggers a deep administrative database wipe across CWTS, LTS, and ROTC portals. This permanently deletes:</p>
              <ul class="list-disc list-inside space-y-1 ml-1 text-slate-500">
                <li>Non-admin user accounts (instructors, officers)</li>
                <li>All sections, student rosters & enrollments</li>
                <li>Attendance, submissions & logs</li>
                <li>Calendar activities & announcements</li>
                <li>Activity designs & plans</li>
              </ul>
              <p class="font-semibold text-rose-800 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/50">
                ⚠ Admin accounts, migrations, cache, and system configurations are fully preserved.
              </p>
              <button onclick="window.triggerPortalDataReset()" class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-rose-100 transition-all cursor-pointer">
                ${ico('alertc', 'w-4 h-4')} Reset Portal Data
              </button>
            </div>
          </div>
        </div>
        <div class="xl:col-span-2 premium-card overflow-hidden">

          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-slate-900 tracking-tight text-base">Registered Accounts Registry</h3>
              <p class="text-xs text-slate-500 mt-0.5">Manage administrative credentials & profile details</p>
            </div>
            <div class="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
              Total: ${accountsList.length} User(s)
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-[10px] uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                  <th class="py-3.5 px-4 font-bold">User Details</th>
                  <th class="py-3.5 px-4 font-bold">Assigned Role</th>
                  <th class="py-3.5 px-4 font-bold">Contact No</th>
                  <th class="py-3.5 px-4 font-bold">Degree Info</th>
                  <th class="py-3.5 px-4 font-bold">Password</th>
                  <th class="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rows.length ? rows : `
                <tr>
                  <td colspan="6" class="py-8 text-center text-slate-400 text-sm">
                    No registered accounts found.
                  </td>
                </tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
}

window.editAccount = function (email) {
  S.editingAccEmail = email;
  render();
};

window.cancelEditAccount = function () {
  S.editingAccEmail = null;
  render();
};

window.saveAccountChanges = function () {
  const email = S.editingAccEmail;
  if (!email) return;

  const name = (document.getElementById('newAccName')?.value || '').trim();
  const contact = (document.getElementById('newAccContact')?.value || '').trim();
  const gmail = (document.getElementById('newAccGmail')?.value || '').trim();
  const degree = document.getElementById('newAccDegree')?.value || '';
  const degreeTitle = (document.getElementById('newAccDegreeTitle')?.value || '').trim();
  const password = (document.getElementById('newAccPassword')?.value || '').trim();
  const role = document.getElementById('newAccRole')?.value || '';

  if (!name || !contact || !gmail || !password) {
    alert('Please fill out all required fields: Name, Contact, Gmail, and Password.');
    return;
  }

  const cred = CREDENTIALS.find(c => c.email === email);
  if (cred) {
    if (gmail.toLowerCase() !== email.toLowerCase()) {
      const exists = CREDENTIALS.some(c => c.email.toLowerCase() === gmail.toLowerCase());
      if (exists) {
        alert('An account with this email/Gmail address already exists.');
        return;
      }
    }

    const normalizedGmail = gmail.toLowerCase();

    let label = 'NSTP Coordinator';
    let icoVal = 'grad';
    let grad = 'from-indigo-600 to-blue-500';

    if (role === 'instructor') {
      label = 'CWTS/LTS Instructor';
      icoVal = 'book';
      grad = 'from-emerald-500 to-teal-500';
    } else if (role === 'rotcofficer') {
      label = 'ROTC 1st Class Officer';
      icoVal = 'shield';
      grad = 'from-slate-800 to-slate-900';
    }

    cred.email = normalizedGmail;
    cred.password = password;
    cred.role = role;
    cred.label = label;
    cred.ico = icoVal;
    cred.grad = grad;
  }

  const oldPd = PROFILE_DATA[email];
  if (oldPd) delete PROFILE_DATA[email];

  PROFILE_DATA[normalizedGmail] = {
    fullName: name,
    contact: contact,
    gmail: normalizedGmail,
    password: password,
    degree: degree,
    degreeTitle: degreeTitle
  };

  S.editingAccEmail = null;
  alert('Account updated successfully!');
  render();
};

window.createNewAccount = function () {
  const name = (document.getElementById('newAccName')?.value || '').trim();
  const contact = (document.getElementById('newAccContact')?.value || '').trim();
  const gmail = (document.getElementById('newAccGmail')?.value || '').trim().toLowerCase();
  const degree = document.getElementById('newAccDegree')?.value || '';
  const degreeTitle = (document.getElementById('newAccDegreeTitle')?.value || '').trim();
  const password = (document.getElementById('newAccPassword')?.value || '').trim();
  const confirmPassword = (document.getElementById('newAccConfirmPassword')?.value || '').trim();
  const role = document.getElementById('newAccRole')?.value || '';

  if (!name || !contact || !gmail || !password || !confirmPassword) {
    alert('Please fill out all required fields: Name, Contact, Gmail, Password, and Confirm Password.');
    return;
  }
  if (password !== confirmPassword) {
    alert('Passwords do not match. Please verify your password.');
    return;
  }
  const exists = CREDENTIALS.some(c => c.email.toLowerCase() === gmail.toLowerCase());
  if (exists) {
    alert('An account with this email/Gmail address already exists.');
    return;
  }

  let label = 'NSTP Coordinator';
  let icoVal = 'grad';
  let grad = 'from-indigo-600 to-blue-500';

  if (role === 'instructor') {
    label = 'CWTS/LTS Instructor';
    icoVal = 'book';
    grad = 'from-emerald-500 to-teal-500';
  } else if (role === 'rotcofficer') {
    label = 'ROTC 1st Class Officer';
    icoVal = 'shield';
    grad = 'from-slate-800 to-slate-900';
  }

  CREDENTIALS.push({
    email: gmail,
    password: password,
    role: role,
    label: label,
    ico: icoVal,
    grad: grad
  });

  PROFILE_DATA[gmail] = {
    fullName: name,
    contact: contact,
    gmail: gmail,
    password: password,
    degree: degree,
    degreeTitle: degreeTitle
  };

  alert('Account created successfully!');
  render();
};

window.deleteAccount = function (email) {
  const protectedEmails = ['admin123@dnsc.edu.ph', 'coordinator@dnsc.edu.ph', 'instructor@dnsc.edu.ph', 'rotc@dnsc.edu.ph'];
  if (protectedEmails.includes(email)) {
    alert("Cannot delete a default system account. Please use the admin tools to manage custom accounts instead.");
    return;
  }
  if (confirm(`Are you sure you want to delete the account for ${email}?`)) {
    const cIdx = CREDENTIALS.findIndex(c => c.email === email);
    if (cIdx !== -1) CREDENTIALS.splice(cIdx, 1);
    if (email === 'coor123' || email === 'maya.reyes@gmail.com') delete PROFILE_DATA.coordinator;
    else if (email === 'ins123' || email === 'julian.santos@gmail.com') delete PROFILE_DATA.instructor;
    else if (email === 'rotc123' || email === 'daniel.castillo@gmail.com') delete PROFILE_DATA.rotc;
    delete PROFILE_DATA[email];
    render();
  }
};

window.togglePasswordVisibility = function (inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerHTML = ico('eyeoff', 'w-4 h-4');
  } else {
    input.type = 'password';
    btnEl.innerHTML = ico('eye', 'w-4 h-4');
  }
};

function renderAdmin() {
  const pd = PROFILE_DATA[S.email] || PROFILE_DATA.coordinator || {};
  const userName = pd.fullName || 'System Admin';
  const userInitials = getInitials(userName) || 'AD';
  const nav = [
    { name: 'Administration', isHeader: true },
    { name: 'Accounts', ico: 'users' }
  ].map(n => n.isHeader ? n : { ...n, active: S.adminPage === n.name });
  return renderShell({ theme: 'purple', brand: 'DNSC NSTP', brandSub: 'Admin Console', navItems: nav, userName: userName, userRole: 'System Administrator', userInitials: userInitials, greeting: `System Administrator Console`, context: 'Davao Del Norte State College', ctaLabel: '', content: adminAccountsPage() });
}

function render() {
  const app = document.getElementById('app');
  if (!S.role) {
    app.innerHTML = renderLogin();
  } else if (S.role === 'coordinator') {
    app.innerHTML = renderCoordinator();
  } else if (S.role === 'instructor') {
    app.innerHTML = renderInstructor();
  } else if (S.role === 'admin') {
    app.innerHTML = renderAdmin();
  } else {
    app.innerHTML = renderROTC();
  }
  attachEvents();
  if (window.startDashboardLive) window.startDashboardLive();
}

