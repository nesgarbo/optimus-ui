export interface EbitdaStep {
    item: string;
    core: number;
    incremental: number;
    isTotal: boolean;
}

export const ebitdaBridge: EbitdaStep[] = [
    { item: 'ARR Revenue', core: 130, incremental: 70, isTotal: false },
    { item: 'Services Revenue', core: 40, incremental: 20, isTotal: false },
    { item: 'Infrastructure', core: -55, incremental: -25, isTotal: false },
    { item: 'R&D', core: -50, incremental: -20, isTotal: false },
    { item: 'Sales & Marketing', core: -30, incremental: -20, isTotal: false },
    { item: 'G&A', core: -12, incremental: -8, isTotal: false },
    { item: 'EBITDA', core: 0, incremental: 0, isTotal: true }
];
