import type { MembershipInterest } from '../state/PreviewStore';
import type { SectionIconName } from '../components/SectionIcon';

export const membershipChoices: { id: MembershipInterest; title: string; description: string; focus: string; experience: string; icon: SectionIconName }[] = [
  { id: 'community', title: 'PTown community', description: 'Explore creative connections, member activities, and PTown news.', focus: 'Culture, creativity, and community connections.', experience: 'Future member activities and creative connections. Programming and participation terms remain in development.', icon: 'people-outline' },
  { id: 'vip', title: 'VIP Society', description: 'Explore the vision for elevated hospitality and special experiences.', focus: 'A more personal hospitality experience.', experience: 'A planned lounge experience, attentive hospitality, and special member occasions, subject to final terms and availability.', icon: 'diamond-outline' },
];
