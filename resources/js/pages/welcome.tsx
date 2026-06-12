import { Head, Link, usePage } from '@inertiajs/react';
import { Award } from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props as { auth: { user: unknown } };

    return (
        <>
            <Head title="E-Certificate Platform" />

            <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">

                {/* ── Decorative SVG background ── */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    {/* Large blurred blobs */}
                    <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
                    <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[100px]" />
                    <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />

                    {/* Animated curve lines SVG */}
                    <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 1440 900"
                        preserveAspectRatio="xMidYMid slice"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <style>{`
                                @keyframes dash1 { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
                                @keyframes dash2 { from { stroke-dashoffset: 1600; } to { stroke-dashoffset: 0; } }
                                @keyframes dash3 { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
                                @keyframes dash4 { from { stroke-dashoffset: 1800; } to { stroke-dashoffset: 0; } }
                                @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
                                @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(14px); } }
                                @keyframes pulse-dot { 0%,100% { opacity: 0.4; r: 4; } 50% { opacity: 1; r: 6; } }
                                .curve1 { stroke-dasharray: 1200; animation: dash1 3s ease forwards; }
                                .curve2 { stroke-dasharray: 1600; animation: dash2 3.5s ease forwards 0.3s; }
                                .curve3 { stroke-dasharray: 1000; animation: dash3 2.8s ease forwards 0.5s; }
                                .curve4 { stroke-dasharray: 1800; animation: dash4 4s ease forwards 0.2s; }
                                .float-g1 { animation: float1 6s ease-in-out infinite; }
                                .float-g2 { animation: float2 8s ease-in-out infinite; }
                                .pdot { animation: pulse-dot 2.5s ease-in-out infinite; }
                            `}</style>
                        </defs>

                        {/* Sweeping curves */}
                        <path
                            className="curve1"
                            d="M-100 600 Q200 200 500 400 T1100 200 T1600 500"
                            fill="none" stroke="currentColor" strokeWidth="1.5"
                            strokeOpacity="0.12"
                        />
                        <path
                            className="curve2"
                            d="M-100 300 Q300 700 700 350 T1300 600 T1700 300"
                            fill="none" stroke="currentColor" strokeWidth="1"
                            strokeOpacity="0.08"
                        />
                        <path
                            className="curve3"
                            d="M200 900 Q500 400 800 650 T1400 300"
                            fill="none" stroke="currentColor" strokeWidth="1.5"
                            strokeOpacity="0.10"
                        />
                        <path
                            className="curve4"
                            d="M0 150 Q400 500 750 250 T1440 700"
                            fill="none" stroke="currentColor" strokeWidth="0.8"
                            strokeOpacity="0.07"
                        />

                        {/* Floating dashed circles */}
                        <g className="float-g1" style={{ transformOrigin: '200px 200px' }}>
                            <circle cx="200" cy="200" r="80" fill="none" stroke="currentColor"
                                strokeWidth="1" strokeDasharray="8 6" strokeOpacity="0.12" />
                            <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor"
                                strokeWidth="0.6" strokeDasharray="4 8" strokeOpacity="0.07" />
                        </g>

                        <g className="float-g2" style={{ transformOrigin: '1250px 700px' }}>
                            <circle cx="1250" cy="700" r="100" fill="none" stroke="currentColor"
                                strokeWidth="1" strokeDasharray="6 5" strokeOpacity="0.10" />
                            <circle cx="1250" cy="700" r="150" fill="none" stroke="currentColor"
                                strokeWidth="0.6" strokeDasharray="4 10" strokeOpacity="0.06" />
                        </g>

                        {/* Small floating dashed ring top-right */}
                        <g className="float-g1" style={{ transformOrigin: '1300px 150px' }}>
                            <circle cx="1300" cy="150" r="50" fill="none" stroke="currentColor"
                                strokeWidth="1" strokeDasharray="5 4" strokeOpacity="0.10" />
                        </g>

                        {/* Pulsing dots scattered */}
                        {[
                            [320, 480], [720, 180], [1050, 420], [880, 720],
                            [150, 750], [1380, 380], [560, 820], [1100, 100],
                        ].map(([cx, cy], i) => (
                            <circle
                                key={i}
                                className="pdot"
                                cx={cx} cy={cy} r="4"
                                fill="currentColor" fillOpacity="0.25"
                                style={{ animationDelay: `${i * 0.4}s` }}
                            />
                        ))}

                        {/* Grid dots pattern top-right quadrant */}
                        {Array.from({ length: 6 }).map((_, row) =>
                            Array.from({ length: 10 }).map((_, col) => (
                                <circle
                                    key={`${row}-${col}`}
                                    cx={900 + col * 36}
                                    cy={60 + row * 36}
                                    r="1.5"
                                    fill="currentColor"
                                    fillOpacity="0.12"
                                />
                            ))
                        )}

                        {/* Grid dots pattern bottom-left */}
                        {Array.from({ length: 5 }).map((_, row) =>
                            Array.from({ length: 7 }).map((_, col) => (
                                <circle
                                    key={`bl-${row}-${col}`}
                                    cx={20 + col * 36}
                                    cy={680 + row * 36}
                                    r="1.5"
                                    fill="currentColor"
                                    fillOpacity="0.10"
                                />
                            ))
                        )}
                    </svg>
                </div>

                {/* ── Navbar ── */}
                <header className="sticky top-0 z-20 border-b border-border/50 bg-background/70 backdrop-blur-lg">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <img src="/apple-touch-icon.png" alt="E-Certificate" className="h-8 w-8 rounded-lg object-contain" />
                            <span className="text-base font-bold tracking-tight">E-Certificate</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            <Link
                                href="/certificate/search"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Verify Certificate
                            </Link>
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50"
                                >
                                    Log in
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">

                    {/* Badge */}
                    <div
                        className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                        style={{ animation: 'fadeSlideUp 0.6s ease forwards', opacity: 0 }}
                    >
                        <Award className="h-3.5 w-3.5" />
                        Digital Certificate Management
                    </div>

                    {/* Headline */}
                    <h1
                        className="mb-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
                        style={{ animation: 'fadeSlideUp 0.6s ease 0.15s forwards', opacity: 0 }}
                    >
                        Issue &amp; Verify{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-primary">Certificates</span>
                            {/* Underline squiggle */}
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 8 Q75 2 150 8 T300 8" stroke="currentColor" strokeWidth="3" fill="none" className="text-primary/40" strokeLinecap="round"/>
                            </svg>
                        </span>
                        {' '}with Confidence
                    </h1>

                    {/* Subtext */}
                    <p
                        className="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground"
                        style={{ animation: 'fadeSlideUp 0.6s ease 0.3s forwards', opacity: 0 }}
                    >
                        A complete platform to manage events, import participants,
                        generate certificates from custom templates, and deliver
                        them securely by email.
                    </p>

                    {/* CTAs */}
                    <div
                        className="flex flex-wrap items-center justify-center gap-3"
                        style={{ animation: 'fadeSlideUp 0.6s ease 0.45s forwards', opacity: 0 }}
                    >
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="group relative overflow-hidden rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
                            >
                                <span className="relative z-10">Go to Dashboard</span>
                                <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0" />
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="group relative overflow-hidden rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
                            >
                                <span className="relative z-10">Log in to Dashboard</span>
                                <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0" />
                            </Link>
                        )}
                        <Link
                            href="/certificate/search"
                            className="rounded-xl border border-border px-7 py-3 text-sm font-semibold backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-md"
                        >
                            Verify a Certificate
                        </Link>
                    </div>

                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-border/50 px-6 py-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} E-Certificate Platform. All rights reserved.
                </footer>
            </div>

            <style>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
