<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TherapistAvailability extends Model
{
    use HasFactory;

    protected $table = 'therapist_availabilities';

    protected $fillable = [
        'therapist_id',
        'date',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function therapist()
    {
        return $this->belongsTo(User::class, 'therapist_id');
    }
}
