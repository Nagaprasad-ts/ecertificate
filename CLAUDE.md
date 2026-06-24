<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/wayfinder (WAYFINDER) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.
- To check environment variables, read the `.env` file directly.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== herd rules ===

# Laravel Herd

- The application is served by Laravel Herd at `https?://[kebab-case-project-dir].test`. Use the `get-absolute-url` tool to generate valid URLs. Never run commands to serve the site. It is always available.
- Use the `herd` CLI to manage services, PHP versions, and sites (e.g. `herd sites`, `herd services:start <service>`, `herd php:list`). Run `herd list` to discover all available commands.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>

---

## Project: eCertificate Platform

### Commands

```bash
# Start everything (queue worker + scheduler + Vite) concurrently — Herd serves the app
composer dev

# PHP linting (Laravel Pint)
composer lint            # fix
composer lint:check      # check only — run after modifying PHP files: vendor/bin/pint --dirty

# Frontend
npm run types:check      # tsc --noEmit
npm run lint             # ESLint --fix
npm run lint:check
npm run format           # Prettier --write resources/
npm run build

# Permissions — run after adding/removing a permission-gated route
php artisan permissions:sync                 # upsert & assign to super_admin
php artisan permissions:sync --prune-orphans # also delete removed permissions from DB
php artisan permissions:sync --dry-run       # preview without writing

# Reset dev DB
php artisan migrate:fresh --seed             # creates 1 super_admin user only
```

### Queue / Email delivery

- **Local (Herd free):** `QUEUE_CONNECTION=database`. `composer dev` runs `php artisan queue:work --tries=3` and `php artisan schedule:work`. No Redis required.
- **Production (AWS):** `QUEUE_CONNECTION=redis` (ElastiCache). Supervisor keeps `php artisan horizon` alive. Cron fires `schedule:run` every minute.
- `SendCertificateEmail` job: `tries=3`, `backoff=60s`. `failed()` hook writes `EmailLog` with `status=failed` after exhausting retries.
- `confirmImport()` flips participants to `active` immediately then dispatches one job per participant — the HTTP response returns in milliseconds.

### Horizon

- `/horizon` is gated by `Horizon::auth()` in `HorizonServiceProvider` — enforces `role->slug === 'super_admin'` in **all** environments (including local). Without this, Horizon bypasses the gate locally.
- `horizon:snapshot` runs every 5 minutes via the scheduler — required for the Metrics graphs to populate. Seed the first snapshot manually with `php artisan horizon:snapshot`.
- `composer.json` pins `"platform": {"php": "8.3.6"}` so lock files generated on the Windows/PHP 8.4 dev machine resolve packages compatible with the PHP 8.3 production server.

### Inertia layout routing

Layout is resolved in `resources/js/app.tsx` based on page path — do NOT import or wrap `AppLayout` inside page components:

| Page path prefix | Layout applied |
|---|---|
| `auth/*` | `AuthLayout` |
| `settings/*` | `[AppLayout, SettingsLayout]` |
| `welcome`, `certificates/show`, `certificate/search` | none (public) |
| everything else | `AppLayout` |

Pages export a static `.layout = { breadcrumbs: [...] }` property to inject breadcrumbs into the shell.

### Authorization (RBAC)

`User → role_id → Role ↔ role_permission ↔ Permission`. One role per user, nullable.

Two middleware aliases in `bootstrap/app.php`:
- **`super_admin`** — `role->slug === 'super_admin'`; gates the entire `/admin` prefix group (users, roles, permissions management)
- **`permission:{slug}`** (`HasPermission`) — short-circuits immediately for `super_admin`, then calls `$user->hasPermission($slug)` for everyone else

Controllers use `HasMiddleware` with `Middleware` objects for per-action gating (logos, signatures, templates, events, participants, certificates).

Permission slugs: `{resource}.{action}` e.g. `events.create`, `batches.set-window`.

**To add a new permission-gated route:**
1. Add route with `->middleware('permission:resource.action')`, or add it to a controller's `HasMiddleware::middleware()`.
2. Routes with a `.index` name not under `admin.`/`settings.` are auto-discovered by the sync command.
3. For non-CRUD feature gates, add an entry to `FEATURE_PERMISSIONS` in `app/Console/Commands/SyncPermissions.php`.
4. Run `php artisan permissions:sync`.

**`super_admin` is immutable** — `RoleController` blocks rename and deletion. Never add permission checks that bypass `is_super_admin` without also updating `HasPermission`.

### Data model hierarchy

```
Event
 └── EventEdition  (event_id, year — unique per event)
      ├── Participant  (event_edition_id, template_id, status: pending|active, batch_id)
      ├── templates  (BelongsToMany via event_edition_template)
      └── logos      (BelongsToMany via event_edition_logo)

ImportBatch  (UUID PK: batch_id, failures JSON, email_window_from/to datetime)
 └── event_id, event_edition_id, template_id, imported_by (user FK)
```

`ImportBatch` declares `protected $primaryKey = 'batch_id'`, so use `findOrFail($batchId)`, `find($batchId, ['*'])`, and `destroy($batchId)` directly — do not use `where('batch_id', '=', $batchId)` chains on this model.

