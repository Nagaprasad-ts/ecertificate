<?php

namespace App\Providers;

use App\Models\Template;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->syncTemplatesFromManifest();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function syncTemplatesFromManifest(): void
    {
        $manifest = storage_path('app/template-manifest.json');

        if (! file_exists($manifest)) {
            return;
        }

        // Only re-sync when the manifest file actually changes (compare mtime)
        $mtime = filemtime($manifest);

        if (Cache::get('template_manifest_mtime') === $mtime) {
            return;
        }

        try {
            $templates = json_decode(file_get_contents($manifest), true);

            foreach ($templates as $tpl) {
                Template::updateOrCreate(
                    ['template_file' => $tpl['templateFile']],
                    ['name'          => $tpl['name']],
                );
            }

            Cache::forever('template_manifest_mtime', $mtime);
        } catch (\Throwable) {
            // DB not ready yet (e.g., before first migration) — skip silently
        }
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
