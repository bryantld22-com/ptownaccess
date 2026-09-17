import type { Href } from 'expo-router';
import type { SectionIconName } from '../components/SectionIcon';

export const mediaCategories = ['Stories', 'Podcasts', 'Performances'] as const;
export type MediaCategory = typeof mediaCategories[number];
export type MediaFeature = {
  id: string; title: string; category: MediaCategory; icon: SectionIconName;
  description: string; topics: string[]; project: string;
  related: { label: string; href: Href };
};

// Editorial concepts for the preview, not released episodes or confirmed artists.
export const mediaFeatures: MediaFeature[] = [
  {
    id: 'building-ptown', title: 'Building PTown', category: 'Stories', icon: 'videocam-outline',
    description: 'Follow the making of PTown through the venue, the departments, and the people bringing the vision to life.',
    topics: ['Behind-the-build documentary stories', 'Department projects from Day One', 'Learning through hands-on work'],
    project: 'A planned documentary series following PTown’s development, from preparation and team projects to rehearsals and opening. Filming plans and release dates will be announced.',
    related: { label: 'Explore Behind the Build', href: '/programs/behind-the-build' },
  },
  {
    id: 'people-of-ptown', title: 'People of PTown', category: 'Stories', icon: 'people-outline',
    description: 'Meet the creative work behind dinner and a show, from the kitchen and stage to cameras, lighting, and sound.',
    topics: ['Creative collaboration across departments', 'Skills, portfolios, and career pathways', 'The people behind the guest experience'],
    project: 'A proposed collection of team and creative profiles showing how departments work together. Participants and stories are not yet confirmed.',
    related: { label: 'Discover Artist Development', href: '/artist-development' },
  },
  {
    id: 'artist-conversations', title: 'Artist Conversations', category: 'Podcasts', icon: 'mic-outline',
    description: 'Explore the craft, influences, and creative journeys behind the artists and their work.',
    topics: ['The creative process', 'Preparing for the stage', 'Lessons for developing artists'],
    project: 'A planned podcast format for thoughtful artist interviews and practical creative insights. Guests and episodes will be announced when confirmed.',
    related: { label: 'Explore Podcasts & Conversations', href: '/programs/podcasts-conversations' },
  },
  {
    id: 'regional-voices', title: 'Regional Voices', category: 'Podcasts', icon: 'chatbubbles-outline',
    description: 'A place for conversations about culture, community, and creative opportunity in Paducah and the surrounding region.',
    topics: ['Regional creative connections', 'Theater, schools, and community storytelling', 'Culture and opportunity'],
    project: 'A proposed conversation series connecting with regional podcast creators and creative communities. Partnerships, guests, and participation details remain in development.',
    related: { label: 'Meet Save the Arts', href: '/save-the-arts' },
  },
  {
    id: 'live-music-spotlight', title: 'Live Music Spotlight', category: 'Performances', icon: 'musical-notes-outline',
    description: 'Discover the vision for capturing the energy of PTown’s stage and its range of live music.',
    topics: ['Music across genres', 'Performance capture and live sound', 'Camera, lighting, and stage teamwork'],
    project: 'Planned performance highlights developed with the production and media teams. Artists, recording permissions, release dates, and viewing arrangements will be confirmed before publication.',
    related: { label: 'Explore the weekly program', href: '/events' },
  },
  {
    id: 'sound-to-screen', title: 'Sound to Screen', category: 'Performances', icon: 'film-outline',
    description: 'Bring PTown music and storytelling together through planned videos and original productions.',
    topics: ['Video concepts for PTown songs', 'Acting and visual storytelling', 'Audio, filming, and editing collaboration'],
    project: 'A proposed Day One project connecting production’s audio work with media’s video concepts, while building relationships with local theater and drama programs. No finished video is available in this preview.',
    related: { label: 'Explore Live Production & Recording', href: '/programs/live-production' },
  },
];
