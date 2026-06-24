<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    protected $fillable = ['name', 'template_file', 'expected_columns'];

    protected $casts = [
        'expected_columns' => 'array',
    ];

    /** Always-required columns for every template's Excel import. */
    public const BASE_COLUMNS = [
        ['key' => 'name',  'label' => 'Name',  'required' => true],
        ['key' => 'email', 'label' => 'Email', 'required' => true],
        ['key' => 'usn',   'label' => 'USN',   'required' => true],
        ['key' => 'phone', 'label' => 'Phone', 'required' => true],
    ];

    public function editions(): HasMany
    {
        return $this->hasMany(EventEdition::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    /**
     * Base columns + this template's custom columns, in import-validation order.
     *
     * @return array<int, array{key: string, label: string, required: bool}>
     */
    public function fullExpectedColumns(): array
    {
        return array_merge(self::BASE_COLUMNS, $this->expected_columns ?? []);
    }
}
