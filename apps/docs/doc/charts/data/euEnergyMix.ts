export interface EuEnergyYear {
    year: string;
    oil: number;
    gas: number;
    coal: number;
    nuclear: number;
    renewables: number;
}

export const euEnergyMix: EuEnergyYear[] = [
    { year: '2013', oil: 524, gas: 338, coal: 254, nuclear: 226, renewables: 176 },
    { year: '2014', oil: 518, gas: 305, coal: 240, nuclear: 226, renewables: 185 },
    { year: '2015', oil: 527, gas: 316, coal: 232, nuclear: 222, renewables: 192 },
    { year: '2016', oil: 534, gas: 332, coal: 219, nuclear: 218, renewables: 197 },
    { year: '2017', oil: 539, gas: 342, coal: 215, nuclear: 213, renewables: 204 },
    { year: '2018', oil: 537, gas: 336, coal: 199, nuclear: 212, renewables: 211 },
    { year: '2019', oil: 528, gas: 332, coal: 167, nuclear: 210, renewables: 220 },
    { year: '2020', oil: 465, gas: 318, coal: 140, nuclear: 196, renewables: 231 },
    { year: '2021', oil: 490, gas: 337, coal: 150, nuclear: 196, renewables: 234 },
    { year: '2022', oil: 485, gas: 300, coal: 144, nuclear: 180, renewables: 252 },
    { year: '2023', oil: 471, gas: 276, coal: 120, nuclear: 183, renewables: 268 }
];
