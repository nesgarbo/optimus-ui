export interface CompanyNode {
    nodeId: string;
    parent: string | null;
    name: string;
    industry: string;
    revenue: number;
    rank?: number;
    country?: string;
    flag?: string;
    employees?: number;
}

export const companies: CompanyNode[] = [
    { nodeId: 'walmart', parent: 'retail', name: 'Walmart', industry: 'Retail', revenue: 648, rank: 1, country: 'USA', flag: '🇺🇸', employees: 2100000 },
    { nodeId: 'amazon', parent: 'retail', name: 'Amazon', industry: 'Retail', revenue: 575, rank: 2, country: 'USA', flag: '🇺🇸', employees: 1525000 },
    { nodeId: 'costco', parent: 'retail', name: 'Costco', industry: 'Retail', revenue: 242, rank: 15, country: 'USA', flag: '🇺🇸', employees: 316000 },

    { nodeId: 'stategrid', parent: 'energy', name: 'State Grid', industry: 'Energy', revenue: 546, rank: 3, country: 'China', flag: '🇨🇳', employees: 1350000 },
    { nodeId: 'aramco', parent: 'energy', name: 'Saudi Aramco', industry: 'Energy', revenue: 480, rank: 4, country: 'Saudi Arabia', flag: '🇸🇦', employees: 73000 },
    { nodeId: 'sinopec', parent: 'energy', name: 'Sinopec', industry: 'Energy', revenue: 429, rank: 5, country: 'China', flag: '🇨🇳', employees: 524000 },
    { nodeId: 'petrochina', parent: 'energy', name: 'PetroChina', industry: 'Energy', revenue: 412, rank: 6, country: 'China', flag: '🇨🇳', employees: 1087000 },
    { nodeId: 'exxon', parent: 'energy', name: 'ExxonMobil', industry: 'Energy', revenue: 345, rank: 10, country: 'USA', flag: '🇺🇸', employees: 61500 },
    { nodeId: 'shell', parent: 'energy', name: 'Shell', industry: 'Energy', revenue: 323, rank: 11, country: 'UK', flag: '🇬🇧', employees: 96000 },

    { nodeId: 'apple', parent: 'tech', name: 'Apple', industry: 'Tech', revenue: 391, rank: 7, country: 'USA', flag: '🇺🇸', employees: 161000 },
    { nodeId: 'alphabet', parent: 'tech', name: 'Alphabet', industry: 'Tech', revenue: 307, rank: 12, country: 'USA', flag: '🇺🇸', employees: 182000 },
    { nodeId: 'microsoft', parent: 'tech', name: 'Microsoft', industry: 'Tech', revenue: 245, rank: 14, country: 'USA', flag: '🇺🇸', employees: 228000 },

    { nodeId: 'unitedhealth', parent: 'healthcare', name: 'UnitedHealth', industry: 'Healthcare', revenue: 372, rank: 8, country: 'USA', flag: '🇺🇸', employees: 440000 },

    { nodeId: 'berkshire', parent: 'finance', name: 'Berkshire Hathaway', industry: 'Finance', revenue: 365, rank: 9, country: 'USA', flag: '🇺🇸', employees: 396500 },

    { nodeId: 'toyota', parent: 'auto', name: 'Toyota', industry: 'Auto', revenue: 296, rank: 13, country: 'Japan', flag: '🇯🇵', employees: 380000 }
];
