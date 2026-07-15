<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$plan = App\Models\ActivityPlan::find(29);
if ($plan) {
    echo "Plan 29:\n";
    echo "ID: " . $plan->id . "\n";
    echo "Title: " . $plan->title . "\n";
    echo "Section ID: " . $plan->section_id . "\n";
    echo "Section Name: " . ($plan->section ? $plan->section->section_name : 'null') . "\n";
    echo "Status: " . $plan->status . "\n";
    echo "Instructor ID: " . $plan->instructor_id . "\n";
    echo "Feedback: " . $plan->feedback . "\n";
} else {
    echo "Plan 29 not found.\n";
}

$report = App\Models\AccomplishmentReport::where('activity_plan_id', 29)->first();
if ($report) {
    echo "\nAssociated Report:\n";
    echo "ID: " . $report->id . "\n";
    echo "Title: " . $report->title . "\n";
    echo "Section ID: " . $report->section_id . "\n";
    echo "Section Name: " . ($report->section ? $report->section->section_name : 'null') . "\n";
    echo "Status: " . $report->status . "\n";
    echo "Instructor ID: " . $report->instructor_id . "\n";
    echo "Feedback: " . $report->feedback . "\n";
} else {
    echo "\nNo report found for plan 29.\n";
}
