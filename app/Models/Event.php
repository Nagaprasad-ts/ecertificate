<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = ['event_name', 'logo'];

    public function editions(): HasMany
    {
        return $this->hasMany(EventEdition::class);
    }

    /**
     * Two-letter uppercase initials for use when no logo is uploaded.
     */
    protected function initials(): Attribute
    {
        return Attribute::make(
            get: function (): string {
                $name = trim((string) $this->event_name);
                if ($name === '') {
                    return '??';
                }
                $parts = preg_split('/\s+/', $name);
                if (count($parts) >= 2) {
                    return strtoupper(mb_substr($parts[0], 0, 1) . mb_substr($parts[1], 0, 1));
                }
                return strtoupper(mb_substr($name, 0, 2));
            },
        );
    }
}
