export interface DaylightMonth {
    month: string;
    sunrise: number;
    sunset: number;
}

export const daylight: DaylightMonth[] = [
    { month: 'Jan', sunrise: 8.08, sunset: 16.08 },
    { month: 'Feb', sunrise: 7.42, sunset: 17.08 },
    { month: 'Mar', sunrise: 6.33, sunset: 18.0 },
    { month: 'Apr', sunrise: 6.17, sunset: 20.08 },
    { month: 'May', sunrise: 5.17, sunset: 20.92 },
    { month: 'Jun', sunrise: 4.75, sunset: 21.33 },
    { month: 'Jul', sunrise: 4.92, sunset: 21.17 },
    { month: 'Aug', sunrise: 5.75, sunset: 20.42 },
    { month: 'Sep', sunrise: 6.67, sunset: 19.17 },
    { month: 'Oct', sunrise: 7.42, sunset: 17.97 },
    { month: 'Nov', sunrise: 7.42, sunset: 16.17 },
    { month: 'Dec', sunrise: 8.08, sunset: 15.92 }
];
