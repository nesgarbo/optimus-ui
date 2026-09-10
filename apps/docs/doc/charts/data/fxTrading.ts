export interface HourSlot {
    hour: string;
    volume: number;
    session: string;
}

export const fxHourly: HourSlot[] = [
    { hour: '00', volume: 38, session: 'Tokyo' },
    { hour: '01', volume: 46, session: 'Tokyo' },
    { hour: '02', volume: 56, session: 'Tokyo' },
    { hour: '03', volume: 64, session: 'Tokyo' },
    { hour: '04', volume: 70, session: 'Tokyo' },
    { hour: '05', volume: 66, session: 'Tokyo' },
    { hour: '06', volume: 58, session: 'Tokyo' },
    { hour: '07', volume: 50, session: 'Tokyo / London' },
    { hour: '08', volume: 64, session: 'London' },
    { hour: '09', volume: 76, session: 'London' },
    { hour: '10', volume: 82, session: 'London' },
    { hour: '11', volume: 86, session: 'London' },
    { hour: '12', volume: 90, session: 'London' },
    { hour: '13', volume: 96, session: 'London / New York' },
    { hour: '14', volume: 100, session: 'London / New York' },
    { hour: '15', volume: 98, session: 'London / New York' },
    { hour: '16', volume: 91, session: 'London / New York' },
    { hour: '17', volume: 76, session: 'New York' },
    { hour: '18', volume: 64, session: 'New York' },
    { hour: '19', volume: 52, session: 'New York' },
    { hour: '20', volume: 42, session: 'New York' },
    { hour: '21', volume: 34, session: 'New York' },
    { hour: '22', volume: 26, session: 'Sydney' },
    { hour: '23', volume: 30, session: 'Sydney' }
];

export const SESSION_PAIRS: Record<string, string[]> = {
    Tokyo: ['USD/JPY', 'EUR/JPY', 'AUD/JPY'],
    'Tokyo / London': ['USD/JPY', 'EUR/USD'],
    London: ['EUR/USD', 'GBP/USD', 'USD/CHF'],
    'London / New York': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD'],
    'New York': ['USD/CAD', 'EUR/USD', 'USD/MXN'],
    Sydney: ['AUD/USD', 'NZD/USD', 'AUD/JPY']
};
