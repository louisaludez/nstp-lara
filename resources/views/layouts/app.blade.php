<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Davao Del Norte State College NSTP Information Management Portal')</title>

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
    <div id="app">
        @yield('content')
    </div>

    <script src="{{ asset('js/core.js') }}"></script>
    <script src="{{ asset('js/audit.js') }}"></script>
    <script src="{{ asset('js/students-api.js') }}"></script>
    <script src="{{ asset('js/dashboard-live.js') }}"></script>
    <script src="{{ asset('js/login.js') }}"></script>
    <script src="{{ asset('js/coordinator.js') }}"></script>
    <script src="{{ asset('js/instructor.js') }}"></script>
    <script src="{{ asset('js/rotc.js') }}"></script>
    <script src="{{ asset('js/admin.js') }}"></script>
    @vite(['resources/js/app.js'])

    @stack('scripts')
</body>
</html>
