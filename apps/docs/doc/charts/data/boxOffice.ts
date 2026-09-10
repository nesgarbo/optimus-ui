export interface Film {
    title: string;
    budget: number;
    gross: number;
    franchise: number;
}

export const disney: Film[] = [
    { title: 'Avengers: Endgame', budget: 356, gross: 2799, franchise: 31 },
    { title: 'Star Wars: Force Awak', budget: 245, gross: 2069, franchise: 11 },
    { title: 'Avengers: Infinity W.', budget: 316, gross: 2052, franchise: 31 },
    { title: 'The Lion King (2019)', budget: 260, gross: 1663, franchise: 2 },
    { title: 'Frozen II', budget: 150, gross: 1450, franchise: 2 },
    { title: 'Black Panther', budget: 200, gross: 1348, franchise: 31 },
    { title: 'Beauty and the Beast', budget: 160, gross: 1263, franchise: 2 }
];

export const universal: Film[] = [
    { title: 'Jurassic World', budget: 150, gross: 1672, franchise: 6 },
    { title: 'Furious 7', budget: 190, gross: 1515, franchise: 10 },
    { title: 'Super Mario Bros', budget: 100, gross: 1362, franchise: 1 },
    { title: 'Jur. World: Fallen K.', budget: 170, gross: 1309, franchise: 6 },
    { title: 'Minions', budget: 74, gross: 1159, franchise: 5 }
];

export const warner: Film[] = [
    { title: 'Barbie', budget: 145, gross: 1446, franchise: 1 },
    { title: 'Harry Potter DH2', budget: 250, gross: 1342, franchise: 8 },
    { title: 'Aquaman', budget: 160, gross: 1152, franchise: 2 },
    { title: 'Joker', budget: 55, gross: 1074, franchise: 2 }
];

export const paramount: Film[] = [
    { title: 'Titanic', budget: 200, gross: 2257, franchise: 1 },
    { title: 'Top Gun: Maverick', budget: 170, gross: 1496, franchise: 2 },
    { title: 'Transformers: DotM', budget: 195, gross: 1124, franchise: 7 }
];

export const sony: Film[] = [
    { title: 'Spider-Man: NWH', budget: 200, gross: 1922, franchise: 8 },
    { title: 'Skyfall', budget: 200, gross: 1109, franchise: 26 }
];
