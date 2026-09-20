import type { Href } from 'expo-router';
import { sections, sectionContent } from './sections';
import { mediaFeatures } from './media';
import { mediaGroupDivisions } from './mediaGroup';
import { mediaTemplates } from './mediaTemplates';

export type DirectoryPage = { title: string; description: string; keywords: string; href: Href };
export const directoryPages: DirectoryPage[] = [
  { title: 'PTown Media Group', description: 'Explore PTown’s independent newsroom, production, distribution, training, and career vision.', keywords: 'media group independent unfiltered artist driven journal radio podcast livestream documentary newsroom journalism production internship jobs placement distribution investor sponsor licensing', href: '/media-group' },
  ...mediaGroupDivisions.map(division => ({ title: division.title, description: division.description, keywords: [division.lead, ...division.programs, ...division.roles, ...division.passport].join(' '), href: { pathname: '/media-group/[id]', params: { id: division.id } } as const })),
  { title: 'Media Director Operations Guide', description: 'Explore PTown Media Group’s planned production, approval, rights, publishing, and archive workflow.', keywords: 'media director operations guide editorial calendar approvals rights releases corrections control room archive safety', href: '/media-group/operations-guide' },
  { title: 'Media Production Templates', description: 'Draft assignments, rundowns, call sheets, rights reviews, approvals, and archive handoffs.', keywords: 'media production templates forms assignment rundown call sheet rights release approval archive', href: '/media-templates' },
  { title: 'Media Production Dashboard', description: 'Review sample assignments by division, owner, status, deadline, rights, and archive readiness.', keywords: 'media dashboard production assignment status owner deadline rights archive pipeline', href: '/media-dashboard' },
  ...mediaTemplates.map(template => ({ title: template.title, description: template.purpose, keywords: [...template.fields.map(field => field.label), ...template.checks].join(' '), href: { pathname: '/media-templates/[id]', params: { id: template.id } } as const })),
  { title: 'Friend 2 Friend', description: 'Preview sample profiles and build a planning invitation for good company at PTown.', keywords: 'friends friend 2 friend social connection invitation join me community sample profile', href: '/friends' },
  ...sections.map(section => {
    const slug = section.href.slice(1);
    const content = slug in sectionContent ? sectionContent[slug as keyof typeof sectionContent] : undefined;
    const mediaKeywords = section.href === '/media' ? mediaFeatures.flatMap(feature => [feature.title, feature.category, feature.description, ...feature.topics]).join(' ') : '';
    return { title: section.title, description: section.subtitle, href: section.href, keywords: content ? [content.eyebrow, content.description, ...content.items.flatMap(item => [item.title, item.description]), mediaKeywords].join(' ') : section.title };
  }),
  { title: 'Plan Your Visit', description: 'Explore each weekday’s proposed program, dinner approach, and arrival FAQs.', keywords: 'visit dinner arrival parking accessibility weekday guide', href: '/visit' },
  { title: 'Compare Programs', description: 'Compare up to three proposed evenings and save favorites.', keywords: 'compare admission dinner opening after-party', href: '/compare' },
  { title: 'Review Your Plan', description: 'Review, copy, or share your saved planning summary.', keywords: 'summary share copy dinner draft guests occasion saved plans', href: '/plans' },
  { title: 'Backup & Restore', description: 'Copy a transfer code and review plans before restoring on another device.', keywords: 'backup back up restore transfer device recovery', href: '/backup' },
  { title: 'Your Saved Plans', description: 'Manage saved programs, dinner drafts, and membership and creative interests.', keywords: 'profile saved favorites dinner membership creative clear reset', href: '/profile' },
];
