<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Support\DashboardMetricsVersion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    /**
     * POST /api/audit
     * Called by the frontend whenever a user performs an action.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username'    => 'nullable|string|max:255',
            'user_email'  => 'nullable|string|max:255',
            'role'        => 'nullable|string|max:64',
            'action'      => 'required|string|max:128',
            'action_type' => 'nullable|string|max:64',
            'module'      => 'required|string|max:128',
            'target'      => 'nullable|string|max:1000',
            'details'     => 'nullable|string|max:2000',
        ]);

        $log = AuditLog::create([
            'username'    => $data['username']    ?? null,
            'user_email'  => $data['user_email']  ?? null,
            'role'        => $data['role']         ?? null,
            'action'      => $data['action'],
            'action_type' => $data['action_type'] ?? 'edit',
            'module'      => $data['module'],
            'target'      => $data['target']       ?? null,
            'details'     => $data['details']      ?? null,
            'performed_at' => now(),
        ]);

        if (($data['role'] ?? '') !== 'admin') {
            DashboardMetricsVersion::bump();
        }

        return response()->json(['success' => true, 'id' => $log->id], 201);
    }

    /**
     * GET /api/audit
     * Returns paginated audit logs, newest first.
     * Supports ?search=, ?type=, ?module=, ?limit=
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->orderBy('performed_at', 'desc');

        if ($search = $request->query('search')) {
            $q = "%{$search}%";
            $query->where(function ($q2) use ($q) {
                $q2->where('username',   'like', $q)
                   ->orWhere('target',   'like', $q)
                   ->orWhere('action',   'like', $q)
                   ->orWhere('module',   'like', $q)
                   ->orWhere('details',  'like', $q);
            });
        }

        if ($type = $request->query('type')) {
            $query->where('action_type', $type);
        }

        if ($module = $request->query('module')) {
            $query->where('module', $module);
        }

        $limit = min((int) $request->query('limit', 100), 500);
        $logs  = $query->limit($limit)->get();

        // Transform to the shape the frontend expects
        $formatted = $logs->map(function (AuditLog $log) {
            return [
                'id'          => $log->id,
                'actor'       => $log->username ?? $log->user_email ?? 'System',
                'email'       => $log->user_email,
                'role'        => $log->role,
                'action'      => $log->action,
                'type'        => $log->action_type,
                'module'      => $log->module,
                'target'      => $log->target,
                'details'     => $log->details,
                'time'        => $log->performed_at
                    ? $log->performed_at->timezone('Asia/Manila')
                                        ->format('M j, Y  g:i A')
                    : null,
                'performed_at' => $log->performed_at?->toIso8601String(),
            ];
        });

        return response()->json($formatted);
    }
}
