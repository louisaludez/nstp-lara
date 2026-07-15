<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

echo "AccomplishmentReport columns:\n";
print_r(Schema::getColumnListing('accomplishment_reports'));

echo "\nActivityPlan columns:\n";
print_r(Schema::getColumnListing('activity_plans'));
