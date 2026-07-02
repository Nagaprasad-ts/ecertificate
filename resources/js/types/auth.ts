export type Role = {
    id: number;
    name: string;
    slug: string;
};

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role?: Role | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type AppNotification = {
    id: string;
    data: {
        message: string;
        reason: string | null;
        email_log_id: number;
        to_address: string;
        to_name: string;
        subject: string;
        sent_by_name: string | null;
    };
    created_at: string;
};

export type Auth = {
    user: User;
    permissions: string[];
    is_super_admin: boolean;
    unread_notifications: AppNotification[];
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
