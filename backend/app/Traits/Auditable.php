<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            static::logModelEvent('create', $model, 'Created');
        });

        static::updated(function ($model) {
            static::logModelEvent('update', $model, 'Updated');
        });

        static::deleted(function ($model) {
            static::logModelEvent('delete', $model, 'Deleted');
        });
    }

    protected static function logModelEvent(string $action, $model, string $verb): void
    {
        try {
            $user = Auth::user();
            $actorName = $user ? $user->name : 'System';
            $actorRole = $user ? ($user->getRoleNames()->first() ?? 'user') : 'system';

            $modelName = class_basename($model);
            $entityName = match ($modelName) {
                'Appointment' => 'Appointment #' . $model->id,
                'Service'     => 'Service Catalog',
                'User'        => 'User Account',
                'TherapistAvailability' => 'Therapist Schedule',
                default       => $modelName,
            };

            $moduleName = match ($modelName) {
                'Appointment' => 'Bookings',
                'Service'     => 'Services',
                'User'        => 'User Management',
                'TherapistAvailability' => 'Schedule',
                default       => 'System',
            };

            $changes = [];
            if ($action === 'update') {
                $dirty = $model->getDirty();
                foreach ($dirty as $key => $newValue) {
                    if (in_array($key, ['updated_at', 'remember_token', 'password'])) {
                        continue;
                    }
                    $oldValue = $model->getOriginal($key);
                    $changes[$key] = [
                        'old' => $oldValue,
                        'new' => $newValue,
                    ];
                }
                $changedKeys = implode(', ', array_keys($changes));
                $detail = "{$verb} {$modelName} #{$model->id}" . ($changedKeys ? " — changed: {$changedKeys}" : '');
            } elseif ($action === 'create') {
                $detail = "{$verb} {$modelName} #{$model->id}";
                $changes = array_diff_key($model->toArray(), array_flip(['created_at', 'updated_at', 'password']));
            } else {
                $detail = "{$verb} {$modelName} #{$model->id}";
                $changes = ['id' => $model->id];
            }

            $severity = match ($action) {
                'delete' => 'danger',
                'update' => 'warning',
                default  => 'info',
            };

            AuditLog::create([
                'actor'      => $actorName,
                'actor_role' => $actorRole,
                'action'     => $action,
                'entity'     => $entityName,
                'module'     => $moduleName,
                'detail'     => $detail,
                'ip_address' => request()?->ip() ?? '127.0.0.1',
                'session_id' => session()?->getId() ?? ('sess_' . substr(md5(microtime()), 0, 8)),
                'severity'   => $severity,
                'metadata'   => $changes,
            ]);
        } catch (\Throwable $e) {
            // Prevent audit log errors from interrupting core database transactions
            \Illuminate\Support\Facades\Log::error('Auditable Trait Error: ' . $e->getMessage());
        }
    }
}
