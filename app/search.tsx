import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ActionButton, Field } from '../src/components/forms';
import { PathwayCard } from '../src/components/PathwayCard';
import { Body, Button, Card, EventCard, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { directoryPages } from '../src/data/directory';
import { events } from '../src/data/events';
import { pathways } from '../src/data/pathways';
import { usePreviewStore } from '../src/state/PreviewStore';
import { theme } from '../src/theme';

const filters = ['All', 'Programs', 'Creative', 'Sections', 'Saved'] as const;
type Filter = typeof filters[number];
const normalize = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function Search() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string | string[]; filter?: string | string[] }>();
  const routeQuery = typeof params.q === 'string' ? params.q.slice(0, 120) : '';
  const routeFilter = filters.find(value => value === params.filter) ?? 'All';
  // Static HTML has no query string. Apply URL state after hydration.
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  useEffect(() => { setQuery(routeQuery); }, [routeQuery]);
  useEffect(() => { setFilter(routeFilter); }, [routeFilter]);
  const { ready, storageError, savedEventIds, savedPathwayIds } = usePreviewStore();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const matches = (text: string) => words.every(word => normalize(text).includes(word));
  const programs = events.filter(event => (filter === 'All' || filter === 'Programs' || (filter === 'Saved' && ready && savedEventIds.includes(event.id))) && matches([event.title, event.day, event.category, event.admission, event.description, event.opening, event.afterParty].join(' ')));
  const creative = pathways.filter(pathway => (filter === 'All' || filter === 'Creative' || (filter === 'Saved' && ready && savedPathwayIds.includes(pathway.id))) && matches([pathway.title, pathway.division, pathway.description, pathway.project, ...pathway.focus].join(' ')));
  const pages = directoryPages.filter(page => (filter === 'All' || filter === 'Sections') && matches([page.title, page.description, page.keywords].join(' ')));
  const count = programs.length + creative.length + pages.length;
  function changeQuery(value: string) { setQuery(value); router.setParams({ q: value || undefined }); }
  function changeFilter(value: Filter) { setFilter(value); router.setParams({ filter: value === 'All' ? undefined : value }); }
  function reset() { setQuery(''); setFilter('All'); router.setParams({ q: undefined, filter: undefined }); }

  return <Screen>
    <PageHeader eyebrow="ONE PLACE TO EXPLORE" title="Find your PTown." description="Search proposed programs, creative pathways, and the places to plan your experience." />
    <PreviewNotice />
    <Field label="Search all PTown" placeholder="Try jazz, heritage, baking, or backup" value={query} onChangeText={changeQuery} autoCapitalize="none" autoCorrect={false} maxLength={120} hint="Use a title, weekday, creative skill, or app section. Every search word must match." />
    {!query.trim() && <View style={styles.grid}>{['Jazz', 'Heritage', 'Baking', 'VIP', 'Backup'].map(value => <ActionButton key={value} label={value} secondary onPress={() => changeQuery(value)} />)}</View>}
    <View accessibilityRole="tablist" accessibilityLabel="Search result filters" style={styles.grid}>{filters.map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: value === filter, disabled: value === 'Saved' && !ready }} aria-selected={value === filter} disabled={value === 'Saved' && !ready} onPress={() => changeFilter(value)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, backgroundColor: value === filter ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: value === filter ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{value}</Text></Pressable>)}</View>
    {filter === 'Saved' && !ready ? <Body>{storageError ? 'Saved results cannot be read. Open Profile to recover your device’s plans.' : 'Loading saved results…'}</Body> : <>
      <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{count} {count === 1 ? 'result' : 'results'}{filter === 'Saved' ? ' · Saved programs and creative interests' : ''}</Text>
      {(query || filter !== 'All') && <ActionButton label="Reset search" secondary onPress={reset} />}
      {!count && <Card title={filter === 'Saved' && !query.trim() ? 'No saved results yet' : 'No results match'} description="Try another word or reset your search. Save programs and creative interests from their detail pages to find them here." />}
      {programs.length > 0 && <><SectionHeader title={`Programs · ${programs.length}`} />{programs.map(event => <EventCard key={event.id} event={event} />)}</>}
      {creative.length > 0 && <><SectionHeader title={`Creative pathways · ${creative.length}`} />{creative.map(pathway => <PathwayCard key={pathway.id} pathway={pathway} />)}</>}
      {pages.length > 0 && <><SectionHeader title={`Sections & planning · ${pages.length}`} />{pages.map(page => <Link key={page.title} href={page.href} asChild><Pressable accessibilityRole="link" accessibilityLabel={`Open ${page.title}`} style={styles.card}><Text style={styles.cardTitle}>{page.title}</Text><Body>{page.description}</Body><Text style={styles.textLink}>Explore →</Text></Pressable></Link>)}</>}
    </>}
    <Button label="Open saved plans" href="/profile" secondary /><Button label="Return home" href="/" secondary /><Footer />
  </Screen>;
}
