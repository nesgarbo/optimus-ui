export interface DomainRow {
    domain: string;
    baseline: number;
    current: number;
}

export const cyberPosture: DomainRow[] = [
    { domain: 'Govern', baseline: 42, current: 78 },
    { domain: 'Identify', baseline: 55, current: 82 },
    { domain: 'Protect', baseline: 48, current: 88 },
    { domain: 'Detect', baseline: 35, current: 72 },
    { domain: 'Respond', baseline: 30, current: 68 },
    { domain: 'Recover', baseline: 52, current: 80 }
];
