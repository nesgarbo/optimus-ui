export interface ExchangeNode {
    nodeId: string;
    parent: string | null;
    label: string;
    region?: string;
    exchange?: string;
    country?: string;
    flag?: string;
    marketCap: number;
    ytd?: number;
}

export const REGIONS: { id: string; label: string }[] = [
    { id: 'americas', label: 'Americas' },
    { id: 'emea', label: 'Europe & MEA' },
    { id: 'apac', label: 'Asia-Pacific' }
];

export const exchanges: ExchangeNode[] = [
    { nodeId: 'nyse', parent: 'americas', label: 'NYSE', exchange: 'New York Stock Exchange', country: 'USA', flag: '🇺🇸', marketCap: 29.2, ytd: 14.8 },
    { nodeId: 'nasdaq', parent: 'americas', label: 'NASDAQ', exchange: 'NASDAQ', country: 'USA', flag: '🇺🇸', marketCap: 27.1, ytd: 22.1 },
    { nodeId: 'tmx', parent: 'americas', label: 'TMX', exchange: 'TMX (Toronto)', country: 'Canada', flag: '🇨🇦', marketCap: 3.1, ytd: 11.4 },
    { nodeId: 'b3', parent: 'americas', label: 'B3', exchange: 'B3 (Brazil)', country: 'Brazil', flag: '🇧🇷', marketCap: 1.0, ytd: -12.1 },

    { nodeId: 'euronext', parent: 'emea', label: 'Euronext', exchange: 'Euronext', country: 'EU', flag: '🇪🇺', marketCap: 7.2, ytd: 5.4 },
    { nodeId: 'lse', parent: 'emea', label: 'LSE', exchange: 'London Stock Exchange', country: 'UK', flag: '🇬🇧', marketCap: 3.5, ytd: 6.1 },
    { nodeId: 'tadawul', parent: 'emea', label: 'Tadawul', exchange: 'Saudi Tadawul', country: 'Saudi Arabia', flag: '🇸🇦', marketCap: 2.8, ytd: 0.5 },
    { nodeId: 'xetra', parent: 'emea', label: 'Xetra', exchange: 'Deutsche Börse', country: 'Germany', flag: '🇩🇪', marketCap: 2.4, ytd: 4.8 },
    { nodeId: 'six', parent: 'emea', label: 'SIX', exchange: 'SIX (Swiss)', country: 'Switzerland', flag: '🇨🇭', marketCap: 2.1, ytd: 2.9 },
    { nodeId: 'jse', parent: 'emea', label: 'JSE', exchange: 'JSE (Johannesburg)', country: 'South Africa', flag: '🇿🇦', marketCap: 0.9, ytd: -6.4 },

    { nodeId: 'sse', parent: 'apac', label: 'Shanghai', exchange: 'Shanghai SSE', country: 'China', flag: '🇨🇳', marketCap: 7.4, ytd: 10.2 },
    { nodeId: 'jpx', parent: 'apac', label: 'JPX', exchange: 'Japan Exchange (JPX)', country: 'Japan', flag: '🇯🇵', marketCap: 6.5, ytd: 18.6 },
    { nodeId: 'nse', parent: 'apac', label: 'NSE India', exchange: 'NSE India', country: 'India', flag: '🇮🇳', marketCap: 5.1, ytd: 8.9 },
    { nodeId: 'szse', parent: 'apac', label: 'Shenzhen', exchange: 'Shenzhen SSE', country: 'China', flag: '🇨🇳', marketCap: 5.0, ytd: -3.2 },
    { nodeId: 'hkex', parent: 'apac', label: 'HKEX', exchange: 'HKEX', country: 'Hong Kong', flag: '🇭🇰', marketCap: 4.2, ytd: 16.3 },
    { nodeId: 'asx', parent: 'apac', label: 'ASX', exchange: 'ASX', country: 'Australia', flag: '🇦🇺', marketCap: 1.7, ytd: 7.3 }
];
