<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ACCOMPLISHMENT REPORTS ===\n";
foreach(App\Models\AccomplishmentReport::all() as $r) {
    echo "ID: {$r->id} | Title: {$r->title} | Status: {$r->status} | Section ID: {$r->section_id} | Feedback: {$r->feedback}\n";
}
