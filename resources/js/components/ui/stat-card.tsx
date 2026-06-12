import type { ComponentType } from 'react';

interface StatCardProps {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    iconBg?: string;
    iconColor?: string;
    valueColor?: string;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    iconBg    = 'bg-muted',
    iconColor = 'text-muted-foreground',
    valueColor = '',
}: StatCardProps) {
    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div>
                    <p className={`text-2xl font-bold ${valueColor}`}>{value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                </div>
            </div>
        </div>
    );
}
