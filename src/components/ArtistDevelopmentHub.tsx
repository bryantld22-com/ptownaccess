import { useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { developmentTracks } from '../data/artistDevelopment';
import { pathways } from '../data/pathways';
import { theme } from '../theme';
import { PathwayCard } from './PathwayCard';
import { SectionIcon } from './SectionIcon';
import { Body, Button, Card, Eyebrow, SectionHeader, styles } from './ui';

export function ArtistDevelopmentHub() {
  const router = useRouter();
  const params = useLocalSearchParams<{ track?: string | string[] }>();
  const routeTrack = developmentTracks.find(track => track.id === params.track)?.id ?? 'all';
  const [selected, setSelected] = useState('all');
  // Shared filters apply after hydration, matching the static export on startup.
  useEffect(() => { setSelected(routeTrack); }, [routeTrack]);
  function choose(id: string) { setSelected(id); router.setParams({ track: id === 'all' ? undefined : id }); }
  const tracks = developmentTracks.filter(track => selected === 'all' || track.id === selected);
  return <>
    <Card title="Build your craft from Day One." description="Explore a planned track, imagine your first project, and see how PTown’s departments work together. Save a creative interest on a pathway page to keep it in your device’s plans." />
    <Button label="Explore Monday auditions and Wednesday showcase preparation" href="/audition-path" secondary />
    <Button label="Review a Wednesday showcase" href="/showcase-review" secondary />
    <Button label="Evaluate a DJ or producer set" href="/dj-review" secondary />
    <Button label="Prepare the post-showcase owner handoff" href="/artist-handoff" secondary />
    <SectionHeader title="Explore planned tracks" />
    <View accessibilityRole="tablist" accessibilityLabel="Artist Development tracks" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {[{ id: 'all', label: 'All tracks' }, ...developmentTracks].map(track => <Pressable key={track.id} accessibilityRole="tab" aria-selected={selected === track.id} accessibilityState={{ selected: selected === track.id }} onPress={() => choose(track.id)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 25, backgroundColor: selected === track.id ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: selected === track.id ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{track.label}</Text></Pressable>)}
    </View>
    <Body>Copy this page’s link to reopen the same track.</Body>
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{tracks.length} planned {tracks.length === 1 ? 'track' : 'tracks'}</Text>
    {tracks.map(track => {
      const pathway = pathways.find(item => item.id === track.pathwayId);
      return <Fragment key={track.id}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><SectionIcon name={track.icon} /><Text accessibilityRole="header" style={[styles.cardTitle, { flex: 1 }]}>{track.title}</Text></View>
          <Eyebrow>YOUR DAY ONE PROJECT</Eyebrow><Body>{track.project}</Body>
          <Eyebrow>WORK TOGETHER</Eyebrow><Body>{track.collaborators}</Body>
          <Eyebrow>PORTFOLIO STARTERS</Eyebrow>{track.portfolio.map(item => <Text key={item} style={styles.smallBody}>• {item}</Text>)}
        </View>
        {pathway && <PathwayCard pathway={pathway} />}
      </Fragment>;
    })}
    <SectionHeader title="From practice to opportunity" />
    <Card title="01 · Practice together" description="Develop your skills through planned projects that connect performance, technical production, culinary craft, and storytelling." />
    <Card title="02 · Document your work" description="Build a portfolio showing the project, your role, the process, and what you learned. Keep evidence of your creative and technical contributions." />
    <Card title="03 · Explore your next step" description="Mentorship and connections to internships, apprenticeships, and employers are part of PTown’s development vision. Participation and career support details will be confirmed before enrollment." />
    <Button label="Open private Artist Development pipeline" href="/artist-development-dashboard" />
    <Button label="Manage private prospect profiles" href="/artist-prospects" secondary />
    <Button label="See Media projects" href="/media" secondary />
    <Button label="Review saved creative interests" href="/profile" secondary />
    <Button label="Browse all creative pathways" href="/creative" secondary />
  </>;
}
