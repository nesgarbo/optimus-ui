export interface RevenueSegment {
    year: string;
    hardware: number;
    software: number;
    subscriptions: number;
    cloud: number;
    professional: number;
    support: number;
}

export const revenueSegments: RevenueSegment[] = [
    { year: '2019', hardware: 145, software: 82, subscriptions: 48, cloud: 78, professional: 42, support: 28 },
    { year: '2020', hardware: 132, software: 95, subscriptions: 58, cloud: 98, professional: 38, support: 32 },
    { year: '2021', hardware: 158, software: 112, subscriptions: 74, cloud: 142, professional: 52, support: 38 },
    { year: '2022', hardware: 172, software: 135, subscriptions: 96, cloud: 198, professional: 64, support: 44 },
    { year: '2023', hardware: 168, software: 158, subscriptions: 118, cloud: 245, professional: 71, support: 49 }
];
