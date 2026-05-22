<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Logo extends Model
{
    protected $fillable = ['year', 'logo_name', 'logo'];

    protected $casts = [
        'year' => 'integer',
    ];
}
