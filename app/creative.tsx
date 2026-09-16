import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ActionButton, Field } from '../src/components/forms';
import { PathwayCard } from '../src/components/PathwayCard';
import { Button, Card, Footer, PageHeader, PreviewNotice, Screen } from '../src/components/ui';
import { creativeDivisions, pathways, type CreativeDivision } from '../src/data/pathways';
import { usePreviewStore } from '../src/state/PreviewStore';
import { theme } from '../src/theme';

type Filter = 'All pathways' | 'Saved interests' | CreativeDivision;
export default function Creative() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All pathways');
  const { ready, savedPathwayIds } = usePreviewStore();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = pathways.filter(pathway => (filter === 'All pathways' || (filter === 'Saved interests' ? savedPathwayIds.includes(pathway.id) : pathway.division === filter)) && words.every(word => [pathway.title, pathway.division, pathway.description, pathway.project, ...pathway.focus].join(' ').toLowerCase().includes(word)));
  return <Screen>
    <PageHeader eyebrow="CULTURE. CRAFT. OPPORTUNITY." title="Find your creative path." description="Discover PTown’s planned opportunities across Save the Arts, Artist Development, and Media." /><PreviewNotice />
    <Field label="Search creative pathways" placeholder="Try heritage, recording, or baking" value={query} onChangeText={setQuery} autoCorrect={false} autoCapitalize="none" maxLength={120} />
    <View accessibilityRole="tablist" accessibilityLabel="Creative pathway filters" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{(['All pathways', ...creativeDivisions, 'Saved interests'] as Filter[]).map(item => <Pressable key={item} accessibilityRole="tab" aria-selected={filter === item} accessibilityState={{ selected: filter === item, disabled: item === 'Saved interests' && !ready }} disabled={item === 'Saved interests' && !ready} onPress={() => setFilter(item)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 25, backgroundColor: filter === item ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: filter === item ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item}</Text></Pressable>)}</View>
    <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.muted, fontSize: 14 }}>{matches.length} {matches.length === 1 ? 'pathway' : 'pathways'} · Planned opportunities</Text>
    {(query.trim() || filter !== 'All pathways') && <ActionButton label="Reset pathway filters" secondary onPress={() => { setQuery(''); setFilter('All pathways'); }} />}
    {matches.length ? matches.map(pathway => <PathwayCard key={pathway.id} pathway={pathway} />) : <Card title={filter === 'Saved interests' && !query.trim() ? 'No creative interests saved yet' : 'No pathways match'} description="Explore a pathway and save your interest, or reset the filters to see all planned opportunities. Saving does not submit an application." />}
    <Button label="View your saved interests" href="/profile" secondary /><Button label="Return home" href="/" secondary /><Footer />
  </Screen>;
}
