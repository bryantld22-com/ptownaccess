import type { SectionIconName } from '../components/SectionIcon';

// Fictional personas demonstrate the experience; these are not real accounts.
export const friendInterests = [
  { id: 'all', title: 'All profiles' }, { id: 'music', title: 'Music' },
  { id: 'creative', title: 'Creative' }, { id: 'dinner', title: 'Dinner' },
] as const;
export const sampleFriends: { id: string; name: string; interests: string; introduction: string; icon: SectionIconName; activity: string; programIds: string[]; pathwayIds: string[] }[] = [
  { id: 'music', name: 'Music explorer', interests: 'Jazz · R&B · Musician jam sessions', introduction: 'A fictional guest who enjoys discovering live music and planning an evening with good company.', icon: 'musical-notes-outline', activity: 'Compare musical styles, explore the proposed musician jam session, and talk about a program you would enjoy together. No performer or event date is confirmed.', programIds: ['tuesday-jazz', 'blues-country'], pathwayIds: ['performance-rehearsal'] },
  { id: 'creative', name: 'Creative connector', interests: 'Save the Arts · Media · Creative collaboration', introduction: 'A fictional guest interested in cultural discovery, community stories, and opportunities to build creative skills.', icon: 'color-palette-outline', activity: 'Discuss a cultural story or documentary idea, explore the Heritage Tour vision, and discover ways performance and media could work together. No collaboration, application, or enrollment is arranged.', programIds: ['ptown-flow'], pathwayIds: ['heritage-tour', 'behind-the-build'] },
  { id: 'dinner', name: 'Dinner companion', interests: 'Dinner & a show · Celebrations · Community', introduction: 'A fictional guest who enjoys bringing friends together around food, entertainment, and shared occasions.', icon: 'restaurant-outline', activity: 'Consider brunch or dinner alongside a proposed show, discuss your occasion, and explore PTown’s culinary vision. Tables, menus, food inclusions, and service times remain unconfirmed.', programIds: ['communion-sunday', 'comedy'], pathwayIds: ['culinary-development'] },
];
