import { Head } from '@inertiajs/react';
import { CheckCircle2, ClipboardCopy, RefreshCw, ShieldCheck, Terminal } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// ── Types ─────────────────────────────────────────────────────────────────────

type Option = {
    flag: string;
    description: string;
};

type Step = {
    label: string;
    code: string;
};

type Command = {
    signature: string;
    description: string;
    group: string;
    badge: string;
    badgeColor: string;
    purpose: string;
    whenToRun: string[];
    options?: Option[];
    steps: Step[];
    notes?: string[];
};

// ── Command definitions ────────────────────────────────────────────────────────
//
// Add a new entry here whenever a new custom Artisan command is created.

const COMMANDS: Command[] = [
    {
        signature:   'permissions:sync',
        description: 'Create / update all roles and permissions and sync role assignments.',
        group:       'permissions',
        badge:       'Roles & Permissions',
        badgeColor:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
        purpose:
            'Single source of truth for every permission and role in the system. ' +
            'Upserts permissions (creates new ones, updates changed names/pages), ' +
            'then syncs the pivot table so each role has exactly the slugs defined in the command. ' +
            'Safe to run multiple times — already-correct rows are left untouched.',
        whenToRun: [
            'After adding a new route that needs a new permission slug.',
            'After changing which role should have access to a feature.',
            'After a fresh database seed to verify assignments match the codebase.',
        ],
        options: [
            {
                flag:        '--dry-run',
                description: 'Preview every CREATE / UPDATE / SYNC action without writing anything to the database.',
            },
        ],
        steps: [
            { label: 'Preview changes (safe)',  code: 'php artisan permissions:sync --dry-run' },
            { label: 'Apply changes',           code: 'php artisan permissions:sync' },
        ],
        notes: [
            'To add a new permission: add it to PERMISSIONS[] inside the command file, add its slug to the relevant role(s) in ROLES[], then run this command.',
            'The seeder (RolesAndPermissionsSeeder) is kept for fresh installs. This command handles incremental updates on a running database.',
        ],
    },
    {
        signature:   'templates:sync',
        description: 'Scan certificate-templates directory and sync to the templates table.',
        group:       'templates',
        badge:       'Templates',
        badgeColor:  'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
        purpose:
            'Walks the resources/js/certificate-templates/ directory, finds every *.tsx ' +
            'template file inside an event sub-folder, and upserts a matching row in the ' +
            'templates table. Files prefixed with _ are skipped. ' +
            'The human-readable name is derived automatically from the folder and file name.',
        whenToRun: [
            'After adding a new certificate template file to the codebase.',
            'After renaming or reorganising template files.',
            'On a fresh environment after pulling new template files from git.',
        ],
        steps: [
            {
                label: 'Drop the .tsx file in the correct sub-folder first',
                code:  'resources/js/certificate-templates/{event-name}/{TemplateName}.tsx',
            },
            {
                label: 'Run the sync',
                code:  'php artisan templates:sync',
            },
        ],
        notes: [
            'Template files at the root of certificate-templates/ (not inside an event sub-folder) are skipped.',
            'The name stored in the DB is auto-generated as "Event — Template" (headline-cased). You can rename it in the admin UI afterwards.',
            'Running the command multiple times is safe — it uses updateOrCreate on the template_file path.',
        ],
    },
];

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            title="Copy to clipboard"
            className="ml-2 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
            {copied
                ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                : <ClipboardCopy className="h-3.5 w-3.5" />
            }
        </button>
    );
}

// ── Command card ──────────────────────────────────────────────────────────────

function CommandCard({ cmd }: { cmd: Command }) {

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Terminal className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="font-mono text-sm font-semibold">php artisan {cmd.signature}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{cmd.description}</p>
                    </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cmd.badgeColor}`}>
                    {cmd.badge}
                </span>
            </div>

            <div className="space-y-5 p-5">

                {/* Purpose */}
                <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">What it does</p>
                    <p className="text-sm leading-relaxed text-foreground">{cmd.purpose}</p>
                </div>

                <Separator />

                {/* When to run */}
                <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">When to run</p>
                    <ul className="space-y-1.5">
                        {cmd.whenToRun.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                                <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Options */}
                {cmd.options && cmd.options.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Options</p>
                            <div className="space-y-2">
                                {cmd.options.map((opt) => (
                                    <div key={opt.flag} className="flex items-start gap-3">
                                        <code className="shrink-0 rounded bg-muted px-2 py-0.5 font-mono text-xs">{opt.flag}</code>
                                        <p className="text-sm text-muted-foreground">{opt.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <Separator />

                {/* How to run */}
                <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">How to run</p>
                    <div className="space-y-2">
                        {cmd.steps.map((step, i) => (
                            <div key={i}>
                                <p className="mb-1 text-xs text-muted-foreground">{i + 1}. {step.label}</p>
                                <div className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-2.5 dark:bg-zinc-800">
                                    <code className="font-mono text-xs text-zinc-100">{step.code}</code>
                                    <CopyButton text={step.code} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                {cmd.notes && cmd.notes.length > 0 && (
                    <>
                        <Separator />
                        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/20">
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">Notes</p>
                            <ul className="space-y-1.5">
                                {cmd.notes.map((note, i) => (
                                    <li key={i} className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                                        • {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ArtisanCommandsPage() {

    return (
        <>
            <Head title="Artisan Commands" />
            <div className="p-6">

                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold">Artisan Commands</h1>
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                <ShieldCheck className="h-3 w-3" />
                                Super Admin Only
                            </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Custom CLI commands for this application — run these from the project root via terminal.
                        </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-sm">
                        {COMMANDS.length} command{COMMANDS.length !== 1 ? 's' : ''}
                    </Badge>
                </div>

                {/* Command cards */}
                <div className="space-y-6">
                    {COMMANDS.map((cmd) => (
                        <CommandCard key={cmd.signature} cmd={cmd} />
                    ))}
                </div>
            </div>
        </>
    );
}

ArtisanCommandsPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Artisan Commands', href: '/admin/artisan-commands' },
    ],
};
