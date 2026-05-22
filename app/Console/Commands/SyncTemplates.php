<?php

namespace App\Console\Commands;

use App\Models\Template;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Symfony\Component\Finder\Finder;

class SyncTemplates extends Command
{
    protected $signature   = 'templates:sync';
    protected $description = 'Scan certificate-templates directory and sync to the templates table';

    public function handle(): int
    {
        $baseDir = resource_path('js/certificate-templates');

        if (! is_dir($baseDir)) {
            $this->error("Directory not found: {$baseDir}");
            return self::FAILURE;
        }

        $finder = Finder::create()
            ->files()
            ->in($baseDir)
            ->name('*.tsx')
            ->notName('_*')     // skip files like _base.tsx
            ->notPath('**/types.ts');

        $synced  = 0;
        $skipped = 0;

        foreach ($finder as $file) {
            $relativePath = $file->getRelativePath(); // e.g. "sargam"
            $basename     = $file->getFilenameWithoutExtension(); // e.g. "Winners"

            // Skip files at the root of certificate-templates (no event folder)
            if (empty($relativePath)) {
                $this->line("  <fg=yellow>skip</> {$basename} (no event subfolder)");
                $skipped++;
                continue;
            }

            // template_file stored as "sargam/Winners" (preserves original case for import)
            $templateFile = $relativePath . '/' . $basename;

            // Human-readable name: "Sargam — Winners"
            $eventLabel    = Str::headline($relativePath);
            $templateLabel = Str::headline($basename);
            $name          = "{$eventLabel} — {$templateLabel}";

            Template::updateOrCreate(
                ['template_file' => $templateFile],
                ['name' => $name],
            );

            $this->line("  <fg=green>✓</> {$name}  →  {$templateFile}");
            $synced++;
        }

        $this->newLine();
        $this->info("Synced {$synced} template(s). Skipped {$skipped}.");

        return self::SUCCESS;
    }
}
