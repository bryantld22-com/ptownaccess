import type { SectionIconName } from '../components/SectionIcon';

// Fictional personas demonstrate the experience; these are not real accounts.
export const sampleFriends: { id: string; name: string; interests: string; introduction: string; icon: SectionIconName }[] = [
  { id: 'music', name: 'Music explorer', interests: 'Jazz · R&B · Musician jam sessions', introduction: 'A fictional guest who enjoys discovering live music and planning an evening with good company.', icon: 'musical-notes-outline' },
  { id: 'creative', name: 'Creative connector', interests: 'Save the Arts · Media · Creative collaboration', introduction: 'A fictional guest interested in cultural discovery, community stories, and opportunities to build creative skills.', icon: 'color-palette-outline' },
  { id: 'dinner', name: 'Dinner companion', interests: 'Dinner & a show · Celebrations · Community', introduction: 'A fictional guest who enjoys bringing friends together around food, entertainment, and shared occasions.', icon: 'restaurant-outline' },
];
