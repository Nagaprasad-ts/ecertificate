<?php

namespace App\Imports;

use App\Models\EventEdition;
use App\Models\Participant;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ParticipantsImport implements ToCollection, WithHeadingRow
{
    private int $count = 0;

    private int $rowNumber = 1; // row 1 is the header; data starts at row 2

    private array $coreFields = ['name', 'email', 'usn', 'phone'];

    /** @var array<int, array{row: int, name: string, email: string, reason: string}> */
    private array $failedRows = [];

    public function __construct(
        private int $editionId,
        private int $templateId,
        private EventEdition $edition,
        private string $batchId,
    ) {}

    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            $this->rowNumber++;
            $row = array_map(fn ($v) => is_string($v) ? trim($v) : $v, $row->toArray());

            $name  = $row['name']  ?? '';
            $email = $row['email'] ?? '';

            // Skip completely blank rows silently
            if ($name === '' && $email === '') {
                continue;
            }

            // Validate name
            if ($name === '') {
                $this->failedRows[] = [
                    'row'    => $this->rowNumber,
                    'name'   => '',
                    'email'  => $email,
                    'reason' => 'Name is required',
                ];
                continue;
            }

            // Validate email present
            if ($email === '') {
                $this->failedRows[] = [
                    'row'    => $this->rowNumber,
                    'name'   => $name,
                    'email'  => '',
                    'reason' => 'Email is required',
                ];
                continue;
            }

            // Validate email format
            if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->failedRows[] = [
                    'row'    => $this->rowNumber,
                    'name'   => $name,
                    'email'  => $email,
                    'reason' => 'Invalid email address',
                ];
                continue;
            }

            // Extra columns → JSON data field
            $extra = array_filter(
                array_diff_key($row, array_flip($this->coreFields)),
                fn ($v) => $v !== null && $v !== '',
            );

            Participant::create([
                'event_edition_id' => $this->editionId,
                'template_id'      => $this->templateId,
                'name'           => $name,
                'email'          => $email,
                'usn'            => $row['usn'] ?? null,
                'phone_no'       => $row['phone'] ?? null,
                'certificate_no' => Participant::generateCertificateNo($this->edition),
                'data'           => empty($extra) ? null : $extra,
                'status'         => 'pending',
                'batch_id'       => $this->batchId,
            ]);

            $this->count++;
        }
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
}
