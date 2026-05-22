import type { CertificateProps } from '../types';

export default function Winners({ participant, event, logos, signatures }: CertificateProps) {
    const gold = '#b8860b';
    const goldLight = '#fef9ee';
    const dark = '#1c1400';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;600;700&family=EB+Garamond:wght@400;600&display=swap');
            `}</style>

            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '2rem 0' }}>
                <div
                    id="certificate-paper"
                    style={{
                        position: 'relative',
                        width: '297mm',
                        height: '210mm',
                        background: goldLight,
                        fontFamily: '"EB Garamond", Georgia, serif',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    }}
                >
                    {/* Outer triple border */}
                    <div style={{ position: 'absolute', inset: 0, border: `14px solid ${gold}`, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: '1rem', border: `2px solid ${gold}`, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: '1.25rem', border: `1px solid ${gold}`, pointerEvents: 'none' }} />

                    {/* Corner stars */}
                    {([['top-left', '1.5rem', 'auto', 'auto', '1.5rem'], ['top-right', '1.5rem', '1.5rem', 'auto', 'auto'], ['bottom-left', 'auto', 'auto', '1.5rem', '1.5rem'], ['bottom-right', 'auto', '1.5rem', '1.5rem', 'auto']] as const).map(([key, top, right, bottom, left]) => (
                        <span key={key} style={{ position: 'absolute', top, right, bottom, left, color: gold, fontSize: '20px', lineHeight: 1 }}>★</span>
                    ))}

                    {/* Trophy watermark */}
                    <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', color: gold, opacity: 0.07, fontSize: '140px', pointerEvents: 'none', lineHeight: 1 }}>
                        🏆
                    </div>

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 10, display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '2.5rem 5rem' }}>

                        {/* Logos */}
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                {logos.slice(0, 2).map((logo) => (
                                    <img key={logo.id} src={`/storage/${logo.logo}`} alt={logo.logo_name}
                                        style={{ height: '52px', width: '52px', objectFit: 'contain' }}
                                    />
                                ))}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontFamily: '"Cinzel", serif', fontSize: '9px', letterSpacing: '0.35em', color: gold }}>
                                    {event.event_name.toUpperCase()}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                {logos.slice(2).map((logo) => (
                                    <img key={logo.id} src={`/storage/${logo.logo}`} alt={logo.logo_name}
                                        style={{ height: '52px', width: '52px', objectFit: 'contain' }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ height: '1px', width: '50px', background: gold }} />
                                <span style={{ color: gold, fontSize: '20px' }}>★</span>
                                <div style={{ height: '1px', width: '50px', background: gold }} />
                            </div>
                            <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: '26px', fontWeight: 700, color: dark, letterSpacing: '0.2em', margin: 0 }}>
                                Certificate of Achievement
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <div style={{ height: '1px', width: '50px', background: gold }} />
                                <span style={{ color: gold, fontSize: '20px' }}>★</span>
                                <div style={{ height: '1px', width: '50px', background: gold }} />
                            </div>
                        </div>

                        {/* Name */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '12px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                                proudly presented to
                            </p>
                            <p style={{ fontFamily: '"Great Vibes", cursive', fontSize: '60px', color: dark, lineHeight: 1.1, margin: '4px 0' }}>
                                {participant.name}
                            </p>
                            <div style={{ height: '2px', width: '320px', background: `linear-gradient(to right, transparent, ${gold}, transparent)`, margin: '4px auto' }} />
                            <p style={{ fontSize: '13px', color: '#555', marginTop: '8px', marginBottom: 0 }}>
                                for achieving excellence and winning in
                            </p>
                            <p style={{ fontSize: '21px', fontWeight: 600, color: dark, marginTop: '4px', marginBottom: 0, fontFamily: '"Cinzel", serif' }}>
                                {event.event_name}
                            </p>
                        </div>

                        {/* Signatures */}
                        <div style={{ display: 'flex', width: '100%', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                            {signatures.map((sig) => (
                                <div key={sig.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <img src={`/storage/${sig.signature}`} alt={sig.name}
                                        style={{ height: '44px', width: '120px', objectFit: 'contain' }}
                                    />
                                    <div style={{ height: '1px', width: '130px', background: gold, marginTop: '2px' }} />
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: dark, marginTop: '3px', marginBottom: 0 }}>{sig.name}</p>
                                    <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>{sig.designation}</p>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: '9px', color: '#aaa', fontFamily: 'monospace', margin: 0 }}>Cert No: {participant.certificate_no}</p>
                            <p style={{ fontSize: '9px', color: '#aaa', margin: 0 }}>{event.year}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
