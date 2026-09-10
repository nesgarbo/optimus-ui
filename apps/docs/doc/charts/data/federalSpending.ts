export interface FederalSpendingYear {
    year: string;
    defense: number;
    health: number;
    social: number;
    interest: number;
    other: number;
}

export const federalSpending: FederalSpendingYear[] = [
    { year: '2000', defense: 294, health: 154, social: 409, interest: 223, other: 610 },
    { year: '2001', defense: 305, health: 172, social: 433, interest: 206, other: 673 },
    { year: '2002', defense: 349, health: 197, social: 456, interest: 171, other: 687 },
    { year: '2003', defense: 405, health: 219, social: 474, interest: 153, other: 699 },
    { year: '2004', defense: 456, health: 237, social: 496, interest: 160, other: 742 },
    { year: '2005', defense: 495, health: 250, social: 523, interest: 184, other: 774 },
    { year: '2006', defense: 522, health: 261, social: 548, interest: 227, other: 797 },
    { year: '2007', defense: 553, health: 276, social: 586, interest: 237, other: 821 },
    { year: '2008', defense: 616, health: 298, social: 612, interest: 253, other: 863 },
    { year: '2009', defense: 661, health: 334, social: 678, interest: 187, other: 1643 },
    { year: '2010', defense: 694, health: 369, social: 706, interest: 196, other: 1592 },
    { year: '2011', defense: 706, health: 380, social: 725, interest: 230, other: 1428 },
    { year: '2012', defense: 678, health: 392, social: 773, interest: 220, other: 1400 },
    { year: '2013', defense: 633, health: 403, social: 813, interest: 221, other: 1310 },
    { year: '2014', defense: 604, health: 423, social: 845, interest: 229, other: 1387 },
    { year: '2015', defense: 590, health: 452, social: 888, interest: 223, other: 1443 },
    { year: '2016', defense: 585, health: 476, social: 916, interest: 240, other: 1474 },
    { year: '2017', defense: 590, health: 502, social: 945, interest: 263, other: 1498 },
    { year: '2018', defense: 623, health: 524, social: 982, interest: 325, other: 1547 },
    { year: '2019', defense: 686, health: 551, social: 1038, interest: 375, other: 1699 },
    { year: '2020', defense: 714, health: 582, social: 1096, interest: 345, other: 3829 },
    { year: '2021', defense: 742, health: 614, social: 1135, interest: 352, other: 3805 },
    { year: '2022', defense: 751, health: 635, social: 1219, interest: 475, other: 2480 },
    { year: '2023', defense: 806, health: 660, social: 1354, interest: 659, other: 2815 }
];
