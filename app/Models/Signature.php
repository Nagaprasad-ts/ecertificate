<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signature extends Model
{
    protected $fillable = ['name', 'designation', 'signature', 'resignation_date'];

    protected $casts = [
        'resignation_date' => 'date',
    ];
}
