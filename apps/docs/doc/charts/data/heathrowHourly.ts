export interface HourSlot {
    hour: string;
    flights: number;
}

export const heathrowHourly: HourSlot[] = [
    { hour: '00', flights: 0 },
    { hour: '01', flights: 0 },
    { hour: '02', flights: 0 },
    { hour: '03', flights: 0 },
    { hour: '04', flights: 0 },
    { hour: '05', flights: 8 },
    { hour: '06', flights: 68 },
    { hour: '07', flights: 78 },
    { hour: '08', flights: 85 },
    { hour: '09', flights: 72 },
    { hour: '10', flights: 65 },
    { hour: '11', flights: 62 },
    { hour: '12', flights: 55 },
    { hour: '13', flights: 58 },
    { hour: '14', flights: 62 },
    { hour: '15', flights: 70 },
    { hour: '16', flights: 75 },
    { hour: '17', flights: 68 },
    { hour: '18', flights: 55 },
    { hour: '19', flights: 45 },
    { hour: '20', flights: 32 },
    { hour: '21', flights: 18 },
    { hour: '22', flights: 8 },
    { hour: '23', flights: 2 }
];

export const TOTAL = heathrowHourly.reduce((s, d) => s + d.flights, 0);
export const MAX = Math.max(...heathrowHourly.map((d) => d.flights));
