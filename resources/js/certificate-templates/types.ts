export type Logo = {
    id: number;
    logo_name: string;
    logo: string;
};

export type Signature = {
    id: number;
    name: string;
    designation: string;
    signature: string;
    resignation_date: string;
};

export type Participant = {
    name: string;
    certificate_no: string;
    data?: Record<string, unknown>;
};

export type CertificateEvent = {
    event_name: string;
    year: number;
};

export type CertificateProps = {
    participant: Participant;
    event: CertificateEvent;
    logos: Logo[];
    signatures: Signature[];
};
