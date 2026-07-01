<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // gated by HasMiddleware on ParticipantController
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255'],
            'usn'      => ['nullable', 'string', 'max:100'],
            'phone_no' => ['nullable', 'string', 'max:20'],
        ];
    }
}
