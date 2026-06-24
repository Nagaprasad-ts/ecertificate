<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = ['event_name', 'logo', 'archived_at'];

    protected $casts = ['archived_at' => 'datetime'];

    public function editions(): HasMany
    {
        return $this->hasMany(EventEdition::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->whereNotNull('archived_at');
    }

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
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
