export const tournamentGames = [
  { id: 'spades', title: 'Spades', category: 'Cards', programRole: 'Core championship division' },
  { id: 'bid-whist', title: 'Bid Whist', category: 'Cards', programRole: 'Core championship division' },
  { id: 'hearts', title: 'Hearts', category: 'Cards', programRole: 'Community exhibition unless later approved as a division' },
  { id: 'dominoes', title: 'Dominoes', category: 'Table game', programRole: 'Core championship division' },
  { id: 'chess', title: 'Chess', category: 'Board game', programRole: 'Contender pathway while official hub requirements are reviewed' },
] as const;

export type TournamentGameId = typeof tournamentGames[number]['id'];
