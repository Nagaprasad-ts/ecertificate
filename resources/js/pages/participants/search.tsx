import { Head, router } from '@inertiajs/react';
import { ExternalLink, Hash, HelpCircle, Search, Trophy } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Edition = {
    id: number;
    label: string;
};

type Result = {
    id: number;
    name: string;
    certificate_no: string;
    event_name: string;
    year: number;
};

type Props = {
    editions: Edition[];
    results: Result[] | null;
    filters: { event_edition_id?: string; query?: string };
};

export default function CertificateSearch({ editions, results, filters }: Props) {
    const [certNo, setCertNo]     = useState('');
    const [editionId, setEditionId] = useState(filters.event_edition_id ?? '');
    const [query, setQuery]       = useState(filters.query ?? '');
    const [tab, setTab]           = useState<'direct' | 'lost'>(
        filters.event_edition_id ? 'lost' : 'direct',
    );

    function handleDirectLookup(e: FormEvent) {
        e.preventDefault();
        const trimmed = certNo.trim();
        if (trimmed) window.location.href = `/certificate/${trimmed}`;
    }

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/certificate/search', { event_edition_id: editionId, query }, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Certificate Lookup" />

            {/*
             * Full-page flex column so the content is vertically centred on
             * desktop (no unwanted scroll) but scrolls naturally on mobile
             * when the keyboard pushes content down.
             */}
            <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-10">
                <div className="w-full max-w-md space-y-6">

                    {/* ── Logo + heading ── */}
                    <div className="flex flex-col items-center gap-3 text-center">
                        <img
                            src="/apple-touch-icon.png"
                            alt="Logo"
                            className="h-16 w-16 rounded-2xl shadow-md"
                        />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Certificate Lookup
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                View or find your achievement certificate
                            </p>
                        </div>
                    </div>

                    {/* ── Tab switcher ── */}
                    <div className="flex overflow-hidden rounded-xl border bg-card shadow-sm">
                        <button
                            type="button"
                            onClick={() => setTab('direct')}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                tab === 'direct'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <Hash className="h-4 w-4" />
                            Have cert no.
                        </button>
                        <div className="w-px bg-border" />
                        <button
                            type="button"
                            onClick={() => setTab('lost')}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                                tab === 'lost'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <HelpCircle className="h-4 w-4" />
                            Lost / don't know it
                        </button>
                    </div>

                    {/* ── Direct lookup panel ── */}
                    {tab === 'direct' && (
                        <div className="rounded-2xl border bg-card p-6 shadow-sm">
                            <p className="mb-4 text-sm text-muted-foreground">
                                Enter the certificate number from your certificate or email.
                            </p>
                            <form onSubmit={handleDirectLookup} className="space-y-3">
                                <div className="relative">
                                    <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        className="pl-9 font-mono tracking-wider"
                                        placeholder="e.g. NHC-2023-0042"
                                        value={certNo}
                                        onChange={(e) => setCertNo(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Open Certificate
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* ── Lost certificate panel ── */}
                    {tab === 'lost' && (
                        <div className="rounded-2xl border bg-card p-6 shadow-sm">
                            <p className="mb-4 text-sm text-muted-foreground">
                                Select your event and enter your registered email, phone number, or USN.
                            </p>

                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Event</Label>
                                    <Select value={editionId} onValueChange={setEditionId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select the event you participated in" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {editions.map((ed) => (
                                                <SelectItem key={ed.id} value={String(ed.id)}>
                                                    {ed.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="query" className="text-sm font-medium">
                                        Email / Phone Number / USN
                                    </Label>
                                    <Input
                                        id="query"
                                        placeholder="jane@example.com  or  9876543210  or  USN"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full gap-2"
                                    disabled={!editionId || !query}
                                >
                                    <Search className="h-4 w-4" />
                                    Search Certificates
                                </Button>
                            </form>

                            {/* Results */}
                            {results !== null && (
                                <div className="mt-5 border-t pt-5">
                                    {results.length === 0 ? (
                                        <div className="rounded-xl bg-muted px-5 py-6 text-center">
                                            <p className="font-medium text-slate-700">No certificate found</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Double-check the event and your registered details.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                {results.length === 1
                                                    ? '1 certificate found'
                                                    : `${results.length} certificates found`}
                                            </p>
                                            <ul className="space-y-2">
                                                {results.map((r) => (
                                                    <li key={r.id}>
                                                        <a
                                                            href={`/certificate/${r.certificate_no}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="group flex items-center justify-between rounded-xl border px-4 py-3.5 transition-all hover:border-primary/40 hover:bg-primary/5"
                                                        >
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                                    <Trophy className="h-4 w-4 text-primary" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate font-semibold leading-tight">
                                                                        {r.name}
                                                                    </p>
                                                                    <p className="truncate text-xs text-muted-foreground">
                                                                        {r.event_name} · {r.year}
                                                                    </p>
                                                                    <p className="font-mono text-xs text-slate-400">
                                                                        {r.certificate_no}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <ExternalLink className="ml-3 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

// Render without the admin shell — this is a public-facing page
CertificateSearch.layout = () => null;
