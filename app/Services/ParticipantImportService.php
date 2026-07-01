<?php

namespace App\Services;

use App\Imports\ParticipantsImport;
use App\Jobs\SendCertificateEmail;
use App\Models\EventEdition;
use App\Models\ImportBatch;
use App\Models\Participant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class ParticipantImportService
{
    /**
     * Create a batch, run the Excel import, and persist counts.
     *
     * Returns the new batchId on success, or a non-empty schemaErrors array on failure.
     * The caller is responsible for deleting the batch record on schema failure via the returned batchId.
     *
     * @return array{batchId: string, schemaErrors: string[]}
     */
    public function processImport(EventEdition $edition, int $templateId, UploadedFile $file): array
    {
        $batchId = (string) Str::uuid();

        ImportBatch::create([
            'batch_id' => $batchId,
            'event_id' => $edition->event_id,
            'event_edition_id' => $edition->id,
            'template_id' => $templateId,
            'imported_by' => Auth::id(),
        ]);

        $import = new ParticipantsImport((int) $edition->id, $templateId, $edition, $batchId, Auth::id());
        Excel::import($import, $file);

        if (! empty($import->schemaErrors())) {
            ImportBatch::destroy($batchId);

            return ['batchId' => $batchId, 'schemaErrors' => $import->schemaErrors()];
        }

        ImportBatch::findOrFail($batchId)->update([
            'participant_count' => $import->count(),
            'failed_count' => count($import->failures()),
            'failures' => $import->failures(),
        ]);

        return ['batchId' => $batchId, 'schemaErrors' => []];
    }

    /**
     * Wipe existing pending rows and re-run the import under the same batch_id.
     *
     * @return array{schemaErrors: string[]}
     */
    public function processReImport(ImportBatch $batch, UploadedFile $file): array
    {
        $batchId = $batch->batch_id;
        $editionId = Participant::pending()->forBatch($batchId)->value('event_edition_id');

        if (! $editionId) {
            return ['schemaErrors' => ['No pending rows found for this batch.']];
        }

        /** @var EventEdition $edition */
        $edition = EventEdition::with('event')->findOrFail($editionId);

        Participant::pending()->forBatch($batchId)->delete();

        $import = new ParticipantsImport((int) $editionId, (int) $batch->template_id, $edition, $batchId, Auth::id());
        Excel::import($import, $file);

        if (! empty($import->schemaErrors())) {
            return ['schemaErrors' => $import->schemaErrors()];
        }

        $batch->update([
            'participant_count' => $import->count(),
            'failed_count' => count($import->failures()),
            'failures' => $import->failures(),
        ]);

        return ['schemaErrors' => []];
    }

    /**
     * Flip pending participants to active and dispatch certificate emails.
     *
     * Returns the number of emails queued.
     */
    public function confirmAndDispatch(ImportBatch $batch): int
    {
        $batchId = $batch->batch_id;
        $participants = Participant::pending()->forBatch($batchId)->get();

        Participant::pending()->forBatch($batchId)->update(['status' => 'active']);

        $sentBy = $batch->imported_by;

        foreach ($participants as $participant) {
            SendCertificateEmail::dispatch($participant, $batchId, $sentBy);
        }

        return $participants->count();
    }

    /**
     * Delete all pending rows for the batch and remove the batch record.
     *
     * Returns the number of pending participants removed.
     */
    public function discardBatch(string $batchId): int
    {
        $count = Participant::pending()->forBatch($batchId)->count('*');
        Participant::pending()->forBatch($batchId)->delete();
        ImportBatch::destroy($batchId);

        return $count;
    }

    /**
     * Delete all participants (any status) belonging to the batch and remove the batch record.
     *
     * Returns the number of participants removed.
     */
    public function deleteBatch(ImportBatch $batch): int
    {
        $batchId = $batch->batch_id;
        $count = Participant::forBatch($batchId)->count('*');

        Participant::forBatch($batchId)->delete();
        $batch->delete();

        return $count;
    }

    /**
     * Persist the email delivery window on the batch.
     */
    public function setEmailWindow(ImportBatch $batch, string $from, string $to): void
    {
        $batch->update([
            'email_window_from' => $from,
            'email_window_to' => $to,
        ]);
    }
}
