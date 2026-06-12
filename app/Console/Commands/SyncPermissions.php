<?php

namespace App\Console\Commands;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class SyncPermissions extends Command
{
    protected $signature   = 'permissions:sync {--dry-run : Preview changes without writing to the database} {--prune-orphans : Delete permissions that are no longer discovered}';
    protected $description = 'Auto-discover resource routes, create permission rows, and give super_admin all of them.';

    // ── Skip prefixes ─────────────────────────────────────────────────────────
    //
    // Route names starting with these are excluded from auto-discovery.
    // (super_admin-only areas and non-page routes)

    private const SKIP_PREFIXES = ['admin.', 'settings.'];

    // ── Manual resources ──────────────────────────────────────────────────────
    //
    // Resources with no Route::resource() (no .index route) that still need
    // permission rows. List only the actions that actually exist.
    //
    // Format:  'resource-slug' => ['action', ...]

    private const MANUAL_RESOURCES = [
        'editions' => ['create', 'update', 'delete'], // nested inside events, no .index route
    ];

    // ── Feature permissions ───────────────────────────────────────────────────
    //
    // Non-CRUD gates that don't map to a standard resource action.
    // Add an entry here whenever you add middleware('permission:something.custom').

    private const FEATURE_PERMISSIONS = [
        ['slug' => 'participants.import',    'name' => 'Import Participants',    'page' => 'Participants'],
        ['slug' => 'certificates.preview',   'name' => 'Preview Certificate',    'page' => 'Certificates'],
        ['slug' => 'batches.view-all',       'name' => 'View All Import Batches','page' => 'Batches'],
        ['slug' => 'batches.set-window',     'name' => 'Set Email Window',       'page' => 'Batches'],
        ['slug' => 'batches.delete',         'name' => 'Delete Import Batch',    'page' => 'Batches'],
        ['slug' => 'email-logs.view',        'name' => 'View Email Logs',        'page' => 'Email Logs'],
        ['slug' => 'artisan-commands.view',  'name' => 'View Artisan Commands',  'page' => 'Artisan Commands'],
    ];

    // ─────────────────────────────────────────────────────────────────────────

    public function handle(): int
    {
        $dry          = $this->option('dry-run');
        $pruneOrphans = $this->option('prune-orphans');

        if ($dry) {
            $this->warn('DRY RUN — no changes will be written.');
        }

        $definitions = $this->buildDefinitions();

        $this->newLine();
        $this->info('  Discovering & syncing permissions…');
        $permMap = $this->syncPermissions($definitions, $dry, $pruneOrphans);

        $this->newLine();
        $this->info('  Giving super_admin all permissions…');
        $this->syncSuperAdmin($permMap, $dry);

        $this->newLine();
        $this->info($dry ? '  Done (dry run — nothing written).' : '  Done. Assign other roles via Admin → Roles.');

        return self::SUCCESS;
    }

    // ── Discovery ─────────────────────────────────────────────────────────────

    private function buildDefinitions(): array
    {
        $defs = [];

        foreach ($this->discoverRoutePermissions() as $slug => $def) {
            $defs[$slug] = $def + ['source' => 'auto'];
        }

        foreach (self::MANUAL_RESOURCES as $resource => $actions) {
            $page = Str::headline($resource);
            foreach ($actions as $action) {
                $slug        = "{$resource}.{$action}";
                $defs[$slug] = [
                    'slug'   => $slug,
                    'name'   => ucfirst($action) . ' ' . $page,
                    'page'   => $page,
                    'source' => 'manual',
                ];
            }
        }

        foreach (self::FEATURE_PERMISSIONS as $def) {
            $defs[$def['slug']] = $def + ['source' => 'feature'];
        }

        return $defs;
    }

