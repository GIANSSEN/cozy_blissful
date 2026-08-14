<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuditLogController extends Controller
{
    /* ─── GET /admin/audit-logs ──────────────────────────────────────── */
    public function index(Request $request)
    {
        $query = AuditLog::query()->latest();

        // Search
        if ($q = $request->input('search')) {
            $query->where(function ($qb) use ($q) {
                $qb->where('actor',  'like', "%{$q}%")
                   ->orWhere('entity', 'like', "%{$q}%")
                   ->orWhere('detail', 'like', "%{$q}%")
                   ->orWhere('module', 'like', "%{$q}%")
                   ->orWhere('ip_address', 'like', "%{$q}%");
            });
        }

        // Filters
        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }
        if ($role = $request->input('role')) {
            $query->where('actor_role', $role);
        }
        if ($module = $request->input('module')) {
            $query->where('module', $module);
        }
        if ($severity = $request->input('severity')) {
            $query->where('severity', $severity);
        }

        // Date range
        if ($from = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        // Sort
        $sort = $request->input('sort', 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy('created_at', $sort);

        $perPage = (int) $request->input('per_page', 10);
        $logs    = $query->paginate($perPage);

        // Stats
        $stats = AuditLog::selectRaw('action, count(*) as count')
            ->groupBy('action')
            ->pluck('count', 'action');

        // Distinct roles and modules for filter options
        $roles   = AuditLog::distinct()->pluck('actor_role');
        $modules = AuditLog::distinct()->whereNotNull('module')->pluck('module');

        return response()->json([
            'logs'    => $logs,
            'stats'   => $stats,
            'roles'   => $roles,
            'modules' => $modules,
        ]);
    }

    /* ─── GET /admin/audit-logs/{id} ────────────────────────────────── */
    public function show(AuditLog $auditLog)
    {
        return response()->json(['log' => $auditLog]);
    }

    /* ─── POST /admin/audit-logs ─────────────────────────────────────── */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'actor'      => 'required|string|max:255',
            'actor_role' => 'required|string|max:100',
            'action'     => 'required|in:create,update,delete,login,config,access',
            'entity'     => 'required|string|max:255',
            'module'     => 'nullable|string|max:100',
            'detail'     => 'required|string',
            'ip_address' => 'nullable|ip',
            'session_id' => 'nullable|string|max:255',
            'severity'   => 'nullable|in:info,warning,danger',
            'metadata'   => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $log = AuditLog::create($validator->validated() + [
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['log' => $log, 'message' => 'Log entry created.'], 201);
    }

    /* ─── PUT /admin/audit-logs/{id} ────────────────────────────────── */
    public function update(Request $request, AuditLog $auditLog)
    {
        $validator = Validator::make($request->all(), [
            'actor'      => 'sometimes|required|string|max:255',
            'actor_role' => 'sometimes|required|string|max:100',
            'action'     => 'sometimes|required|in:create,update,delete,login,config,access',
            'entity'     => 'sometimes|required|string|max:255',
            'module'     => 'nullable|string|max:100',
            'detail'     => 'sometimes|required|string',
            'ip_address' => 'nullable|ip',
            'session_id' => 'nullable|string|max:255',
            'severity'   => 'nullable|in:info,warning,danger',
            'metadata'   => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $auditLog->update($validator->validated());

        return response()->json(['log' => $auditLog, 'message' => 'Log entry updated.']);
    }

    /* ─── DELETE /admin/audit-logs/{id} ─────────────────────────────── */
    public function destroy(AuditLog $auditLog)
    {
        $auditLog->delete();
        return response()->json(['message' => 'Log entry deleted.']);
    }

    /* ─── DELETE /admin/audit-logs (bulk delete) ─────────────────────── */
    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);
        $deleted = AuditLog::whereIn('id', $request->ids)->delete();
        return response()->json(['message' => "{$deleted} entries deleted."]);
    }

    /* ─── GET /admin/audit-logs/export ──────────────────────────────── */
    public function export(Request $request)
    {
        $logs = AuditLog::latest()->get();

        $csv  = "ID,Actor,Role,Action,Entity,Module,Detail,IP,Session,Severity,Created At\n";
        foreach ($logs as $l) {
            $detail = str_replace('"', '""', $l->detail);
            $csv   .= "{$l->id},{$l->actor},{$l->actor_role},{$l->action},{$l->entity},{$l->module},\"{$detail}\",{$l->ip_address},{$l->session_id},{$l->severity},{$l->created_at}\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="audit_logs_' . now()->format('Y-m-d') . '.csv"',
        ]);
    }
}
