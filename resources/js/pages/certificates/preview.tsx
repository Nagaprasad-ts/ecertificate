import { useEffect, useState } from 'react';

import type { ComponentType } from 'react';

import type { CertificateProps } from '@/certificate-templates/types';

const modules = import.meta.glob('/resources/js/certificate-templates/**/*.tsx');

type TemplateImporter = () => Promise<{ default: ComponentType<CertificateProps> }>;
type Props = CertificateProps & { templateFile: string };

export default function CertificatePreview({ templateFile, participant, event, logos, signatures }: Props) {
    const [loaded, setLoaded] = useState<{ file: string; Component: ComponentType<CertificateProps> } | null>(null);

    useEffect(() => {
        let cancelled = false;
        const key = `/resources/js/certificate-templates/${templateFile}.tsx`;
        const importer = modules[key] as TemplateImporter | undefined;
        if (!importer) { console.error(`Template not found: ${key}`); return; }
        void importer()
            .then((mod) => { if (!cancelled) setLoaded({ file: templateFile, Component: mod.default }); })
            .catch((err: unknown) => console.error('Template load failed:', err));
        return () => { cancelled = true; };
    }, [templateFile]);

    const Template = loaded?.file === templateFile ? loaded.Component : null;

    if (!Template) {
        return (
            <div className="flex min-h-screen items-center justify-center text-muted-foreground">
                Loading certificate…
            </div>
        );
    }

    return (
        <Template
            participant={participant}
            event={event}
            logos={logos}
            signatures={signatures}
        />
    );
}
