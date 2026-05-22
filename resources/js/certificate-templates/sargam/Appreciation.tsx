import type { CertificateProps } from '../types';

export default function Appreciation({ participant, event, logos, signatures }: CertificateProps) {
    const teal = '#0f766e';
    const tealLight = '#f0fdfa';
    const gold = '#c9a84c';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
            `}</style>

            <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', padding: '2rem 0' }}>
                <div
                    id="certificate-paper"
                    style={{
                        position: 'relative',
                        width: '297mm',
                        height: '210mm',
                        background: tealLight,
                        fontFamily: '"EB Garamond", Georgia, serif',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    }}
                >
                    {/* Left decorative panel */}
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '64px', background: teal }} />

                    {/* Vertical text on panel */}
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>
                            Certificate of Appreciation
                        </p>
                    </div>

                    {/* Right accent line */}
                    <div style={{ position: 'absolute', right: '24px', top: '32px', bottom: '32px', width: '2px', background: `linear-gradient(to bottom, transparent, ${teal}, transparent)` }} />

                    {/* Gold border */}
                    <div style={{ position: 'absolute', top: '16px', left: '80px', right: '20px', bottom: '16px', border: `1.5px solid ${gold}`, pointerEvents: 'none' }} />

                    {/* Content */}
                    <div style={{ position: 'absolute', top: '20px', left: '96px', right: '36px', bottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2.5rem' }}>

                        {/* Logos + header */}
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {logos.map((logo) => (
                                    <img key={logo.id} src={`/storage/${logo.logo}`} alt={logo.logo_name}
                                        style={{ height: '48px', width: '48px', objectFit: 'contain' }}
                                    />
                                ))}
                            </div>
                            <p style={{ fontSize: '10px', letterSpacing: '0.3em', color: teal, textTransform: 'uppercase', margin: 0 }}>
                                {event.event_name} · {event.year}
                            </p>
                        </div>

                        {/* Title */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', letterSpacing: '0.5em', color: teal, textTransform: 'uppercase', marginBottom: '6px', marginTop: 0 }}>
                                ❧ Certificate of Appreciation ❧
                            </p>
                            <div style={{ height: '1.5px', width: '200px', background: gold, margin: '0 auto' }} />
                        </div>

                        {/* Name */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', color: '#777', fontStyle: 'italic', marginBottom: '6px', marginTop: 0 }}>
                                This certificate is presented to
                            </p>
                            <p style={{ fontFamily: '"Great Vibes", cursive', fontSize: '54px', color: '#111', lineHeight: 1.1, margin: 0 }}>
                                {participant.name}
                            </p>
                            <div style={{ height: '1.5px', width: '300px', background: gold, margin: '6px auto' }} />
                            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', marginBottom: 0 }}>
                                in recognition of valuable contribution to
                            </p>
                            <p style={{ fontSize: '19px', fontWeight: 600, color: teal, marginTop: '4px', marginBottom: 0 }}>
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
                                    <div style={{ height: '1px', width: '130px', background: '#aaa', marginTop: '2px' }} />
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#222', marginTop: '3px', marginBottom: 0 }}>{sig.name}</p>
                                    <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>{sig.designation}</p>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: '9px', color: '#bbb', fontFamily: 'monospace', margin: 0 }}>Cert No: {participant.certificate_no}</p>
                            <p style={{ fontSize: '9px', color: '#bbb', margin: 0 }}>{event.year}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
