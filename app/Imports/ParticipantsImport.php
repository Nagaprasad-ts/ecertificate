<?php

namespace App\Imports;

use App\Models\EventEdition;
use App\Models\Participant;
use App\Models\Template;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ParticipantsImport implements ToCollection, WithHeadingRow
{
    private int $count = 0;

    private int $rowNumber = 1; // row 1 is the header; data starts at row 2

    /** Excel header key => Participant DB column, for the four base fields. */
    private array $coreFieldMap = [
        'name'  => 'name',
        'email' => 'email',
        'usn'   => 'usn',
        'phone' => 'phone_no',
    ];

    /** @var array<int, array{key: string, label: string, required: bool}> */
    private array $schema;

    /** @var array<int, array{row: int, name: string, email: string, reason: string}> */
    private array $failedRows = [];

    /** @var array<int, string> File-level errors (missing/unknown columns) that abort the whole import. */
    private array $schemaErrors = [];

    public function __construct(
        private int $editionId,
        private int $templateId,
        private EventEdition $edition,
        private string $batchId,
    ) {
        $this->schema = Template::find($templateId)?->fullExpectedColumns() ?? [];
    }

    public function collection(Collection $rows): void
    {
        if ($rows->isEmpty()) {
            return;
        }

        // Filter out blank or purely-numeric keys — Excel often appends empty trailing columns
        // that the heading-row parser converts to their column index (e.g. 5, 6).
        $headerKeys = array_values(array_filter(
            $rows->first()->keys()->all(),
            fn ($k) => is_string($k) && $k !== '' && ! is_numeric($k),
        ));
        $this->schemaErrors = $this->validateHeaders($headerKeys);

        if (! empty($this->schemaErrors)) {
            return; // Don't process any rows when the file structure doesn't match the template.
        }

        foreach ($rows as $row) {
            $this->rowNumber++;
            $row = array_map(fn ($v) => is_string($v) ? trim($v) : $v, $row->toArray());

            $name  = $row['name']  ?? '';
            $email = $row['email'] ?? '';

            // Skip completely blank rows silently
            if ($name === '' && $email === '') {
                continue;
            }

            if ($rowError = $this->validateRow($row)) {
                $this->failedRows[] = [
                    'row'    => $this->rowNumber,
                    'name'   => $name,
                    'email'  => $email,
                    'reason' => $rowError,
                ];
                continue;
            }

            // Custom (non-core) columns → JSON data field
            $extra = array_filter(
                array_diff_key($row, array_flip(array_keys($this->coreFieldMap))),
                fn ($v) => $v !== null && $v !== '',
            );

            Participant::create([
                'event_edition_id' => $this->editionId,
                'event_id'         => $this->edition->event_id,
                'template_id'      => $this->templateId,
                'name'             => $name,
                'email'            => $email,
                'usn'              => $row['usn']   ?? null,
                'phone_no'         => $row['phone'] ?? null,
                'certificate_no'   => Participant::generateCertificateNo($this->edition),
                'data'             => empty($extra) ? null : $extra,
                'status'           => 'pending',
                'batch_id'         => $this->batchId,
            ]);

            $this->count++;
        }
    }

    /**
     * @param  array<int, string>  $headerKeys
     * @return array<int, string>
     */
    private function validateHeaders(array $headerKeys): array
    {
        $errors = [];

        $requiredKeys = array_column(array_filter($this->schema, fn ($c) => $c['required']), 'key');
        $allowedKeys  = array_column($this->schema, 'key');

        $missing = array_diff($requiredKeys, $headerKeys);
        $unknown = array_diff($headerKeys, $allowedKeys);

        if (! empty($missing)) {
            $errors[] = 'Missing required column(s): ' . implode(', ', $missing);
        }

        if (! empty($unknown)) {
            $errors[] = 'Unexpected column(s) not defined for this template: ' . implode(', ', $unknown);
        }

        return $errors;
    }

    private function validateRow(array $row): ?string
    {
        foreach ($this->schema as $column) {
            if (! $column['required']) {
                continue;
            }

            $value = $row[$column['key']] ?? '';

            if ($value === '' || $value === null) {
                return "{$column['label']} is required";
            }
        }

        if (! filter_var($row['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
            return 'Invalid email address';
        }

        return null;
    }

    public function count(): int
    {
        return $this->count;
    }

    /** @return array<int, array{row: int, name: string, email: string, reason: string}> */
    public function failures(): array
    {
        return $this->failedRows;
    }

    /** @return array<int, string> */
    public function schemaErrors(): array
    {
        return $this->schemaErrors;
    }
}