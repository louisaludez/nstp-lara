<?php

namespace App\Http\Controllers;

use App\Services\DashboardMetricsService;
use App\Support\DashboardMetricsVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardMetricsService $metrics
    ) {}

  /**
     * GET /api/dashboard/metrics?role=coordinator
     */
    public function metrics(Request $request): JsonResponse
    {
        $role = $this->normalizeRole($request->query('role', 'coordinator'));

        return response()->json($this->metrics->forRole($role));
    }

  /**
     * GET /api/dashboard/stream?role=coordinator
     * Server-Sent Events: pushes fresh metrics when the DB changes.
     */
    public function stream(Request $request): StreamedResponse
    {
        $role = $this->normalizeRole($request->query('role', 'coordinator'));

        return response()->stream(function () use ($role) {
            @set_time_limit(0);

            $lastVersion = -1;
            $started = time();
            $maxSeconds = 300;

            while (! connection_aborted() && (time() - $started) < $maxSeconds) {
                $version = DashboardMetricsVersion::current();

                if ($version !== $lastVersion) {
                    $payload = $this->metrics->forRole($role);
                    $this->sendEvent('metrics', [
                        'version' => $version,
                        'payload' => $payload,
                    ]);
                    $lastVersion = $version;
                } else {
                    echo ": heartbeat\n\n";
                }

                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();

                sleep(2);
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-store, must-revalidate',
            'Connection'        => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    private function sendEvent(string $event, array $data): void
    {
        echo 'event: '.$event."\n";
        echo 'data: '.json_encode($data, JSON_UNESCAPED_UNICODE)."\n\n";
    }

    private function normalizeRole(?string $role): string
    {
        $role = strtolower((string) $role);

        return match ($role) {
            'instructor', 'rotc', 'rotcofficer', 'admin', 'coordinator' => $role === 'rotc' ? 'rotcofficer' : $role,
            default => 'coordinator',
        };
    }
}
