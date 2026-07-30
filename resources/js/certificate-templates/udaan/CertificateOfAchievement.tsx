import type { CertificateProps } from '../types';

type AchievementData = {
    position?: string;
    title?: string;
};

export default function CertificateOfAchievement({ participant }: CertificateProps) {
    const d = (participant.data ?? {}) as AchievementData;

    const val = (value: string | undefined) => (
        <span style={{ color: '#1a237e', fontWeight: 800 }}>{value ?? ''}</span>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
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
                    {/* Background Asset — logos, headings and signatures are baked into this image */}
                    <img
                        src="/certificate-backgrounds/udaan/udaan-certificate-of-achivement-2026.jpg"
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '1123px',
                            height: '794px',
                            objectFit: 'fill',
                            display: 'block',
                            zIndex: 1,
                        }}
                    />

                    {/* Presented To */}
                    <div style={{
                        position: 'absolute',
                        top: '450px',
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        zIndex: 10,
                    }}>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: '#374151' }}>
                            This Certificate is Presented To{' '}<br/>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#1a237e' }}>
                                {participant.name}
                            </span>
                        </p>
                    </div>

                    {/* Main Paragraph */}
                    <div style={{
                        position: 'absolute',
                        top: '515px',
                        left: '260px',
                        right: '260px',
                        fontSize: '15px',
                        fontWeight: 400,
                        color: '#111111',
                        lineHeight: 1.75,
                        textAlign: 'center',
                        zIndex: 10,
                    }}>
                        <p style={{ margin: 0 }}>
                            for securing the {val(d.position)} Position in the{' '}
                            <strong>UDAAN Intra-Institutional Business Plan Competition 2026</strong> with the idea
                            titled &ldquo;{val(d.title)}&rdquo;, organised by the{' '}
                            <strong>
                                New Horizon Council for Innovation, Incubation and Entrepreneurship (NHCIIE), Department of
                                Management Studies, New Horizon College of Engineering, Bengaluru
                            </strong>
                            , held from 27–29 July 2026.
                        </p>
                    </div>

                    {/* Meta Validation Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: '18px',
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        zIndex: 10,
                    }}>
                        <a
                            href={`/certificate/${participant.certificate_no}`}
                            target="_blank"
                            style={{ color: '#ffffff', textDecoration: 'none', fontSize: '12px' }}
                        >
                            Cert No:&nbsp;{participant.certificate_no}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