`certificate_no` format: `{event-slug}-{year}-{6hex}` (e.g. `sargam-2026-1a2b3c`), guaranteed unique per event-year by a retry loop (`0x000000`–`0xFFFFFF` = 16.7 M values per event-year).

### Event archiving

Events have an `archived_at` nullable timestamp. Archived events are hidden from the active list but certificates remain publicly accessible — participant queries never filter on `events.archived_at`.

- `Event::scopeActive()` / `Event::scopeArchived()` — use these in any query that should respect archive state.
- `POST /events/{event}/archive` and `POST /events/{event}/unarchive` — gated by `permission:events.update`.
- Permanent delete (`destroy`) is intentionally only surfaced in the UI for already-archived events.
- The import form (`importForm()`) passes `activeOnly: true` to the private `eventOptions()` helper, which applies `whereNull('archived_at')` — archived events must not appear in the import event dropdown. The participants index passes no flag so users can still filter existing participants by archived events.

### Template-driven Excel import validation

`Template` has an `expected_columns` JSON column (nullable array of `{key, label, required}`). The four base columns (`name`, `email`, `usn`, `phone`) are always required and defined in `Template::BASE_COLUMNS` / `fullExpectedColumns()`.

`ParticipantsImport` reads `fullExpectedColumns()` and:
- Rejects files with missing required columns or unexpected columns (schema errors abort the whole import — no rows are written).
- Strips blank and purely-numeric header keys before validation (Excel trailing-column artifacts).
- Schema errors are returned via `schemaErrors()` and rendered as a structured error card on the import page, not as a plain text message.

To add extra columns to a template: edit the template in the admin UI — the repeater stores `{key (snake_case), label, required}` entries. Keys cannot duplicate the four base columns.

### Import/confirm workflow

1. Upload `.xlsx` → `ParticipantController::import()` creates `ImportBatch`, inserts participants with `status = 'pending'`.
2. Failures stored as JSON in `import_batches.failures` — not in session.
3. Admin sets email window via `setEmailWindow()` — blocked when `failed_count > 0`.
4. `confirmImport()` sends emails, flips participants to `status = 'active'`. Only allowed inside the active window.
5. `reImport()` deletes pending rows and re-runs the import under the same `batch_id`.

### Certificate templates

React components in `resources/js/certificate-templates/{event-slug}/{TemplateName}.tsx`. Each exports a default component accepting `CertificateProps` (defined in `certificate-templates/types.ts`).

A custom Vite plugin (`templateManifestPlugin` in `vite.config.ts`) auto-scans the directory on build/dev-start and writes `storage/app/template-manifest.json` mapping `templateFile` slugs (e.g. `sargam/Participation`) to display names. The `templates` DB table is kept in sync via this manifest — no artisan command needed. Files prefixed with `_` are ignored by the scanner.

At render time, `certificates/show` and `certificates/preview` do a dynamic `import()` keyed by `templateFile` to load the correct component. Public certificates (`/certificate/{no}`) only show participants with `status = 'active'`.

### Vite bundle splitting

`vite.config.ts` uses `build.rollupOptions.output.manualChunks` to split vendors into four cached chunks: `vendor-react` (React + ReactDOM), `vendor-inertia` (@inertiajs/react), `vendor-ui` (Radix UI, Lucide, shadcn utilities), and the app chunk. jsPDF and html2canvas are left in their own auto-split chunks since they're only loaded on certificate download pages.

### Code style (project-specific)

- Tailwind v4 — no `tailwind.config.*`. All customisation is in `resources/css/app.css` via CSS variables (OKLch). Use semantic classes (`bg-card`, `text-muted-foreground`) not hardcoded values.
- Path alias `@/` → `resources/js/`.
- `StatCard` (`@/components/ui/stat-card`) is the standard stat display component.
- Wayfinder generates typed route helpers into `@/routes` and `@/actions` at build time — prefer those over string URLs.

### TypeScript / React conventions

- Always use a separate top-level `import type { Foo }` — never inline `import { type Foo }` inside a value import (`import/consistent-type-specifier-style`).
- Use expanded block syntax for all conditionals and early returns — no single-line `if (x) return y;` shorthands. Leave a blank line between logical sections of a function body.

### Intelephense P1005 false positives (Eloquent)

Intelephense confuses Eloquent static methods with PHP built-ins and raises "Not enough arguments" errors. Known patterns and their fixes:

| Error | Root cause | Fix |
|---|---|---|
| `->count()` — "Expected 1. Found 0" | Confused with PHP `count($array)` | Use `->count('*')` |
| `Model::find($id)` — "Expected 2. Found 1" | Phantom 2-arg signature | Use `Model::find($id, ['*'])` |
| `->where('col', '=', $val)` — "Expected 4. Found 2/3" | Phantom 4-arg `where` | Extract a named local scope (e.g. `scopeForBatch`) |
| `->whereIn('col', $arr)->delete()` — "Expected 4. Found 2" | `whereIn` confused with `where` | Use `Model::destroy($ids)` for bulk deletes |
| `$model->delete()` — "Expected 1. Found 0" | Intelephense invents phantom `static delete($id)` | Add `/** @method bool|null delete() */` above the class |

`Participant` already has `scopeForBatch(Builder $query, string $batchId)` and the `@method` PHPDoc — check `app/Models/Participant.php` before adding similar fixes to other models.

### Constraints

- The `.env` file must never be read or modified.

