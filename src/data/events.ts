import type { ProgramEvent } from '../types';
export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

// Proposed recurring program, not a confirmed event calendar.
// Keep IDs stable so earlier links and saved plans survive program-name changes.
export const events: ProgramEvent[] = [
  {
    id: 'monday-jazz',
    title: 'Auditions for PTown',
    day: 'Monday',
    category: 'Auditions',
    admission: 'Free',
    description: 'Monday night auditions for PTown performers and creative talent, plus a quarterly community tournament featuring cards, dominoes, and chess. Dates and participation details will be announced.',
    tournamentFeature: {
      title: 'Quarterly Cards, Dominoes & Chess Tournament',
      description: 'The quarterly plan centers Spades, Bid Whist, Dominoes, and a chess contender pathway. Hearts remains available as a community exhibition. The calendar, registration policy, qualification rules, sponsors, and travel award will be announced only after approval.',
    },
  },
  { id: 'tuesday-jazz', title: 'Musician Jam Session', day: 'Tuesday', category: 'Jam Session', admission: 'Free', description: 'Musicians come together for a jam session, good food, and creative connection. Explore the open menu.' },
  {
    id: 'ptown-flow', title: 'PTown Flow Practice', day: 'Wednesday', category: 'Community', admission: 'Free',
    description: 'PTown Flow practice and Artist Discovery share Wednesday. Selected Monday audition acts may be invited to perform nine days later; audience response and stage readiness inform a later Artist Development review. Open menu planned.',
    showcaseFeature: {
      title: 'Artist Discovery showcase',
      description: 'An invitation-only opportunity for selected artists or comedians from the prior Monday audition. The music director coordinates preparation with musicians and dancers. A Wednesday performance does not guarantee enrollment or a weekend booking.',
    },
  },
  { id: 'comedy', title: 'Comedy Night', day: 'Thursday', category: 'Comedy', admission: 'Ticketed', description: 'Dinner, live music, and a night of laughter. Ticket nights feature one culture signature plate and one alternate plate.', opening: 'PTown house band opens the evening.' },
  { id: 'rnb-blues', title: 'R&B & Blues', day: 'Friday', category: 'R&B / Blues', admission: 'Ticketed', description: 'Soulful voices and deep grooves. Ticket nights feature one culture signature plate and one alternate plate.', opening: 'A dance organization opens the evening.', afterParty: 'An after-party is planned; details will be announced.' },
  { id: 'blues-country', title: 'Any Genre', day: 'Saturday', category: 'Any Genre', admission: 'Ticketed', description: 'A Saturday evening of live music across any genre. One culture signature plate and one alternate plate are planned.', afterParty: 'R&B and Pop after-party planned; details will be announced.' },
  { id: 'communion-sunday', title: 'Communion Sunday', day: 'Sunday', category: 'Gospel / Jazz', admission: 'Free', description: 'Gospel jazz brunch and community fellowship, followed by R&B jazz until 6 pm.' },
];
export const featuredEvent = events[3];
