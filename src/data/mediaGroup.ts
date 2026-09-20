import type { SectionIconName } from '../components/SectionIcon';

export const mediaGroupDivisions: { title: string; description: string; icon: SectionIconName }[] = [
  { title: 'News & Editorial', description: 'Community reporting, public affairs, interviews, PTown Journal, corrections, and right-of-reply practices.', icon: 'newspaper-outline' },
  { title: 'Radio & Podcasts', description: 'PTown Radio, artist conversations, cultural programs, business leadership, tourism, food, bourbon, and wine features.', icon: 'mic-outline' },
  { title: 'Live & Recorded Production', description: 'Concert livestreams, performance capture, documentaries, photography, video, editing, highlights, and approved archives.', icon: 'videocam-outline' },
  { title: 'Digital Distribution', description: 'PTown Access and the PTown website serve as the home base; social channels promote approved stories and bring audiences back.', icon: 'phone-portrait-outline' },
  { title: 'Partnerships & Revenue', description: 'Sponsorship activation, advertising, commercial production, studio services, subscriptions, pay-per-view, and content licensing.', icon: 'briefcase-outline' },
  { title: 'Media Academy', description: 'Hands-on pathways in journalism, broadcasting, podcasting, cameras, editing, design, marketing, and production.', icon: 'school-outline' },
];

export const editorialStandards = [
  ['Accuracy before speed', 'Verify facts, identify sources responsibly, and correct meaningful errors clearly.'],
  ['Independent and fair', 'Protect editorial judgment while giving subjects a reasonable opportunity to respond.'],
  ['Clear labels', 'Separate reporting, commentary, entertainment, advertising, and sponsored content.'],
  ['Respect and safety', 'Protect privacy, permissions, minors, sensitive information, and the safety of staff and contributors.'],
  ['Rights and records', 'Document releases, ownership, licenses, credits, archive status, and approved reuse.'],
] as const;

export const mediaCareerPath = ['Explore', 'Choose', 'Train', 'Produce', 'Document', 'Place', 'Return'];

export const mediaLeadership = [
  'Director of PTown Media Group',
  'Program Director',
  'News & Editorial Director',
  'Producers and production coordinators',
  'Technical, livestream, camera, audio, and editing teams',
  'Digital distribution and audience team',
  'Rights, standards, archives, and permissions',
  'Sales, sponsorship, and partner activation',
  'Interns, apprentices, mentors, and placement partners',
];
