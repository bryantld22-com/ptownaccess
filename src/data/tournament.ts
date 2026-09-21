export const tournamentGames = [
  { id: 'spades', title: 'Spades', category: 'Cards' },
  { id: 'bid-whist', title: 'Bid Whist', category: 'Cards' },
  { id: 'hearts', title: 'Hearts', category: 'Cards' },
  { id: 'dominoes', title: 'Dominoes', category: 'Table game' },
  { id: 'chess', title: 'Chess', category: 'Board game' },
] as const;

export type TournamentGameId = typeof tournamentGames[number]['id'];

