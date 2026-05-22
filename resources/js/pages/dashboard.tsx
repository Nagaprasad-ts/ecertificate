import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    FileText,
    Info,
    Lock,
    ShieldCheck,
    Users,
} from 'lucide-react';

import { dashboard } from '@/routes';

const sections = [
    {
        icon: BookOpen,
        title: 'Purpose',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        items: [
            'This platform is used to issue, manage, and verify digital certificates for events and programmes conducted by the institution.',
            'Each certificate is uniquely identified by a certificate number and can be verified publicly via its URL.',
        ],
    },
    {
        icon: Users,
        title: 'Roles & Access',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        items: [
            'Super Admin — full access to all features including user management, roles, and permissions.',
            'Admin / Staff — can manage events, participants, templates, logos, and signatures.',
            'Access to sensitive sections is controlled by permissions assigned to your role.',
        ],
    },
    {
        icon: FileText,
        title: 'Certificate Workflow',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        items: [
            '1. Create an Event (name + optional logo).',
            '2. Add an Edition under the event (year + one or more templates).',
            '3. Import or manually add Participants to the edition.',
            '4. Each participant receives a unique certificate number automatically.',
            '5. Certificates are accessible at /certificate/{certificate_no}.',
        ],
    },
    {
        icon: CheckCircle2,
        title: 'Data Entry Guidelines',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        items: [
            'Participant name must match the official records — it will appear exactly on the certificate.',
            'Email address must be valid — it is used for certificate delivery and lookup.',
            'Phone number and USN are optional but recommended for participant self-lookup.',
            'Duplicate certificate numbers are not allowed; the system generates them automatically.',
        ],
    },
    {
        icon: AlertTriangle,
        title: 'Do Not',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        items: [
            'Do not delete an event edition that has issued certificates — this action is irreversible.',
            'Do not share admin credentials. Each staff member must have their own account.',
            'Do not upload logos or signatures that belong to other institutions.',
            'Do not use this platform for certificates unrelated to institution activities.',
        ],
    },
    {
        icon: Lock,
        title: 'Security & Privacy',
        color: 'text-red-600',
        bg: 'bg-red-50',
        items: [
            'All certificate data is stored securely and is accessible only to authorised users.',
            'Public certificate verification pages expose only the participant name, event, and year.',
            'Personal details (email, phone, USN) are never shown on the public verification page.',
        ],
    },
    {
        icon: ShieldCheck,
        title: 'Compliance',
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        items: [
            'Issued certificates must reflect accurate and verified information.',
            'Any request to alter or revoke an issued certificate must be approved by a Super Admin.',
            'All imports and actions are logged with the acting user for audit purposes.',
        ],
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Getting Started" />

            <div className="space-y-8 px-6 py-8">
                {/* Header */}
                <div className="flex items-start gap-4 rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Platform Guidelines</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Read and follow these rules to ensure certificates are issued correctly and securely.
                            All users of this platform are expected to comply.
                        </p>
                    </div>
                </div>

                {/* Sections grid */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {sections.map(({ icon: Icon, title, color, bg, items }) => (
                        <div key={title} className="rounded-2xl border bg-card p-5 shadow-sm">
                            <div className="mb-3 flex items-center gap-2.5">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
                                    <Icon className={`h-4 w-4 ${color}`} />
                                </div>
                                <h2 className="font-semibold">{title}</h2>
                            </div>
                            <ul className="space-y-2">
                                {items.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <p className="text-center text-xs text-muted-foreground">
                    For support or policy questions, contact your Super Admin.
                </p>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Getting Started',
            href: dashboard(),
        },
    ],
};
