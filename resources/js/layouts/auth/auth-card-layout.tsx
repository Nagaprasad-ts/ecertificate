import { Link } from '@inertiajs/react';
import { Award, CheckCircle, LayoutTemplate, Users } from 'lucide-react';
import type { PropsWithChildren } from 'react';

const appName = import.meta.env.VITE_APP_NAME ?? 'Certificates NHEI';
import { home } from '@/routes';

const features = [
    { icon: LayoutTemplate, text: 'Custom certificate templates per event' },
    { icon: Users,          text: 'Bulk import participants via Excel' },
    { icon: CheckCircle,    text: 'Instant verification by certificate number' },
];

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh">

            {/* ── Left branded panel ── */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:w-[45%]">

                {/* Decorative background rings */}
                <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
                    <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/5" />
                    <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
                    <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8" />
                    <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 400 700" xmlns="http://www.w3.org/2000/svg">
                        {Array.from({ length: 6 }).map((_, row) =>
                            Array.from({ length: 8 }).map((_, col) => (
                                <circle key={`${row}-${col}`} cx={col * 52} cy={row * 52} r="1.5" fill="white" fillOpacity="0.6" />
                            ))
                        )}
                        {Array.from({ length: 5 }).map((_, row) =>
                            Array.from({ length: 7 }).map((_, col) => (
                                <circle key={`b-${row}-${col}`} cx={26 + col * 52} cy={375 + row * 52} r="1.5" fill="white" fillOpacity="0.6" />
                            ))
                        )}
                    </svg>
                </div>

                {/* Logo */}
                <Link href={home()} className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                        <img src="/apple-touch-icon.png" alt={appName} className="h-7 w-7 object-contain" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">{appName}</span>
                </Link>

                {/* Centre copy */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
                            <Award className="h-3.5 w-3.5" />
                            Digital Certificate Platform
                        </div>
                        <h2 className="text-3xl font-bold leading-snug tracking-tight">
                            Issue &amp; manage<br />certificates with ease
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
                            A complete platform for colleges and institutions to run
                            events, generate certificates, and let participants verify
                            them instantly.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {features.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                                    <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-sm text-primary-foreground/85">{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom quote / tagline */}
                <p className="relative z-10 text-xs text-primary-foreground/50">
                    © {new Date().getFullYear()} {appName} Platform
                </p>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 lg:px-16">

                {/* Mobile-only logo */}
                <Link href={home()} className="mb-8 flex items-center gap-2 lg:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <img src="/apple-touch-icon.png" alt={appName} className="h-6 w-6 object-contain" />
                    </div>
                    <span className="font-bold tracking-tight">{appName}</span>
                </Link>

                <div className="w-full max-w-sm">
                    {title && (
                        <div className="mb-8 text-center">
                            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                            {description && (
                                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
