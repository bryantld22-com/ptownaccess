import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { mediaCategories, mediaFeatures, type MediaCategory } from '../data/media';
import { theme } from '../theme';
import { ActionButton, Field } from './forms';
import { MediaCard } from './MediaCard';
import { Body, Button, Card, Eyebrow, SectionHeader, styles } from './ui';

type Filter = 'All media' | MediaCategory;
const filters: Filter[] = ['All media', ...mediaCategories];
export function MediaLibrary() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string | string[]; category?: string | string[] }>();
  const routeQuery = typeof params.q === 'string' ? params.q.slice(0, 120) : '';
  const routeFilter = filters.find(value => value === params.category) ?? 'All media';
  // Keep static HTML and browser startup identical before applying shared URL state.
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All media');
  useEffect(() => { setQuery(routeQuery); }, [routeQuery]);
  useEffect(() => { setFilter(routeFilter); }, [routeFilter]);
  function changeQuery(value: string) { setQuery(value); router.setParams({ q: value || undefined }); }
  function changeFilter(value: Filter) { setFilter(value); router.setParams({ category: value === 'All media' ? undefined : value }); }
  function reset() { setQuery(''); setFilter('All media'); router.setParams({ q: undefined, category: undefined }); }
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = mediaFeatures.filter(feature => (filter === 'All media' || feature.category === filter) && words.every(word => [feature.title, feature.category, feature.description, feature.project, ...feature.topics].join(' ').toLowerCase().includes(word)));
  return <>
    <View style={styles.card}><Eyebrow>PTOWN MEDIA GROUP</Eyebrow><Text style={styles.cardTitle}>PTown, in sound and story.</Text><Body>Explore the stories, conversations, and performances we plan to share. Episodes, videos, and live streams will appear when available.</Body></View>
    <Button label="Explore the Media Group foundation" href="/media-group" secondary />
    <SectionHeader title="Explore planned media" />
    <Field label="Search PTown media" placeholder="Try documentary, podcast, or music" hint="Copy this page’s link to keep your search and category." value={query} onChangeText={changeQuery} autoCorrect={false} autoCapitalize="none" maxLength={120} />
    <View accessibilityRole="tablist" accessibilityLabel="Media categories" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {filters.map(item => <Pressable key={item} accessibilityRole="tab" aria-selected={filter === item} accessibilityState={{ selected: filter === item }} onPress={() => changeFilter(item)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 25, backgroundColor: filter === item ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: filter === item ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item}</Text></Pressable>)}
    </View>
    {(query || filter !== 'All media') && <ActionButton label="Reset media filters" secondary onPress={reset} />}
    <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.muted, fontSize: 14 }}>{matches.length} planned {matches.length === 1 ? 'feature' : 'features'}</Text>
    {matches.length ? matches.map(feature => <MediaCard key={feature.id} feature={feature} />) : <Card title="No media concepts match" description="Try another search or reset the filters to explore all planned features." />}
    <Card title="Build the story with us" description="Explore the creative pathways below for documentary storytelling, podcast recording, interviews, and editing. Participation details will be announced." />
  </>;
}
