import type { SectionSlug } from '../types';

export const sections: { title: string; subtitle: string; href: '/events' | '/tickets' | `/${SectionSlug}`; icon: string }[] = [
  { title: 'Events', subtitle: 'Find your next night out', href: '/events', icon: '01' },
  { title: 'Tickets', subtitle: 'Your pass to the experience', href: '/tickets', icon: '02' },
  { title: 'VIP', subtitle: 'An elevated evening', href: '/vip', icon: '03' },
  { title: 'Media', subtitle: 'The sound and story of PTown', href: '/media', icon: '04' },
  { title: 'Reservations', subtitle: 'Make room for good company', href: '/reservations', icon: '05' },
  { title: 'Memberships', subtitle: 'Find your place in PTown', href: '/memberships', icon: '06' },
  { title: 'Save the Arts', subtitle: 'Our flagship. Our future.', href: '/save-the-arts', icon: '07' },
  { title: 'Artist Development', subtitle: 'Where talent meets opportunity', href: '/artist-development', icon: '08' },
];

export const sectionContent: Record<SectionSlug, { title: string; eyebrow: string; description: string; items: { title: string; description: string }[] }> = {
  vip: { title: 'An evening above the ordinary.', eyebrow: 'PTOWN VIP SOCIETY', description: 'Discover the vision for a more personal PTown experience. Benefits and availability will be confirmed before enrollment opens.', items: [
    { title: 'VIP hospitality', description: 'A welcoming lounge experience and attentive service are part of the planned VIP program.' },
    { title: 'Special access', description: 'Explore future member events and artist experiences, subject to each event’s availability.' },
  ] },
  media: { title: 'Every stage has a story.', eyebrow: 'PTOWN MEDIA GROUP', description: 'Follow the music, the people, and the making of PTown. Media programming is in development.', items: [
    { title: 'Behind the build', description: 'Future stories documenting our venue, our departments, and our community.' },
    { title: 'Podcasts & conversations', description: 'Artist conversations and regional creative voices. Episodes will appear here when available.' },
    { title: 'Live performance', description: 'Future performance highlights. No live streams or playable media are available in this preview.' },
  ] },
  reservations: { title: 'Good company starts here.', eyebrow: 'RESERVATIONS', description: 'The reservation experience is being prepared. This preview does not accept or confirm bookings.', items: [
    { title: 'Dinner & a show', description: 'Future reservations will connect your table with your evening’s entertainment.' },
    { title: 'Private gatherings', description: 'Explore the vision for celebrations, community occasions, and private events.' },
    { title: 'Booking information', description: 'Service times, party limits, and reservation policies will be announced before bookings open.' },
  ] },
  memberships: { title: 'Be part of something bigger.', eyebrow: 'MEMBERSHIPS', description: 'PTown brings culture, creativity, and community together. Membership plans, prices, and benefits are still being developed.', items: [
    { title: 'PTown community', description: 'A future home for member activities, creative connections, and venue news.' },
    { title: 'VIP Society', description: 'An elevated hospitality program. Final terms and enrollment are coming later.' },
  ] },
  'save-the-arts': { title: 'Save the arts. Save the future.', eyebrow: 'OUR FLAGSHIP', description: 'Creative opportunity, cultural discovery, and a stronger community are at the heart of PTown’s Save the Arts mission.', items: [
    { title: 'Saturday arts sessions', description: 'Two planned Saturday sessions using PTown’s lounge and stage for creative exploration.' },
    { title: 'The Heritage Tour', description: 'Cultural discovery, live performance, mentorship, and industry exposure. Tour dates and participation details will be announced.' },
    { title: 'From discovery to opportunity', description: 'Explore pathways across performance, media, production, and other creative careers.' },
  ] },
  'artist-development': { title: 'Your talent. Your next chapter.', eyebrow: 'ARTIST DEVELOPMENT', description: 'Build your craft through practice, collaboration, and hands-on experience. Program enrollment is not available in this preview.', items: [
    { title: 'Performance & rehearsal', description: 'Planned opportunities to develop stage presence and collaborate with other artists.' },
    { title: 'Recording & production', description: 'Explore recording, audio, lighting, camera operation, and the work behind a live show.' },
    { title: 'Portfolio & career pathways', description: 'Build evidence of your skills and discover connections to internships, apprenticeships, and employment opportunities.' },
  ] },
};
