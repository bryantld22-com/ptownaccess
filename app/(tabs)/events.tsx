import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Card, EventCard, Footer, PageHeader, PreviewNotice, Screen } from '../../src/components/ui';
import { ActionButton, Field } from '../../src/components/forms';
import { WeeklyProgram } from '../../src/components/WeeklyProgram';
import { weekDays } from '../../src/data/events';
import { usePreviewStore } from '../../src/state/PreviewStore';
import { useEventFilter, type EventFilter, type DayFilter } from '../../src/hooks/useEventFilter';
import { theme } from '../../src/theme';
export default function Events() {
  const params = useLocalSearchParams<{ day?: string; filter?: string; q?: string; view?: string }>();
  const router = useRouter();
  const { ready, storageError } = usePreviewStore();
  const { filter, setFilter, query, setQuery, day, setDay, events } = useEventFilter(params);
  const [view, setView] = useState<'List' | 'Week'>('List');
  const normalizedView = params.view === 'Week' ? 'Week' : 'List';
  useEffect(() => { setView(normalizedView); }, [normalizedView]);
  function changeDay(next: DayFilter) { setDay(next); router.setParams({ day: next === 'Any day' ? undefined : next }); }
  function changeFilter(next: EventFilter) { setFilter(next); router.setParams({ filter: next === 'All' ? undefined : next }); }
  function changeQuery(next: string) { const value = next.slice(0, 120); setQuery(value); router.setParams({ q: value || undefined }); }
  function changeView(next: 'List' | 'Week') { setView(next); router.setParams({ view: next === 'List' ? undefined : next }); }
  function reset() { setFilter('All'); setQuery(''); setDay('Any day'); router.setParams({ filter: undefined, q: undefined, day: undefined }); }
  return <Screen><PageHeader eyebrow="THE WEEK AT PTOWN" title="Find your rhythm." description="Jazz, comedy, soul, and Sunday fellowship. Explore our proposed weekly program." /><PreviewNotice calendar />
    <Button label="Compare programs" href="/compare" secondary />
    <Field label="Search programs" placeholder="Try jazz, comedy, or a weekday" hint="Search titles, genres, weekdays, and program details. Copy the page link to keep your search and view." value={query} onChangeText={changeQuery} autoCapitalize="none" autoCorrect={false} maxLength={120} />
    <Choices label="Admission or saved programs" options={['All', 'Free', 'Ticketed', 'Saved']} selected={filter} onSelect={changeFilter} disabledOption={!ready ? 'Saved' : undefined} />
    <View style={{ gap: 10 }}><Body>Choose a weekday</Body><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['Any day', ...weekDays] as DayFilter[]).map(item => <Pressable key={item} accessibilityRole="button" accessibilityLabel={item} aria-pressed={day === item} onPress={() => changeDay(item)} style={{ paddingHorizontal: 14, paddingVertical: 12, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: day === item ? theme.colors.gold : theme.colors.border, backgroundColor: day === item ? theme.colors.elevated : theme.colors.background }}><Text style={{ color: day === item ? theme.colors.gold : theme.colors.muted }}>{item}</Text></Pressable>)}</View></View>
    <Choices label="Program view" options={['List', 'Week']} selected={view} onSelect={changeView} />
    {filter === 'Saved' && <Body>A saved-program link uses only this device’s favorites. It does not transfer your saved plans or purchase admission.</Body>}
    {(filter !== 'Saved' || ready) && <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.muted, fontSize: 14 }}>{events.length} {events.length === 1 ? 'program' : 'programs'}{day !== 'Any day' ? ` · ${day}` : ''}{filter === 'Saved' ? ' · Saved on this device' : ''}</Text>}
    {(query.trim() || filter !== 'All' || day !== 'Any day') && <ActionButton label="Reset filters" secondary onPress={reset} />}
    {filter === 'Saved' && !ready ? <Card title={storageError ? 'Saved programs unavailable' : 'Loading saved programs…'} description={storageError ? 'Saved programs cannot be read. Open Profile to recover your device’s plans.' : 'Checking this device’s saved favorites.'} /> : !events.length ? <Card title={filter === 'Saved' && !query.trim() && day === 'Any day' ? 'No saved programs yet' : 'No programs match'} description={filter === 'Saved' ? 'Save a program from its detail page. Reset filters to explore the full proposed week.' : 'Try a different search, admission filter, or weekday. Reset filters to explore the full proposed week.'} /> : view === 'Week' ? <WeeklyProgram events={events} /> : events.map(event => <EventCard key={event.id} event={event} />)}<Footer /></Screen>;
}

function Choices<T extends string>({ label, options, selected, onSelect, disabledOption }: { label: string; options: T[]; selected: T; onSelect: (value: T) => void; disabledOption?: T }) {
  return <View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>{options.map(item => <Pressable key={item} accessibilityRole="tab" aria-selected={selected === item} accessibilityState={{ selected: selected === item, disabled: disabledOption === item }} disabled={disabledOption === item} onPress={() => onSelect(item)} style={{ minHeight: 48, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30, backgroundColor: selected === item ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, opacity: disabledOption === item ? 0.5 : 1 }}><Text style={{ color: selected === item ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item}</Text></Pressable>)}</View>;
}
