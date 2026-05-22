<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    protected $fillable = ['name', 'template_file'];

    public function editions(): HasMany
    {
        return $this->hasMany(EventEdition::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }
}
