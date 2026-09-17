import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ActionButton, Field } from '../src/components/forms';
import { PathwayCard } from '../src/components/PathwayCard';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen } from '../src/components/ui';
import { creativeDivisions, pathways, type CreativeDivision } from '../src/data/pathways';
import { usePreviewStore } from '../src/state/PreviewStore';
import { theme } from '../src/theme';

type Filter = 'All pathways' | 'Saved interests' | CreativeDivision;
const filters: Filter[] = ['All pathways', ...creativeDivisions, 'Saved interests'];
export default function Creative() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string | string[]; filter?: string | string[] }>();
  const routeQuery = typeof params.q === 'string' ? params.q.slice(0, 120) : '';
  const routeFilter = filters.find(value => value === params.filter) ?? 'All pathways';
  // Static HTML contains the full library. Apply URL state after hydration.
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All pathways');
  useEffect(() => { setQuery(routeQuery); }, [routeQuery]);
  useEffect(() => { setFilter(routeFilter); }, [routeFilter]);
  const { ready, storageError, savedPathwayIds } = usePreviewStore();
  function changeQuery(value: string) { setQuery(value); router.setParams({ q: value || undefined }); }
  function changeFilter(value: Filter) { setFilter(value); router.setParams({ filter: value === 'All pathways' ? undefined : value }); }
  function reset() { setQuery(''); setFilter('All pathways'); router.setParams({ q: undefined, filter: undefined }); }
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = pathways.filter(pathway => (filter === 'All pathways' || (filter === 'Saved interests' ? savedPathwayIds.includes(pathway.id) : pathway.division === filter)) && words.every(word => [pathway.title, pathway.division, pathway.description, pathway.project, ...pathway.focus].join(' ').toLowerCase().includes(word)));
  return <Screen>
    <PageHeader eyebrow="CULTURE. CRAFT. OPPORTUNITY." title="Find your creative path." description="Discover PTown’s planned opportunities across Save the Arts, Artist Development, and Media." /><PreviewNotice />
    <Field label="Search creative pathways" placeholder="Try heritage, recording, or baking" hint="Copy this page’s link to reopen the same search and filter." value={query} onChangeText={changeQuery} autoCorrect={false} autoCapitalize="none" maxLength={120} />
    <View accessibilityRole="tablist" accessibilityLabel="Creative pathway filters" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{filters.map(item => <Pressable key={item} accessibilityRole="tab" aria-selected={filter === item} accessibilityState={{ selected: filter === item, disabled: item === 'Saved interests' && !ready }} disabled={item === 'Saved interests' && !ready} onPress={() => changeFilter(item)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 25, backgroundColor: filter === item ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: filter === item ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item}</Text></Pressable>)}</View>
    {filter === 'Saved interests' && <Body>This filter uses interests saved on this device. A copied link keeps the filter, but does not transfer your saved plans.</Body>}
    {(query || filter !== 'All pathways') && <ActionButton label="Reset pathway filters" secondary onPress={reset} />}
    {filter === 'Saved interests' && !ready ? <Body>{storageError ? 'Saved interests cannot be read. Open Profile to recover your device’s plans.' : 'Loading saved interests…'}</Body> : <>
      <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.muted, fontSize: 14 }}>{matches.length} {matches.length === 1 ? 'pathway' : 'pathways'} · Planned opportunities{filter === 'Saved interests' ? ' · Saved on this device' : ''}</Text>
      {matches.length ? matches.map(pathway => <PathwayCard key={pathway.id} pathway={pathway} />) : <Card title={filter === 'Saved interests' && !query.trim() ? 'No creative interests saved yet' : 'No pathways match'} description="Explore a pathway and save your interest, or reset the filters to see all planned opportunities. Saving does not submit an application." />}
    </>}
    <Button label="View your saved interests" href="/profile" secondary /><Button label="Return home" href="/" secondary /><Footer />
  </Screen>;
}
