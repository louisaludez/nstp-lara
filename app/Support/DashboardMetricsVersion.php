<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class DashboardMetricsVersion
{
    public const CACHE_KEY = 'dashboard_metrics_version';

    public static function current(): int
    {
        return (int) Cache::get(self::CACHE_KEY, 0);
    }

    public static function bump(): int
    {
        $next = self::current() + 1;
        Cache::forever(self::CACHE_KEY, $next);

        return $next;
    }
}