    private function discoverRoutePermissions(): array
    {
        $routeNames = collect(Route::getRoutes()->getRoutesByName())->keys();

        $resources = $routeNames
            ->filter(fn ($n) => str_ends_with($n, '.index'))
            ->map(fn ($n) => substr($n, 0, -6))
            ->reject(fn ($n) => collect(self::SKIP_PREFIXES)->contains(fn ($p) => str_starts_with($n, $p)))
            ->sort()
            ->values();

        $permissions = [];

        foreach ($resources as $resource) {
            $page = Str::headline($resource);

            $actionRoutes = [
                'create' => ["{$resource}.create", "{$resource}.store"],
                'read'   => ["{$resource}.index",  "{$resource}.show"],
                'update' => ["{$resource}.edit",   "{$resource}.update"],
                'delete' => ["{$resource}.destroy"],
            ];

            foreach ($actionRoutes as $action => $candidates) {
                if (collect($candidates)->contains(fn ($r) => Route::has($r))) {
                    $slug               = "{$resource}.{$action}";
                    $permissions[$slug] = [
                        'slug' => $slug,
                        'name' => ucfirst($action) . ' ' . $page,
                        'page' => $page,
                    ];
                }
            }
        }

        return $permissions;
    }

    // ── Sync helpers ──────────────────────────────────────────────────────────

    private function syncPermissions(array $definitions, bool $dry, bool $pruneOrphans): array
    {
        $sourceLabel = [
            'auto'    => '<fg=blue>[AUTO]</>   ',
            'manual'  => '<fg=cyan>[MANUAL]</> ',
            'feature' => '<fg=magenta>[FEATURE]</>',
        ];

        $map = [];

        foreach ($definitions as $slug => $def) {
            $tag      = $sourceLabel[$def['source']] ?? '';
            $existing = Permission::where('slug', $slug)->first();

            if ($existing) {
                $dirty = $existing->name !== $def['name'] || $existing->page !== $def['page'];

                if ($dirty) {
                    $this->line("    <comment>UPDATE</comment>  {$tag} {$slug}");
                    if (! $dry) {
                        $existing->update(['name' => $def['name'], 'page' => $def['page']]);
                    }
                } else {
                    $this->line("    <info>OK</info>      {$tag} {$slug}");
                }

                $map[$slug] = $existing;
            } else {
                $this->line("    <fg=green>CREATE</>  {$tag} {$slug}");
                if (! $dry) {
                    $map[$slug] = Permission::create([
                        'slug' => $def['slug'],
                        'name' => $def['name'],
                        'page' => $def['page'],
                    ]);
                } else {
                    $map[$slug] = (object) ['id' => null, 'slug' => $slug, 'page' => $def['page'] ?? ''];
                }
            }
        }

        $knownSlugs = array_keys($definitions);
        $orphans    = Permission::whereNotIn('slug', $knownSlugs)->get();

        foreach ($orphans as $orphan) {
            if ($pruneOrphans) {
                $this->line("    <fg=red>DELETE</>  {$orphan->slug}  ← orphan removed");
                if (! $dry) {
                    $orphan->roles()->detach();
                    $orphan->delete();
                }
            } else {
                $this->line("    <comment>ORPHAN</comment>  {$orphan->slug}  ← not discovered (run --prune-orphans to delete)");
            }
        }

        return $map;
    }

    private function syncSuperAdmin(array $permMap, bool $dry): void
    {
        $superAdmin = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin']);

        $allIds  = collect($permMap)->pluck('id')->filter()->values()->all();
        $current = $superAdmin->permissions()->pluck('permissions.id')->sort()->values()->all();
        $desired = collect($allIds)->sort()->values()->all();

        if ($current === $desired) {
            $this->line('    <info>OK</info>      role:super_admin (already has all permissions)');

            return;
        }

        $added   = count(array_diff($desired, $current));
        $removed = count(array_diff($current, $desired));
        $this->line("    <comment>SYNC</comment>    role:super_admin (+{$added} / -{$removed})");

        if (! $dry) {
            $superAdmin->permissions()->sync($allIds);
        }
    }
}
