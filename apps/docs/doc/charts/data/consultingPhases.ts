export interface HoursRow {
    service: string;
    discovery: number;
    build: number;
    deploy: number;
}

export const consultingPhases: HoursRow[] = [
    { service: 'Strategy', discovery: 180, build: 50, deploy: 30 },
    { service: 'UX / Research', discovery: 140, build: 60, deploy: 30 },
    { service: 'Engineering', discovery: 60, build: 340, deploy: 160 },
    { service: 'Data', discovery: 80, build: 220, deploy: 80 },
    { service: 'DevOps', discovery: 40, build: 160, deploy: 200 },
    { service: 'QA', discovery: 40, build: 180, deploy: 120 }
];

export const HOURLY_RATE = 185;
