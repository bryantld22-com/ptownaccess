import type { SectionIconName } from '../components/SectionIcon';

export type DevelopmentTrack = {
  id: 'performance' | 'production' | 'culinary'; label: string; title: string;
  icon: SectionIconName; pathwayId: string; project: string;
  collaborators: string; portfolio: string[];
};

// Proposed development projects; instructors, dates, and enrollment are not confirmed.
export const developmentTracks: DevelopmentTrack[] = [
  {
    id: 'performance', label: 'Performance', title: 'Stage & Performance', icon: 'mic-outline', pathwayId: 'performance-rehearsal',
    project: 'Prepare a short rehearsal concept: choose a piece, plan the performance, and work with sound, lighting, and camera teams to capture your progress.',
    collaborators: 'Performers, band and voice teams, live production, and Media.',
    portfolio: ['A rehearsal plan', 'A performance reflection', 'A sample capture concept'],
  },
  {
    id: 'production', label: 'Production', title: 'Recording & Production', icon: 'videocam-outline', pathwayId: 'live-production',
    project: 'Plan how to reconstruct or refine existing PTown audio, then connect the sound with a rehearsal recording or video concept. Identify your role in audio, lighting, cameras, or editing.',
    collaborators: 'Audio and stage production, performers, and Media’s video team.',
    portfolio: ['A technical preparation plan', 'An audio or camera workflow', 'A record of your contribution'],
  },
  {
    id: 'culinary', label: 'Culinary', title: 'Culinary Craft', icon: 'restaurant-outline', pathwayId: 'culinary-development',
    project: 'Develop a dish or bakery concept for dinner and a show. Consider ingredients, preparation, presentation, and how the kitchen team coordinates service.',
    collaborators: 'Baking and kitchen teams, hospitality, and Media’s food storytelling.',
    portfolio: ['A dish or bakery concept', 'A preparation outline', 'Presentation notes'],
  },
];
