export interface Player {
    name: string;
    team: string;
    abbr: string;
    pts: number;
    ast: number;
}

export const pointGuards: Player[] = [
    { name: 'Luka Dončić', team: 'Dallas Mavericks', abbr: 'DAL', pts: 33.9, ast: 9.8 },
    { name: 'Shai Gilgeous-Alex.', team: 'Oklahoma City Thunder', abbr: 'OKC', pts: 30.1, ast: 6.2 },
    { name: 'Jalen Brunson', team: 'New York Knicks', abbr: 'NYK', pts: 28.7, ast: 6.7 },
    { name: 'Stephen Curry', team: 'Golden State Warriors', abbr: 'GSW', pts: 26.4, ast: 5.1 },
    { name: 'Trae Young', team: 'Atlanta Hawks', abbr: 'ATL', pts: 25.7, ast: 10.8 },
    { name: 'Kyrie Irving', team: 'Dallas Mavericks', abbr: 'DAL', pts: 25.6, ast: 5.2 },
    { name: 'Damian Lillard', team: 'Milwaukee Bucks', abbr: 'MIL', pts: 24.3, ast: 7.0 },
    { name: 'Tyrese Haliburton', team: 'Indiana Pacers', abbr: 'IND', pts: 20.1, ast: 10.9 },
    { name: 'James Harden', team: 'LA Clippers', abbr: 'LAC', pts: 16.6, ast: 8.5 }
];

export const shootingGuards: Player[] = [
    { name: 'Devin Booker', team: 'Phoenix Suns', abbr: 'PHX', pts: 27.1, ast: 6.9 },
    { name: 'Donovan Mitchell', team: 'Cleveland Cavaliers', abbr: 'CLE', pts: 26.6, ast: 6.1 },
    { name: 'Anthony Edwards', team: 'Minnesota Timberwolves', abbr: 'MIN', pts: 25.9, ast: 5.1 },
    { name: 'DeMar DeRozan', team: 'Chicago Bulls', abbr: 'CHI', pts: 24.0, ast: 5.3 }
];

export const smallForwards: Player[] = [
    { name: 'Kevin Durant', team: 'Phoenix Suns', abbr: 'PHX', pts: 27.1, ast: 5.0 },
    { name: 'Jayson Tatum', team: 'Boston Celtics', abbr: 'BOS', pts: 26.9, ast: 4.9 },
    { name: 'LeBron James', team: 'Los Angeles Lakers', abbr: 'LAL', pts: 25.7, ast: 8.3 },
    { name: 'Kawhi Leonard', team: 'LA Clippers', abbr: 'LAC', pts: 23.7, ast: 3.6 },
    { name: 'Jaylen Brown', team: 'Boston Celtics', abbr: 'BOS', pts: 23.0, ast: 3.6 },
    { name: 'Paul George', team: 'LA Clippers', abbr: 'LAC', pts: 22.6, ast: 3.5 }
];

export const powerForwards: Player[] = [
    { name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks', abbr: 'MIL', pts: 30.4, ast: 6.5 },
    { name: 'Anthony Davis', team: 'Los Angeles Lakers', abbr: 'LAL', pts: 24.7, ast: 3.5 },
    { name: 'Zion Williamson', team: 'New Orleans Pelicans', abbr: 'NOP', pts: 22.9, ast: 5.0 }
];

export const centers: Player[] = [
    { name: 'Joel Embiid', team: 'Philadelphia 76ers', abbr: 'PHI', pts: 34.7, ast: 5.6 },
    { name: 'Nikola Jokić', team: 'Denver Nuggets', abbr: 'DEN', pts: 26.4, ast: 9.0 },
    { name: 'Karl-Anthony Towns', team: 'Minnesota Timberwolves', abbr: 'MIN', pts: 21.8, ast: 3.0 },
    { name: 'Domantas Sabonis', team: 'Sacramento Kings', abbr: 'SAC', pts: 19.4, ast: 8.2 },
    { name: 'Bam Adebayo', team: 'Miami Heat', abbr: 'MIA', pts: 19.3, ast: 3.9 }
];

export const allPlayers = [...pointGuards, ...shootingGuards, ...smallForwards, ...powerForwards, ...centers];
export const ptsRanked = [...allPlayers].sort((a, b) => b.pts - a.pts);
export const astRanked = [...allPlayers].sort((a, b) => b.ast - a.ast);
