<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\Auditable;

class Service extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'name',
        'category',
        'price',
        'duration',
        'image',
        'description',
        'status',
    ];
}
