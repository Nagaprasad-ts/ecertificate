import type { CertificateProps } from '../types';

export default function Participation({ participant, event, logos, signatures }: CertificateProps) {
    const accent = '#1e40af';
    const accentGold = '#c9a84c';

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
                        background: '#ffffff',
                        fontFamily: '"EB Garamond", Georgia, serif',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    }}
                >
                    {/* Side accent bars */}
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '12px', background: accent }} />
                    <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '12px', background: accent }} />

                    {/* Top bar */}
                    <div style={{ position: 'absolute', top: 0, left: '12px', right: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 2.5rem', background: accent }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {logos.slice(0, 2).map((logo) => (
                                <img key={logo.id} src={`/storage/${logo.logo}`} alt={logo.logo_name}
                                    style={{ height: '40px', width: '40px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                                />
                            ))}
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', letterSpacing: '0.25em', margin: 0 }}>
                            {event.event_name.toUpperCase()} · {event.year}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {logos.slice(2).map((logo) => (
                                <img key={logo.id} src={`/storage/${logo.logo}`} alt={logo.logo_name}
                                    style={{ height: '40px', width: '40px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Gold border inset */}
                    <div style={{ position: 'absolute', top: '60px', left: '20px', right: '20px', bottom: '16px', border: `2px solid ${accentGold}`, pointerEvents: 'none' }} />

                    {/* Content */}
                    <div style={{ position: 'absolute', top: '72px', left: '40px', right: '40px', bottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 3rem' }}>

                        {/* Title */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', letterSpacing: '0.4em', color: accent, textTransform: 'uppercase', margin: 0 }}>
                                Certificate of Participation
                            </p>
                            <div style={{ height: '2px', width: '80px', background: accentGold, margin: '8px auto 0' }} />
                        </div>

                        {/* Name */}
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', color: '#666', marginBottom: '6px', marginTop: 0 }}>This is to certify that</p>
                            <p style={{ fontFamily: '"Great Vibes", cursive', fontSize: '56px', color: '#111', lineHeight: 1.1, margin: 0 }}>
                                {participant.name}
                            </p>
                            <div style={{ height: '1.5px', width: '300px', background: accentGold, margin: '6px auto' }} />
                            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', marginBottom: 0 }}>
                                has successfully participated in
                            </p>
                            <p style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a2e', marginTop: '4px', marginBottom: 0 }}>
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
                                    <div style={{ height: '1px', width: '130px', background: '#999', marginTop: '2px' }} />
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#222', marginTop: '3px', marginBottom: 0 }}>{sig.name}</p>
                                    <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>{sig.designation}</p>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: '9px', color: '#bbb', fontFamily: 'monospace', margin: 0 }}>
                                Cert No: {participant.certificate_no}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent }} />
                                <p style={{ fontSize: '9px', color: '#bbb', margin: 0 }}>{event.year}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
