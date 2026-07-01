<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailLog extends Model
{
    protected $fillable = [
        'sent_by',
        'batch_id',
        'event_id',
        'event_edition_id',
        'participant_id',
        'to_address',
        'to_name',
        'subject',
        'status',
        'error_message',
        'sent_at',
        'bounced_at',
    ];

    protected $casts = [
        'sent_at'    => 'datetime',
        'bounced_at' => 'datetime',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function edition(): BelongsTo
    {
        return $this->belongsTo(EventEdition::class, 'event_edition_id');
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }
}
