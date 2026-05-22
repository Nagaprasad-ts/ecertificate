<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportBatch extends Model
{
    protected $primaryKey = 'batch_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'batch_id',
        'event_id',
        'template_id',
        'imported_by',
        'participant_count',
        'failed_count',
        'email_window_from',
        'email_window_to',
    ];

    protected $casts = [
        'email_window_from' => 'datetime',
        'email_window_to'   => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    /** True only if current time falls within the admin-set window. */
    public function isEmailWindowActive(): bool
    {
        if (! $this->email_window_from || ! $this->email_window_to) {
            return false;
        }

        return now()->between($this->email_window_from, $this->email_window_to);
    }

    /** Human-readable window status for the frontend. */
    public function windowStatus(): string
    {
        if (! $this->email_window_from || ! $this->email_window_to) {
            return 'not_set';
        }

        $now = now();

        if ($now->lt($this->email_window_from)) {
            return 'upcoming';
        }

        if ($now->between($this->email_window_from, $this->email_window_to)) {
            return 'active';
        }

        return 'expired';
    }
}
