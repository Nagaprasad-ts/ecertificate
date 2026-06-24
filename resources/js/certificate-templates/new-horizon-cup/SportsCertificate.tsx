import type { CertificateProps } from '../types';

type SportData = {
    college?: string;
    achievement?: string;
    sport?: string;
    category?: string;
    gender?: string;
};

export default function SportsCertificate({ participant, logos }: CertificateProps) {
    const d = (participant.data ?? {}) as SportData;
    const honorific = d.gender === 'Female' ? 'Ms.' : d.gender === 'Male' ? 'Mr.' : 'Mr./Ms.';

    const val = (value: string | undefined) => (
        <span style={{ color: '#1a237e', fontWeight: 800 }}>{value ?? ''}</span>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@600;700;800&display=swap');
            `}</style>

            <div style={{
                display: 'flex', minHeight: '100vh',
                alignItems: 'flex-start', justifyContent: 'center',
                background: '#e5e7eb',
                padding: '2rem',
                overflowX: 'auto',   /* scroll on small screens instead of squishing */
            }}>
                <div
                    id="certificate-paper"
                    style={{
                        position: 'relative',
                        // FIX: Explicit structural pixel dimensions based on exact standard aspect ratios 
                        width: '1123px',
                        height: '794px',
                        minWidth: '1123px',
                        minHeight: '794px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        fontFamily: '"Open Sans", Arial, sans-serif',
                        backgroundColor: '#ffffff',
                    }}
                >
                    {/* Background Asset */}
                    <img
                        src="/certificate-backgrounds/new-horizon-cup.png"
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '1123px',
                            height: '794px',
                            objectFit: 'fill',
                            display: 'block',
                            zIndex: 1
                        }}
                    />

                    {/* Logos Overlay — no transform, html2canvas-safe centering */}
                    {logos.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            zIndex: 10,
                        }}>
                            {logos.map((logo) => (
                                <img
                                    key={logo.id}
                                    src={`/storage/${logo.logo}`}
                                    alt={logo.logo_name}
                                    style={{
                                        height: '124px',
                                        width: '256px',
                                        objectFit: 'contain',
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Main Paragraph */}
                    <div style={{
                        position: 'absolute',
                        top: '408px', // Replaced mm measurements with hard pixel locations
                        left: '210px',
                        right: '210px',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#111111',
                        lineHeight: 1.95,
                        zIndex: 10,
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: 0 }}>
                            This is to certify that {honorific}&nbsp;{val(participant.name)} of&nbsp;
                            {val(d.college)} has achieved&nbsp;{val(d.achievement)} in&nbsp;
                            {val(d.sport)}{d.category ? <> ({val(d.category)})</> : null} at the
                            State Level Inter-Collegiate Sports Fest held at New Horizon College of
                            Engineering from 27<sup style={{ fontSize: '10px' }}>th</sup> to&nbsp;
                            29<sup style={{ fontSize: '10px' }}>th</sup> December 2023.
                        </p>
                    </div>

                    {/* Signatures Footer */}
                    <div style={{
                        position: 'absolute',
                        bottom: '45px',
                        left: '240px',
                        right: '270px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        zIndex: 10
                    }}>
                        <div style={{ textAlign: 'center', minWidth: '160px' }}>
                            <div style={{ borderTop: '1.5px solid #111', paddingTop: '3px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0 }}>
                                    Physical Education Director
                                </p>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', minWidth: '120px' }}>
                            <div style={{ borderTop: '1.5px solid #111', paddingTop: '3px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', margin: 0 }}>
                                    Principal
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Validation Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: '22px',
                        left: '40%',
                        textAlign: 'left',
                        fontFamily: 'monospace',
                        lineHeight: 1.5,
                        zIndex: 10
                    }}>
                        <a href={`/certificate/${participant.certificate_no}`} target="_blank">Cert No:&nbsp;{participant.certificate_no}</a>
                    </div>
                </div>
            </div>
        </>
    );
}