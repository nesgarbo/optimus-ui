export interface UsageRow {
    metric: string;
    free: number;
    pro: number;
    enterprise: number;
}

export const saasTier: UsageRow[] = [
    { metric: 'Active users', free: 340, pro: 120, enterprise: 48 },
    { metric: 'Sessions/day', free: 270, pro: 180, enterprise: 92 },
    { metric: 'Features used', free: 80, pro: 220, enterprise: 160 },
    { metric: 'API calls', free: 40, pro: 190, enterprise: 210 },
    { metric: 'Integrations', free: 25, pro: 140, enterprise: 195 },
    { metric: 'Workspace seats', free: 60, pro: 170, enterprise: 230 }
];
