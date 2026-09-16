export type ProgramEvent = {
  id: string; title: string; day: string; category: string;
  admission: 'Free' | 'Ticketed'; description: string; opening?: string; afterParty?: string;
};
export type SectionSlug = 'vip' | 'media' | 'reservations' | 'memberships' | 'save-the-arts' | 'artist-development';
