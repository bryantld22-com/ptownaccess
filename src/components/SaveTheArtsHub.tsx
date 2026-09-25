import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { pathways } from '../data/pathways';
import { theme } from '../theme';
import { PathwayCard } from './PathwayCard';
import { SectionIcon, type SectionIconName } from './SectionIcon';
import { Body, Button, Card, Eyebrow, SectionHeader, styles } from './ui';

const programs = pathways.filter(pathway => pathway.division === 'Save the Arts');
const filters = [
  { id: 'all', label: 'All programs' },
  { id: 'heritage-tour', label: 'Heritage Tour' },
  { id: 'saturday-arts', label: 'Saturday sessions' },
];
const pillars: { title: string; description: string; icon: SectionIconName }[] = [
  { title: 'Discover culture', description: 'Connect creative roots, cultural stories, and live performance through planned discovery experiences.', icon: 'map-outline' },
  { title: 'Create together', description: 'Bring performers, media, and technical teams together so creative projects become hands-on learning opportunities.', icon: 'color-palette-outline' },
  { title: 'Build opportunity', description: 'Explore mentorship, portfolio development, and future connections to creative careers.', icon: 'sparkles-outline' },
];

export function SaveTheArtsHub() {
  const router = useRouter();
  const params = useLocalSearchParams<{ program?: string | string[] }>();
  const routeProgram = programs.find(program => program.id === params.program)?.id ?? 'all';
  const [selected, setSelected] = useState('all');
  // Apply shared program selection after the static page has hydrated.
  useEffect(() => { setSelected(routeProgram); }, [routeProgram]);
  function choose(id: string) { setSelected(id); router.setParams({ program: id === 'all' ? undefined : id }); }
  const visible = programs.filter(program => selected === 'all' || program.id === selected);
  return <>
    <View style={styles.card}><Eyebrow>PTOWN’S FLAGSHIP MISSION</Eyebrow><Text style={styles.cardTitle}>Creative roots. Future opportunity.</Text><Body>Save the Arts connects cultural discovery, creative practice, and opportunity for the next generation. Explore the Heritage Tour and our planned Saturday arts sessions.</Body></View>
    <SectionHeader title="The mission in motion" />
    <View style={styles.grid}>{pillars.map(pillar => <View key={pillar.title} style={[styles.card, { flexBasis: 240, flexGrow: 1, flexShrink: 1, minWidth: 0 }]}><SectionIcon name={pillar.icon} /><Text style={styles.cardTitle}>{pillar.title}</Text><Body>{pillar.description}</Body></View>)}</View>
    <SectionHeader title="Mentorship at arm’s length" />
    <Card title="An experienced musician beside a student" description="Picture an older musician seated across from a young learner, showing how to hold the instrument, position the hands, and place each finger. The student tries it, hears the difference, and receives patient correction in the moment." />
    <Card title="A blues vocalist teaching breath" description="A seasoned female blues singer can help a young vocalist feel how breathing from the abdomen supports a phrase, then listen as the student tries again. Technique is taught face to face, with care for the student's comfort and vocal health." />
    <Card title="Practice, listen, try again" description="Build a proposed session around demonstration, the student's attempt, specific feedback, and another try. Pair learners with suitable mentors; confirm supervision, safeguarding, accessibility, instructor qualifications, and consent before sessions begin." />
    <Button label="Explore a four-session mentor pilot" href="/sta-mentor-pilot" secondary />
    <Button label="Plan a one-to-one mentor session" href="/sta-mentor-session" secondary />
    <SectionHeader title="Explore planned programs" />
    <View accessibilityRole="tablist" accessibilityLabel="Save the Arts programs" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{filters.map(filter => <Pressable key={filter.id} accessibilityRole="tab" aria-selected={selected === filter.id} accessibilityState={{ selected: selected === filter.id }} onPress={() => choose(filter.id)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 25, backgroundColor: selected === filter.id ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: selected === filter.id ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{filter.label}</Text></Pressable>)}</View>
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{visible.length} planned {visible.length === 1 ? 'program' : 'programs'}</Text>
    <Body>Open a program to explore its focus and save a creative interest on this device. Copy this page’s link to keep the selected program.</Body>
    {visible.map(program => <PathwayCard key={program.id} pathway={program} />)}
    <Card title="Before participation opens" description="Tour dates, destinations, Saturday session times, eligibility, accessibility information, mentors, and participation terms will be announced. This preview does not accept registrations." />
    <Button label="Review the Save the Arts leadership briefing" href="/save-the-arts-leadership" secondary />
    <Button label="Prepare a grant-meeting discussion brief" href="/sta-grant-brief" secondary />
    <Button label="Track grant preparation" href="/sta-readiness" secondary />
    <SectionHeader title="A creative community" />
    <Card title="From the stage to the work behind it" description="PTown’s development vision connects performance with audio, cameras, lighting, editing, and stage coordination. Participants can explore their strengths and build a record of their contributions." />
    <Button label="Explore Artist Development" href="/artist-development" secondary />
    <Button label="Explore community stories" href={{ pathname: '/media', params: { category: 'Stories' } }} secondary />
    <Button label="Review saved creative interests" href="/profile" secondary />
    <Button label="Browse all creative pathways" href="/creative" secondary />
  </>;
}
