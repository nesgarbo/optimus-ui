export type Continent = 'Asia' | 'Africa' | 'North America' | 'South America';

export interface MetroRow {
    metro: string;
    country: string;
    population: number;
    continent: Continent;
    growth: number;
}

export const metroPopulation: MetroRow[] = [
    { metro: 'Tokyo', country: 'Japan', population: 37.12, continent: 'Asia', growth: -0.3 },
    { metro: 'Delhi', country: 'India', population: 33.81, continent: 'Asia', growth: 2.6 },
    { metro: 'Shanghai', country: 'China', population: 29.98, continent: 'Asia', growth: 1.8 },
    { metro: 'Dhaka', country: 'Bangladesh', population: 23.94, continent: 'Asia', growth: 3.3 },
    { metro: 'São Paulo', country: 'Brazil', population: 22.81, continent: 'South America', growth: 0.5 },
    { metro: 'Cairo', country: 'Egypt', population: 22.62, continent: 'Africa', growth: 1.9 },
    { metro: 'Mexico City', country: 'Mexico', population: 22.51, continent: 'North America', growth: 0.5 },
    { metro: 'Beijing', country: 'China', population: 22.19, continent: 'Asia', growth: 1.4 },
    { metro: 'Mumbai', country: 'India', population: 21.67, continent: 'Asia', growth: 1.6 },
    { metro: 'Osaka', country: 'Japan', population: 18.92, continent: 'Asia', growth: -0.3 },
    { metro: 'New York', country: 'USA', population: 18.82, continent: 'North America', growth: 0.1 },
    { metro: 'Karachi', country: 'Pakistan', population: 17.96, continent: 'Asia', growth: 2.2 },
    { metro: 'Chongqing', country: 'China', population: 17.34, continent: 'Asia', growth: 1.3 },
    { metro: 'Istanbul', country: 'Türkiye', population: 16.2, continent: 'Asia', growth: 1.2 },
    { metro: 'Buenos Aires', country: 'Argentina', population: 15.94, continent: 'South America', growth: 0.4 }
];
