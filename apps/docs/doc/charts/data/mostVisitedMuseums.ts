export interface MuseumRow {
    museum: string;
    city: string;
    visitors: number;
    yoy: number;
}

export const mostVisitedMuseums: MuseumRow[] = [
    { museum: 'Louvre', city: 'Paris', visitors: 8.86, yoy: 14.1 },
    { museum: 'Vatican Museums', city: 'Vatican', visitors: 6.77, yoy: 42.6 },
    { museum: 'British Museum', city: 'London', visitors: 5.82, yoy: 42.1 },
    { museum: 'Metropolitan Museum', city: 'New York', visitors: 5.36, yoy: 11.0 },
    { museum: 'Tate Modern', city: 'London', visitors: 4.74, yoy: -1.7 },
    { museum: 'Reina Sofía', city: 'Madrid', visitors: 3.4, yoy: 17.4 },
    { museum: 'National Gallery of Art', city: 'Washington', visitors: 3.31, yoy: 23.4 },
    { museum: "Musée d'Orsay", city: 'Paris', visitors: 3.27, yoy: 8.2 },
    { museum: 'National Gallery', city: 'London', visitors: 3.1, yoy: 2.3 },
    { museum: 'Centre Pompidou', city: 'Paris', visitors: 2.96, yoy: 6.5 }
];
