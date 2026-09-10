export interface ElectricityGenerationYear {
    year: string;
    natural_gas: number;
    coal: number;
    nuclear: number;
    renewables: number;
}

export const usElectricityGeneration: ElectricityGenerationYear[] = [
    { year: '2010', natural_gas: 987, coal: 1847, nuclear: 807, renewables: 437 },
    { year: '2011', natural_gas: 1013, coal: 1733, nuclear: 790, renewables: 473 },
    { year: '2012', natural_gas: 1225, coal: 1514, nuclear: 769, renewables: 496 },
    { year: '2013', natural_gas: 1124, coal: 1581, nuclear: 789, renewables: 521 },
    { year: '2014', natural_gas: 1126, coal: 1581, nuclear: 797, renewables: 543 },
    { year: '2015', natural_gas: 1331, coal: 1356, nuclear: 797, renewables: 583 },
    { year: '2016', natural_gas: 1378, coal: 1240, nuclear: 805, renewables: 614 },
    { year: '2017', natural_gas: 1296, coal: 1206, nuclear: 805, renewables: 674 },
    { year: '2018', natural_gas: 1468, coal: 1146, nuclear: 807, renewables: 713 },
    { year: '2019', natural_gas: 1582, coal: 966, nuclear: 809, renewables: 770 },
    { year: '2020', natural_gas: 1624, coal: 773, nuclear: 790, renewables: 834 },
    { year: '2021', natural_gas: 1689, coal: 899, nuclear: 778, renewables: 895 },
    { year: '2022', natural_gas: 1690, coal: 832, nuclear: 772, renewables: 959 },
    { year: '2023', natural_gas: 1802, coal: 676, nuclear: 775, renewables: 1049 }
];
