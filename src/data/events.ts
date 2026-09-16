import type { ProgramEvent } from '../types';
export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

// Proposed recurring program, not a confirmed event calendar.
export const events: ProgramEvent[] = [
  { id: 'monday-jazz', title: 'House Jazz', day: 'Monday', category: 'Jazz', admission: 'Free', description: 'Ease into the week with the sound of PTown’s house jazz and an open menu.' },
  { id: 'tuesday-jazz', title: 'House Jazz', day: 'Tuesday', category: 'Jazz', admission: 'Free', description: 'Good food, warm conversation, and house jazz. Explore the open menu.' },
  { id: 'ptown-flow', title: 'PTown Flow Practice', day: 'Wednesday', category: 'Community', admission: 'Free', description: 'A place to practice, connect, and grow your creative voice. Open menu planned.' },
  { id: 'comedy', title: 'Comedy Night', day: 'Thursday', category: 'Comedy', admission: 'Ticketed', description: 'Dinner, live music, and a night of laughter. Ticket nights feature one culture signature plate and one alternate plate.', opening: 'PTown house band opens the evening.' },
  { id: 'rnb-blues', title: 'R&B & Blues', day: 'Friday', category: 'R&B / Blues', admission: 'Ticketed', description: 'Soulful voices and deep grooves. Ticket nights feature one culture signature plate and one alternate plate.', opening: 'A dance organization opens the evening.', afterParty: 'An after-party is planned; details will be announced.' },
  { id: 'blues-country', title: 'Blues & Country', day: 'Saturday', category: 'Blues / Country', admission: 'Ticketed', description: 'A Saturday celebration of roots, rhythm, and live performance. One culture signature plate and one alternate plate are planned.', afterParty: 'R&B and Pop after-party planned; details will be announced.' },
  { id: 'communion-sunday', title: 'Communion Sunday', day: 'Sunday', category: 'Gospel / Jazz', admission: 'Free', description: 'Gospel jazz brunch and community fellowship, followed by R&B jazz until 6 pm.' },
];
export const featuredEvent = events[3];
