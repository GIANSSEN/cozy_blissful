<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'actor',
        'actor_role',
        'action',
        'entity',
        'module',
        'detail',
        'ip_address',
        'session_id',
        'severity',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Helper: log an audit event anywhere in the app.
     */
    public static function log(
        string $action,
        string $entity,
        string $detail,
        array  $options = []
    ): self {
        return static::create([
            'actor'      => $options['actor']      ?? 'System',
            'actor_role' => $options['actor_role'] ?? 'system',
            'action'     => $action,
            'entity'     => $entity,
            'module'     => $options['module']     ?? null,
            'detail'     => $detail,
            'ip_address' => $options['ip']         ?? request()->ip(),
            'session_id' => $options['session']    ?? session()->getId(),
            'severity'   => $options['severity']   ?? 'info',
            'metadata'   => $options['metadata']   ?? null,
        ]);
    }
}
