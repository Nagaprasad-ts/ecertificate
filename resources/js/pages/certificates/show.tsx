import { Head } from '@inertiajs/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FileImage, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { ComponentType } from 'react';

import type { CertificateProps } from '@/certificate-templates/types';
import { Button } from '@/components/ui/button';

const modules = import.meta.glob('/resources/js/certificate-templates/**/*.tsx');

// Convert oklch(L C H) → rgb(r,g,b) — html2canvas can't parse oklch
function oklchToRgb(l: number, c: number, h: number): string {
    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    const lc = l_ ** 3;
    const mc = m_ ** 3;
    const sc = s_ ** 3;

    const toSrgb = (v: number) =>
        Math.round(Math.max(0, Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)) * 255);

    const r  = toSrgb(4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc);
    const g  = toSrgb(-1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc);
    const bv = toSrgb(-0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc);

    return `rgb(${r},${g},${bv})`;
}

function replaceOklch(css: string): string {
    return css.replace(/oklch\(([^)]+)\)/g, (_m, args: string) => {
        const parts = args.trim().split(/[\s,]+/);
        const l = parseFloat(parts[0]);
        const c = parseFloat(parts[1] ?? '0');
        const h = parseFloat(parts[2] ?? '0');
        
        if (isNaN(l)) {
            return 'rgb(128,128,128)';
        }
        
        return oklchToRgb(l, isNaN(c) ? 0 : c, isNaN(h) ? 0 : h);
    });
}

type TemplateImporter = () => Promise<{ default: ComponentType<CertificateProps> }>;
type Props = CertificateProps & { templateFile: string };

export default function CertificateShow({ templateFile, participant, event, logos, signatures }: Props) {
    const [Template, setTemplate] = useState<ComponentType<CertificateProps> | null>(null);
    const [downloading, setDownloading] = useState<'pdf' | 'png' | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // Load template client-side only — avoids Suspense + SSR renderToString conflict
    useEffect(() => {
        const key = `/resources/js/certificate-templates/${templateFile}.tsx`;
        const importer = modules[key] as TemplateImporter | undefined;
        
        if (!importer) {
            console.error(`Template not found: ${key}`);
            
            return;
        }
        
        void importer()
            .then((mod) => setTemplate(() => mod.default))
            .catch((err: unknown) => console.error('Template load failed:', err));
    }, [templateFile]);

    /** Wait for all <img> tags to load, then capture the certificate element */
    async function captureCanvas(): Promise<HTMLCanvasElement> {
    const el = document.getElementById('certificate-paper');
    
    if (!el) {
        throw new Error('Certificate element not found');
    }

    // Wait safely until images finish download procedures
    await Promise.all(
        Array.from(el.querySelectorAll('img')).map((img) =>
            img.complete
                ? Promise.resolve()
                : new Promise<void>((resolve) => {
                      img.onload  = () => resolve();
                      img.onerror = () => resolve();
                  }),
        ),
    );

    return html2canvas(el, {
        scale: 2,
        useCORS: false,      // All images are same-origin — CORS mode not needed
        allowTaint: true,    // Allow same-origin images without crossOrigin attribute
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        // FIX: Hardcode target frame spaces to prevent dynamic engine shrinkage 
        width: 1123,
        height: 794,
        windowWidth: 1123,
        windowHeight: 794,
        onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.getElementById('certificate-paper');
            
            if (clonedEl) {
                clonedEl.style.width = '1123px';
                clonedEl.style.height = '794px';
            }
            
            clonedDoc.querySelectorAll('style').forEach((s) => {
                if (s.textContent && s.textContent.includes('oklch')) {
                    s.textContent = replaceOklch(s.textContent);
                }
            });
            clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => link.remove());
        },
    });
}

    async function downloadPDF() {
        setDownloading('pdf');
        
        try {
            const canvas  = await captureCanvas();
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf     = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
            pdf.save(`${participant.certificate_no}.pdf`);
        } catch (err) {
            console.error('PDF download failed:', err);
            setDownloadError(`PDF failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setDownloading(null);
        }
    }

    async function downloadPNG() {
        setDownloading('png');
        
        try {
            const canvas = await captureCanvas();
            const link   = document.createElement('a');
            link.download = `${participant.certificate_no}.png`;
            link.href     = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('PNG download failed:', err);
            setDownloadError(`PNG failed: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setDownloading(null);
        }
    }

    return (
        <>
            <Head title={`Certificate — ${participant.name}`} />

            {downloadError && (
                <div className="fixed bottom-20 right-6 z-50 max-w-sm rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700 shadow-lg print:hidden">
                    {downloadError}
                    <button onClick={() => setDownloadError(null)} className="ml-3 font-bold">✕</button>
                </div>
            )}

            <div className="fixed bottom-6 right-6 z-50 print:hidden flex gap-2">
                <Button
                    onClick={downloadPNG}
                    disabled={downloading !== null}
                    size="lg"
                    variant="outline"
                    className="shadow-lg gap-2"
                >
                    <FileImage className="h-4 w-4" />
                    {downloading === 'png' ? 'Generating…' : 'Download PNG'}
                </Button>
                <Button
                    onClick={downloadPDF}
                    disabled={downloading !== null}
                    size="lg"
                    className="shadow-lg gap-2"
                >
                    <FileText className="h-4 w-4" />
                    {downloading === 'pdf' ? 'Generating…' : 'Download PDF'}
                </Button>
            </div>

            {Template ? (
                <Template
                    participant={participant}
                    event={event}
                    logos={logos}
                    signatures={signatures}
                />
            ) : (
                <div className="flex min-h-screen items-center justify-center text-gray-500">
                    Loading certificate…
                </div>
            )}
        </>
    );
}
