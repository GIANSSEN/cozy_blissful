<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'therapist_id',
        'service_id',
        'datetime',
        'status',
        'notes',
        'reminder_24h_sent_at',
        'reminder_2h_sent_at',
    ];

    protected $casts = [
        'datetime' => 'datetime',
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
