export interface TeamScore {
    axis: string;
    alpha: number;
    beta: number;
}

export const engineeringTeams: TeamScore[] = [
    { axis: 'Technical Depth', alpha: 82, beta: 58 },
    { axis: 'Process Maturity', alpha: 61, beta: 84 },
    { axis: 'Innovation', alpha: 76, beta: 47 },
    { axis: 'Customer Focus', alpha: 55, beta: 91 },
    { axis: 'Delivery Speed', alpha: 79, beta: 68 },
    { axis: 'Team Cohesion', alpha: 88, beta: 73 }
];
