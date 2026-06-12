import { Head, router } from '@inertiajs/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Award, ExternalLink, FileImage, FileText, Hash, HelpCircle, Loader2, Search, Trophy } from 'lucide-react';
import type { ComponentType } from 'react';
import type { SyntheticEvent } from 'react';
import { useEffect, useState } from 'react';

import type { CertificateProps } from '@/certificate-templates/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const modules = import.meta.glob('/resources/js/certificate-templates/**/*.tsx');
type TemplateImporter = () => Promise<{ default: ComponentType<CertificateProps> }>;

type CertificateData = CertificateProps & { templateFile: string };

type Edition     = { id: number; year: number };
type EventOption = { id: number; event_name: string; editions: Edition[] };
type Result      = { id: number; name: string; certificate_no: string; event_name: string; year: number };
type Props       = { events: EventOption[]; results: Result[] | null; filters: { event_edition_id?: string; query?: string } };

// ── oklch → rgb conversion for html2canvas ──
function oklchToRgb(l: number, c: number, h: number): string {
    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
    const lc = l_ ** 3; const mc = m_ ** 3; const sc = s_ ** 3;
    const toSrgb = (v: number) => Math.round(Math.max(0, Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)) * 255);
    return `rgb(${toSrgb(4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc)},${toSrgb(-1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc)},${toSrgb(-0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc)})`;
}
function replaceOklch(css: string): string {
    return css.replace(/oklch\(([^)]+)\)/g, (_m, args: string) => {
        const parts = args.trim().split(/[\s,]+/);
        const l = parseFloat(parts[0]);
        const c = parseFloat(parts[1] ?? '0');
        const h = parseFloat(parts[2] ?? '0');
        if (isNaN(l)) return 'rgb(128,128,128)';
        return oklchToRgb(l, isNaN(c) ? 0 : c, isNaN(h) ? 0 : h);
    });
}

async function captureCanvas(): Promise<HTMLCanvasElement> {
    const el = document.getElementById('certificate-paper');
    if (!el) throw new Error('Certificate element not found');
    await Promise.all(
        Array.from(el.querySelectorAll('img')).map((img) =>
            img.complete ? Promise.resolve() : new Promise<void>((resolve) => { img.onload = () => resolve(); img.onerror = () => resolve(); }),
        ),
    );
    return html2canvas(el, {
        scale: 2,
        useCORS: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        width: 1123, height: 794, windowWidth: 1123, windowHeight: 794,
        onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById('certificate-paper');
            if (clonedEl) { clonedEl.style.width = '1123px'; clonedEl.style.height = '794px'; }
            clonedDoc.querySelectorAll('style').forEach((s) => { if (s.textContent?.includes('oklch')) s.textContent = replaceOklch(s.textContent); });
            clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => l.remove());
        },
    });
}

// ── Certificate renderer — renders template directly, no constraining wrapper ──
function CertificateRenderer({ data }: { data: CertificateData }) {
    // Store the resolved component alongside the file it came from so we can
    // derive "still loading" by comparing file names — avoids a synchronous
    // setState(null) call inside the effect body.
    const [loaded, setLoaded] = useState<{ file: string; Component: ComponentType<CertificateProps> } | null>(null);

    useEffect(() => {
        let cancelled = false;
        const key      = `/resources/js/certificate-templates/${data.templateFile}.tsx`;
        const importer = modules[key] as TemplateImporter | undefined;
        if (!importer) { console.error('Template not found:', key); return; }
        void importer()
            .then((mod) => { if (!cancelled) setLoaded({ file: data.templateFile, Component: mod.default }); })
            .catch((err: unknown) => console.error('Template load failed:', err));
        return () => { cancelled = true; };
    }, [data.templateFile]);

    // If the loaded file doesn't match the requested one, we're still loading.
    const Template = loaded?.file === data.templateFile ? loaded.Component : null;

    if (!Template) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Template
            participant={data.participant}
            event={data.event}
            logos={data.logos}
            signatures={data.signatures}
        />
    );
}

