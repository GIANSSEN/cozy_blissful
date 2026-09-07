<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\Auditable;

class Appointment extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'client_id',
        'therapist_id',
        'service_id',
        'datetime',
        'status',
        'notes',
        'payment_status',
        'payment_method',
        'paymongo_session_id',
        'amount_paid',
        'paid_at',
        'reminder_24h_sent_at',
        'reminder_2h_sent_at',
    ];

    protected $casts = [
        'datetime' => 'datetime',
        'paid_at' => 'datetime',
        'amount_paid' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function therapist()
    {
        return $this->belongsTo(User::class, 'therapist_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
}
