import { Head, Link } from '@inertiajs/react';
import { Award, ShieldCheck } from 'lucide-react';

const appName = import.meta.env.VITE_APP_NAME ?? 'Certificates NHEI';

export default function Welcome() {
    return (
        <>
            <Head title={appName} />

            <div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">

                {/* ── Decorative background ── */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/15 blur-[120px]" />
                    <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
                    <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[80px]" />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <style>{`
                                @keyframes dash1 { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
                                @keyframes dash2 { from { stroke-dashoffset: 1600; } to { stroke-dashoffset: 0; } }
                                @keyframes dash3 { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
                                @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-16px); } }
                                @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(12px); } }
                                @keyframes pdot  { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }
                                .c1 { stroke-dasharray: 1200; animation: dash1 3s ease forwards; }
                                .c2 { stroke-dasharray: 1600; animation: dash2 3.5s ease forwards 0.3s; }
                                .c3 { stroke-dasharray: 1000; animation: dash3 2.8s ease forwards 0.5s; }
                                .fg1 { animation: float1 6s ease-in-out infinite; }
                                .fg2 { animation: float2 8s ease-in-out infinite; }
                                .pd  { animation: pdot 2.5s ease-in-out infinite; }
                            `}</style>
                        </defs>
                        <path className="c1" d="M-100 600 Q200 200 500 400 T1100 200 T1600 500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.10" />
                        <path className="c2" d="M-100 300 Q300 700 700 350 T1300 600 T1700 300" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" />
                        <path className="c3" d="M200 900 Q500 400 800 650 T1400 300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.08" />
                        <g className="fg1" style={{ transformOrigin: '200px 200px' }}>
                            <circle cx="200" cy="200" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 6" strokeOpacity="0.10" />
                            <circle cx="200" cy="200" r="130" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" strokeOpacity="0.06" />
                        </g>
                        <g className="fg2" style={{ transformOrigin: '1260px 700px' }}>
                            <circle cx="1260" cy="700" r="100" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 5" strokeOpacity="0.08" />
                            <circle cx="1260" cy="700" r="160" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 10" strokeOpacity="0.05" />
                        </g>
                        {[[320,480],[720,180],[1050,420],[880,720],[150,750],[1380,380],[560,820],[1100,100]].map(([cx,cy],i) => (
                            <circle key={i} className="pd" cx={cx} cy={cy} r="3" fill="currentColor" fillOpacity="0.20" style={{ animationDelay: `${i * 0.4}s` }} />
                        ))}
                        {Array.from({ length: 6 }).flatMap((_, row) =>
                            Array.from({ length: 10 }).map((_, col) => (
                                <circle key={`${row}-${col}`} cx={900 + col * 36} cy={60 + row * 36} r="1.5" fill="currentColor" fillOpacity="0.08" />
                            ))
                        )}
                    </svg>
                </div>

                {/* ── Nav ── */}
                <header className="sticky top-0 z-20 border-b border-border/40 bg-background/70 backdrop-blur-lg">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
                        <Link href="/" className="flex items-center gap-2.5">
                            <img src="/apple-touch-icon.png" alt={appName} className="h-8 w-8 rounded-lg object-contain" />
                            <span className="font-bold tracking-tight">{appName}</span>
                        </Link>
                        <nav>
                            <Link
                                href="/certificate/search"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                Verify Certificate
                            </Link>
                        </nav>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">

                    <div
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                        style={{ animation: 'fadeUp 0.6s ease both' }}
                    >
                        <Award className="h-3.5 w-3.5" />
                        Certificate Verification Portal
                    </div>

                    <h1
                        className="mb-6 max-w-3xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
                        style={{ animation: 'fadeUp 0.6s ease 0.12s both' }}
                    >
                        Your Certificate,{' '}
                        <span className="relative inline-block text-primary">
                            Verified
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 7 Q50 1 100 7 T200 7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeOpacity="0.45" />
                            </svg>
                        </span>
                        {' '}in Seconds
                    </h1>

                    <p
                        className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground"
                        style={{ animation: 'fadeUp 0.6s ease 0.24s both' }}
                    >
                        Enter your certificate number to instantly confirm its authenticity.
                        Each certificate is uniquely numbered and permanently verifiable.
                    </p>

                    <div style={{ animation: 'fadeUp 0.6s ease 0.36s both' }}>
                        <Link
                            href="/certificate/search"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-xl hover:shadow-primary/35"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Verify a Certificate
                        </Link>
                    </div>
                </section>

            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