export default function CertificateSearch({ events, results, filters }: Props) {
    const [certNo, setCertNo] = useState('');
    const [tab, setTab]       = useState<'direct' | 'lost'>(filters.event_edition_id ? 'lost' : 'direct');

    const eventOptions = events.map((e) => ({ value: String(e.id), label: e.event_name }));

    const initialEventId = (() => {
        if (!filters.event_edition_id) return '';
        for (const ev of events) {
            if (ev.editions.some((ed) => String(ed.id) === filters.event_edition_id)) return String(ev.id);
        }
        return '';
    })();

    const [eventId, setEventId]     = useState(initialEventId);
    const [editionId, setEditionId] = useState(filters.event_edition_id ?? '');
    const [query, setQuery]         = useState(filters.query ?? '');

    const [certData, setCertData]         = useState<CertificateData | null>(null);
    const [activeCertNo, setActiveCertNo] = useState<string | null>(null);
    const [loading, setLoading]           = useState(false);
    const [fetchError, setFetchError]     = useState<string | null>(null);
    const [downloading, setDownloading]   = useState<'pdf' | 'png' | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const selectedEvent     = events.find((e) => String(e.id) === eventId);
    const availableEditions = selectedEvent?.editions ?? [];

    function handleEventChange(id: string) { setEventId(id); setEditionId(''); }

    useEffect(() => {
        if (results && results.length === 1) loadCertificate(results[0].certificate_no);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadCertificate(no: string) {
        if (no === activeCertNo) return;
        setLoading(true); setFetchError(null); setActiveCertNo(no); setCertData(null);
        try {
            const res = await fetch(`/certificate/${no}/data`);
            if (!res.ok) { setFetchError(res.status === 404 ? 'Certificate not found.' : 'Failed to load certificate.'); }
            else { setCertData(await res.json() as CertificateData); }
        } catch { setFetchError('Network error — please try again.'); }
        finally { setLoading(false); }
    }

    function handleDirectLookup(e: SyntheticEvent) { e.preventDefault(); const t = certNo.trim(); if (t) loadCertificate(t); }
    function handleSearch(e: SyntheticEvent) { e.preventDefault(); router.get('/certificate/search', { event_edition_id: editionId, query }, { preserveScroll: true }); }

    async function handleDownloadPDF() {
        setDownloading('pdf');
        try {
            const canvas  = await captureCanvas();
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf     = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
            pdf.save(`${activeCertNo}.pdf`);
        } catch (err) { setDownloadError(`PDF failed: ${err instanceof Error ? err.message : String(err)}`); }
        finally { setDownloading(null); }
    }

    async function handleDownloadPNG() {
        setDownloading('png');
        try {
            const canvas = await captureCanvas();
            const link   = document.createElement('a');
            link.download = `${activeCertNo}.png`;
            link.href     = canvas.toDataURL('image/png');
            link.click();
        } catch (err) { setDownloadError(`PNG failed: ${err instanceof Error ? err.message : String(err)}`); }
        finally { setDownloading(null); }
    }

    return (
        <>
            <Head title="Certificate Lookup" />

            <div className="flex h-screen overflow-hidden">

                {/* ── Left panel — 30% ── */}
                <div className="flex w-[30%] shrink-0 flex-col overflow-y-auto border-r bg-background">
                    <div className="flex flex-1 flex-col gap-5 p-6">

                        {/* Logo + heading */}
                        <div className="flex flex-col items-center gap-3 text-center">
                            <img src="/apple-touch-icon.png" alt="Logo" className="h-12 w-12 rounded-2xl shadow-md" />
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Certificate Lookup</h1>
                                <p className="mt-0.5 text-xs text-muted-foreground">View or find your achievement certificate</p>
                            </div>
                        </div>

                        {/* Tab switcher */}
                        <div className="flex overflow-hidden rounded-xl border bg-card shadow-sm">
                            <button type="button" onClick={() => setTab('direct')}
                                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${tab === 'direct' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                            >
                                <Hash className="h-3.5 w-3.5" /> Have cert no.
                            </button>
                            <div className="w-px bg-border" />
                            <button type="button" onClick={() => setTab('lost')}
                                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${tab === 'lost' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                            >
                                <HelpCircle className="h-3.5 w-3.5" /> Lost / find it
                            </button>
                        </div>

                        {/* ── Direct lookup ── */}
                        {tab === 'direct' && (
                            <div className="rounded-2xl border bg-card p-5 shadow-sm">
                                <p className="mb-3 text-xs text-muted-foreground">Enter the certificate number from your email.</p>
                                <form onSubmit={handleDirectLookup} className="space-y-3">
                                    <div className="relative">
                                        <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input className="pl-9 font-mono tracking-wider" placeholder="e.g. NHC-2023-0042" value={certNo} onChange={(e) => setCertNo(e.target.value)} required />
                                    </div>
                                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        View Certificate
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* ── Lost certificate ── */}
                        {tab === 'lost' && (
                            <div className="rounded-2xl border bg-card p-5 shadow-sm">
                                <p className="mb-3 text-xs text-muted-foreground">Select your event and year, then enter your registered email, phone, or USN.</p>
                                <form onSubmit={handleSearch} className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Event</Label>
                                        <SearchableSelect
                                            options={eventOptions}
                                            value={eventId}
                                            onChange={handleEventChange}
                                            placeholder="Select event"
                                            searchPlaceholder="Search events…"
                                            emptyMessage="No events found"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Year</Label>
                                        <Select value={editionId} onValueChange={setEditionId} disabled={!selectedEvent}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={selectedEvent ? 'Select year' : 'Select event first'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableEditions.map((ed) => (
                                                    <SelectItem key={ed.id} value={String(ed.id)}>{ed.year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="query" className="text-sm font-medium">Email / Phone / USN</Label>
                                        <Input id="query" placeholder="jane@example.com or 9876543210" value={query} onChange={(e) => setQuery(e.target.value)} required />
                                    </div>
                                    <Button type="submit" className="w-full gap-2" disabled={!editionId || !query || loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        Search
                                    </Button>
                                </form>

                                {results !== null && (
                                    <div className="mt-4 border-t pt-4">
                                        {results.length === 0 ? (
                                            <div className="rounded-xl bg-muted px-4 py-5 text-center">
                                                <p className="text-sm font-medium">No certificate found</p>
                                                <p className="mt-1 text-xs text-muted-foreground">Check the event and your details.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    {results.length === 1 ? '1 result' : `${results.length} results`}
                                                </p>
                                                <ul className="space-y-1.5">
                                                    {results.map((r) => {
                                                        const active = activeCertNo === r.certificate_no;
                                                        return (
                                                            <li key={r.id}>
                                                                <button type="button" onClick={() => loadCertificate(r.certificate_no)}
                                                                    className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${active ? 'border-primary bg-primary/5' : 'hover:border-primary/40 hover:bg-primary/5'}`}
                                                                >
                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                                        <Trophy className="h-3.5 w-3.5 text-primary" />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-semibold">{r.name}</p>
                                                                        <p className="truncate text-xs text-muted-foreground">{r.event_name} · {r.year}</p>
                                                                    </div>
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right panel — 70%, fully scrollable ── */}
                <div className="flex flex-1 flex-col overflow-hidden">

                    {/* Toolbar — always visible */}
                    {certData && !loading && (
                        <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-2">
                            <span className="text-xs text-muted-foreground font-mono">{activeCertNo}</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPNG} disabled={downloading !== null}>
                                    {downloading === 'png' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileImage className="h-3.5 w-3.5" />}
                                    {downloading === 'png' ? 'Generating…' : 'PNG'}
                                </Button>
                                <Button size="sm" className="gap-1.5 text-xs" onClick={handleDownloadPDF} disabled={downloading !== null}>
                                    {downloading === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                                    {downloading === 'pdf' ? 'Generating…' : 'PDF'}
                                </Button>
                                <a href={`/certificate/${activeCertNo}`} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" /> Open full page
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Content area — scrolls both axes */}
                    <div className="flex-1 overflow-auto bg-muted/30">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : fetchError ? (
                            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <Award className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                                <p className="font-medium text-muted-foreground">{fetchError}</p>
                            </div>
                        ) : certData ? (
                            <CertificateRenderer data={certData} />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <Award className="h-10 w-10 text-muted-foreground/40" />
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Certificate preview</p>
                                    <p className="mt-1 text-sm text-muted-foreground/70">Enter a certificate number or search to preview it here.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Download error toast */}
                    {downloadError && (
                        <div className="absolute bottom-6 right-6 z-50 max-w-sm rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 shadow-lg">
                            {downloadError}
                            <button onClick={() => setDownloadError(null)} className="ml-3 font-bold">✕</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

CertificateSearch.layout = () => null;
