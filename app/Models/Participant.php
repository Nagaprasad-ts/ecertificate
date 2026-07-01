<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

/**
 * @method bool|null delete()
 */
class Participant extends Model
{
    protected $fillable = [
        'created_by',
        'event_id',
        'event_edition_id',
        'template_id',
        'name',
        'email',
        'usn',
        'phone_no',
        'certificate_no',
        'data',
        'status',
        'batch_id',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function scopeForBatch(Builder $query, string $batchId): Builder
    {
        return $query->where('batch_id', '=', $batchId);
    }

    /** Only confirmed participants (email sent). */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /** Pending import batch — email not yet sent. */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function edition(): BelongsTo
    {
        return $this->belongsTo(EventEdition::class, 'event_edition_id');
    }

    /**
     * Convenience hop: participant → edition → event.
     */
    public function event(): HasOneThrough
    {
        return $this->hasOneThrough(
            Event::class,
            EventEdition::class,
            'id',                // FK on event_editions table (the local pk we match)
            'id',                // FK on events table (its pk)
            'event_edition_id',  // local key on participants
            'event_id',          // local key on event_editions
        );
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Generates certificate_no as: {slug}-{year}-{hex}
     * e.g. "hackathon-2026-1a2b3c"
     */
    public static function generateCertificateNo(EventEdition $edition): string
    {
        $eventName = $edition->event?->event_name ?? 'event';
        $slug = str($eventName)->slug()->toString();

        do {
            $hex = sprintf('%06x', random_int(0, 0xFFFFFF));
            $no  = "{$slug}-{$edition->year}-{$hex}";
        } while (static::where('certificate_no', $no)->exists());

        return $no;
    }
}
