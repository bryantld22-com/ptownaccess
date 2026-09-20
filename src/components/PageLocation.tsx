import { Link, usePathname, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { events } from '../data/events';
import { pathways, type CreativeDivision } from '../data/pathways';
import { sections } from '../data/sections';
import { mediaFeatures } from '../data/media';
import { sampleFriends } from '../data/friends';
import { mediaGroupDivisions } from '../data/mediaGroup';
import { mediaTemplates } from '../data/mediaTemplates';
import { theme } from '../theme';

type Parent = { label: string; href: Href };
type Location = { label: string; parents: Parent[] };
const home: Parent = { label: 'Home', href: '/' };
const ptown: Parent = { label: 'PTown', href: '/ptown' };
const saved: Parent = { label: 'Saved plans', href: '/profile' };
const pages: Record<string, Location> = {
  '/ptown': { label: 'PTown', parents: [home] },
  '/profile': { label: 'Saved plans', parents: [home] },
  '/search': { label: 'Search PTown', parents: [ptown] },
  '/visit': { label: 'Visit guide', parents: [ptown] },
  '/plans': { label: 'Plan review', parents: [saved] },
  '/backup': { label: 'Plan backup', parents: [saved] },
  '/compare': { label: 'Program comparison', parents: [{ label: 'Events', href: '/events' }] },
  '/creative': { label: 'Creative library', parents: [ptown] },
  '/friends': { label: 'Friend 2 Friend', parents: [ptown] },
  '/media-group': { label: 'PTown Media Group', parents: [ptown] },
};
const divisions: Record<CreativeDivision, Parent> = {
  'Save the Arts': { label: 'Save the Arts', href: '/save-the-arts' },
  'Artist Development': { label: 'Artist Development', href: '/artist-development' },
  Media: { label: 'Media', href: '/media' },
};

function locate(pathname: string): Location | undefined {
  if (pathname === '/') return undefined;
  const friend = sampleFriends.find(item => pathname === `/friends/${item.id}`);
  if (friend) return { label: `${friend.name} · Sample profile`, parents: [{ label: 'Friend 2 Friend', href: '/friends' }] };
  if (pathname === '/media-group/operations-guide') return { label: 'Media Director Guide', parents: [{ label: 'PTown Media Group', href: '/media-group' }] };
  if (pathname === '/media-templates') return { label: 'Production templates', parents: [{ label: 'PTown Media Group', href: '/media-group' }] };
  if (pathname === '/media-dashboard') return { label: 'Production dashboard', parents: [{ label: 'PTown Media Group', href: '/media-group' }] };
  if (pathname === '/media-drafts') return { label: 'Private production drafts', parents: [{ label: 'PTown Media Group', href: '/media-group' }] };
  const mediaTemplate = mediaTemplates.find(item => pathname === `/media-templates/${item.id}`);
  if (mediaTemplate) return { label: mediaTemplate.title, parents: [{ label: 'Production templates', href: '/media-templates' }, { label: 'PTown Media Group', href: '/media-group' }] };
  const mediaDivision = mediaGroupDivisions.find(item => pathname === `/media-group/${item.id}`);
  if (mediaDivision) return { label: mediaDivision.title, parents: [{ label: 'PTown Media Group', href: '/media-group' }] };
  const media = mediaFeatures.find(item => pathname === `/media/${item.id}`);
  if (media) return { label: media.title, parents: [{ label: 'Media', href: '/media' }, { label: media.category, href: { pathname: '/media', params: { category: media.category } } }] };
  const event = events.find(item => pathname === `/events/${item.id}`);
  if (event) return {
    label: `${event.title} · ${event.day}`,
    parents: [{ label: `${event.day} programs`, href: { pathname: '/events', params: { day: event.day } } }],
  };
  const pathway = pathways.find(item => pathname === `/programs/${item.id}`);
  if (pathway) return { label: pathway.title, parents: [{ label: 'Creative library', href: '/creative' }, divisions[pathway.division]] };
  const section = sections.find(item => pathname === item.href);
  if (section) return { label: section.title, parents: [ptown] };
  return Object.prototype.hasOwnProperty.call(pages, pathname) ? pages[pathname] : { label: 'Link unavailable', parents: [ptown] };
}

export function PageLocation() {
  const location = locate(usePathname());
  if (!location) return null;
  return <View role="navigation" aria-label="Your location in PTown" style={styles.row}>
    {location.parents.map(parent => <View key={parent.label} style={styles.parent}>
      <Link href={parent.href} asChild><Pressable accessibilityRole="link" style={styles.link}><Text style={styles.linkLabel}>{parent.label}</Text></Pressable></Link>
      <Text aria-hidden style={styles.separator}>›</Text>
    </View>)}
    <Text aria-current="page" style={styles.current}>Current: {location.label}</Text>
  </View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 4 },
  parent: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '100%' },
  link: { minHeight: 44, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', flexShrink: 1 },
  linkLabel: { color: theme.colors.gold, fontSize: 12, lineHeight: 18 },
  separator: { color: theme.colors.muted, fontSize: 18 },
  current: { color: theme.colors.muted, fontSize: 12, lineHeight: 20, flexShrink: 1 },
});
