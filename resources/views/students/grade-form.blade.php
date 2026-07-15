<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NSTP Student Grade — Pass / Fail</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h1 class="text-xl font-bold text-slate-900">Record Student Grade</h1>
        <p class="text-sm text-slate-500 mt-1">Submit pass or fail status to <code class="text-xs bg-slate-100 px-1 rounded">nstp_db.students</code></p>

        <form id="gradeForm" class="mt-6 space-y-4">
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Student No.</label>
                <input name="student_no" required class="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="2024-00001" />
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</label>
                <input name="name" required class="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Last, First M." />
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Section Code</label>
                <input name="section_code" required class="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="CWTS-1A" />
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Program</label>
                <input name="program" class="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="BSIT" />
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade (Pass / Fail)</label>
                <select name="grade" required class="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                    <option value="">Select status…</option>
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                </select>
            </div>
            <button type="submit" class="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold">
                Save to Database
            </button>
        </form>

        <p id="formMessage" class="mt-4 text-sm hidden"></p>

        <p class="mt-6 text-xs text-slate-400">
            <a href="{{ url('/') }}" class="text-indigo-600 hover:underline">← Back to NSTP Portal</a>
        </p>
    </div>

    <script>
        document.getElementById('gradeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const msg = document.getElementById('formMessage');
            const payload = Object.fromEntries(fd.entries());

            try {
                const res = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Save failed');
                msg.textContent = `Saved: ${data.student.name} — grade: ${data.student.grade}`;
                msg.className = 'mt-4 text-sm text-emerald-700';
                e.target.reset();
            } catch (err) {
                msg.textContent = err.message;
                msg.className = 'mt-4 text-sm text-rose-700';
            }
        });
    </script>
</body>
</html>
