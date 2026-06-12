<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventEdition extends Model
{
    protected $fillable = ['event_id', 'year'];

    protected $casts = [
        'year' => 'integer',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function templates(): BelongsToMany
    {
        return $this->belongsToMany(Template::class, 'event_edition_template');
    }

    public function logos(): BelongsToMany
    {
        return $this->belongsToMany(Logo::class, 'event_edition_logo');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class, 'event_edition_id');
    }
}
