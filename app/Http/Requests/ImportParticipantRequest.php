<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by HasMiddleware on ParticipantController
    }

    public function rules(): array
    {
        return [
            'event_edition_id' => ['required', 'exists:event_editions,id'],
            'template_id' => ['required', 'exists:templates,id'],
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ];
    }
}
