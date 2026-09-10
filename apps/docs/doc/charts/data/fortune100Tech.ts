export interface Company {
    name: string;
    rev: number;
    margin: number;
}

export const software: Company[] = [
    { name: 'Microsoft', rev: 211.9, margin: 36.4 },
    { name: 'Oracle', rev: 49.9, margin: 17.4 },
    { name: 'Adobe', rev: 19.4, margin: 27.8 },
    { name: 'Salesforce', rev: 34.9, margin: 11.9 },
    { name: 'Intuit', rev: 14.4, margin: 18.9 },
    { name: 'ServiceNow', rev: 8.9, margin: 14.0 }
];

export const hardware: Company[] = [
    { name: 'Apple', rev: 383.3, margin: 25.3 },
    { name: 'HP', rev: 53.7, margin: 5.8 },
    { name: 'Dell', rev: 88.4, margin: 3.1 },
    { name: 'HPE', rev: 29.1, margin: 7.3 }
];

export const internet: Company[] = [
    { name: 'Alphabet', rev: 307.4, margin: 24.0 },
    { name: 'Meta', rev: 134.9, margin: 29.0 },
    { name: 'Amazon', rev: 574.8, margin: 5.3 },
    { name: 'Netflix', rev: 33.7, margin: 16.0 }
];

export const semis: Company[] = [
    { name: 'Nvidia', rev: 60.9, margin: 48.9 },
    { name: 'Intel', rev: 54.2, margin: -3.0 },
    { name: 'AMD', rev: 22.7, margin: 3.8 },
    { name: 'Qualcomm', rev: 35.8, margin: 20.2 },
    { name: 'Broadcom', rev: 35.8, margin: 39.3 },
    { name: 'Texas Instruments', rev: 17.5, margin: 37.2 }
];

export const allCompanies = [...software, ...hardware, ...internet, ...semis];
export const INDUSTRY_AVG_MARGIN = allCompanies.reduce((s, c) => s + c.margin, 0) / allCompanies.length;
