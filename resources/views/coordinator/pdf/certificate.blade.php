<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $template->title_text }} - {{ count($students) === 1 ? $students[0]['name'] : 'Batch' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: letter landscape;
            margin: 0;
        }

        body {
            font-family: "DejaVu Serif", Georgia, serif;
            background: #ffffff;
            width: 100%;
            height: 100%;
        }

        .page {
            width: 279mm;
            height: 215mm;
            position: relative;
            background: {{ $bgColor }};
            page-break-after: always;
            overflow: hidden;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        .bg-image-design {
            position: absolute;
            top: 0;
            left: 0;
            width: 279mm;
            height: 215mm;
            z-index: 1;
        }

        .border-frame {
            position: absolute;
            top: 8mm;
            left: 8mm;
            width: 263mm;
            height: 199mm;
            border: 6mm double {{ $borderColor }};
            z-index: 1;
        }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 80mm;
            height: 80mm;
            margin-top: -40mm;
            margin-left: -40mm;
            z-index: 2;
        }

        .serial-no {
            position: absolute;
            top: 15mm;
            right: 15mm;
            font-family: "DejaVu Sans", sans-serif;
            font-size: 7.5pt;
            color: #64748b;
            font-weight: bold;
            letter-spacing: 0.5px;
            z-index: 100;
        }

        .inner-content {
            position: absolute;
            top: 20mm;
            left: 20mm;
            width: 239mm;
            height: 175mm;
            z-index: 10;
            text-align: center;
        }

        /* ─── Header ─── */
        .header {
            position: absolute;
            top: 10mm;
            left: 0;
            width: 100%;
            text-align: center;
        }

        .header-top {
            font-size: 10.5pt;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #475569;
            font-weight: bold;
        }

        .header-sub {
            font-size: 7.5pt;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #94a3b8;
            margin-top: 4px;
            font-weight: 500;
        }

        /* ─── Title ─── */
        .cert-title {
            position: absolute;
            top: 38mm;
            left: 0;
            width: 100%;
            font-size: 26pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: {{ $titleColor }};
            line-height: 1.2;
        }

        /* ─── Body ─── */
        .cert-body {
            position: absolute;
            top: 72mm;
            left: 5%;
            width: 90%;
            font-size: 10.5pt;
            line-height: 1.85;
            color: #475569;
            text-align: center;
        }

        .student-name {
            font-size: 14pt;
            font-weight: bold;
            color: #0f172a;
            font-family: "DejaVu Serif", Georgia, serif;
            display: inline-block;
            margin: 0 3px;
        }

        .highlight {
            font-weight: bold;
            color: #0f172a;
        }

        /* ─── Signatories ─── */
        .signatory-table {
            position: absolute;
            top: 126mm;
            left: 0;
            width: 100%;
            border-collapse: collapse;
            border: none;
        }

        .signatory-table td {
            vertical-align: bottom;
            border: none;
        }

        .sig-col {
            width: 80mm;
            text-align: center;
        }

        .spacer-col {
            width: 79mm;
        }

        .date-col {
            width: 80mm;
            text-align: center;
        }

        .sig-name-mock {
            font-size: 20pt;
            font-style: italic;
            color: {{ $sigColor }};
            font-family: "DejaVu Sans", sans-serif;
            margin-bottom: 2px;
            height: 25px;
            line-height: 25px;
        }

        .sig-line {
            border-top: 1px solid #cbd5e1;
            width: 60mm;
            margin: 0 auto 6px auto;
        }

        .sig-name {
            font-size: 8.5pt;
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
            letter-spacing: 0.5px;
        }

        .sig-title-text {
            font-size: 7pt;
            color: #64748b;
            margin-top: 1px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .date-val {
            font-size: 9.5pt;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 7px;
            height: 25px;
            line-height: 25px;
        }

        .date-line {
            border-top: 1px solid #cbd5e1;
            width: 60mm;
            margin: 0 auto 6px auto;
        }
    </style>
</head>
<body>
@foreach($students as $std)
<div class="page">
    @if($template->bg_image)
    {{-- Custom Background Image Design (Robust Dompdf img-tag scaling) --}}
    <img class="bg-image-design" src="{{ public_path($template->bg_image) }}" />
    @else
    {{-- Double-border frame --}}
    <div class="border-frame"></div>

    {{-- Watermark Emblem --}}
    <div class="watermark">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
            <!-- Three stacked isometric diamonds, representing layered premium credentials -->
            <path d="M 100,30 L 160,60 L 100,90 L 40,60 Z" fill="#6366f1" opacity="0.05"/>
            <path d="M 100,65 L 160,95 L 100,125 L 40,95 Z" fill="#6366f1" opacity="0.05"/>
            <path d="M 100,100 L 160,130 L 100,160 L 40,130 Z" fill="#6366f1" opacity="0.05"/>
        </svg>
    </div>
    @endif



    <div class="inner-content">
        {{-- Header --}}
        <div class="header">
            <div class="header-top">Davao del Norte State College</div>
            <div class="header-sub">National Service Training Program</div>
        </div>

        {{-- Certificate Title --}}
        <h1 class="cert-title">{{ $template->title_text }}</h1>

        {{-- Body Text --}}
        <div class="cert-body">{!! $std['bodyHtml'] !!}</div>

        {{-- Signatories Table --}}
        <table class="signatory-table">
            <tr>
                <td class="sig-col">
                    <div class="sig-name-mock">{{ $sigInitials }}</div>
                    <div class="sig-line"></div>
                    <div class="sig-name">{{ $template->signatory_name }}</div>
                    <div class="sig-title-text">{{ $template->signatory_title }}</div>
                </td>
                <td class="spacer-col"></td>
                <td class="date-col">
                    <div class="date-val">{{ $issuedDate }}</div>
                    <div class="date-line"></div>
                    <div class="sig-title-text">Date Issued</div>
                </td>
            </tr>
        </table>
    </div>
</div>
@endforeach
</body>
</html>
