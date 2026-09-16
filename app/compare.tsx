import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ActionButton, Feedback } from '../src/components/forms';
import { Body, Button, Card, Eyebrow, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { events } from '../src/data/events';
import { usePreviewStore } from '../src/state/PreviewStore';
import { theme } from '../src/theme';

export default function Compare() {
  const router = useRouter();
  const { ids } = useLocalSearchParams<{ ids?: string | string[] }>();
  const routeIds = typeof ids === 'string' ? ids.split(',') : [];
  const normalized = events.filter(event => routeIds.includes(event.id)).slice(0, 3).map(event => event.id).join(',');
  // Keep the first render identical to static HTML, then apply search parameters.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => { setSelectedIds(normalized ? normalized.split(',') : []); }, [normalized]);
  const [message, setMessage] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const { ready, busy, savedEventIds, toggleEvent } = usePreviewStore();
  const selected = events.filter(event => selectedIds.includes(event.id));

  function choose(next: string[]) {
    const canonical = events.filter(event => next.includes(event.id)).slice(0, 3).map(event => event.id);
    setMessage(null); setSelectedIds(canonical);
    router.setParams({ ids: canonical.length ? canonical.join(',') : undefined });
  }
  function toggle(id: string) {
    if (selectedIds.includes(id)) choose(selectedIds.filter(value => value !== id));
    else if (selectedIds.length < 3) choose([...selectedIds, id]);
  }
  function useSaved() {
    const saved = events.filter(event => savedEventIds.includes(event.id)).map(event => event.id);
    if (!saved.length) { setMessage('No saved programs yet. Choose programs below or save a favorite from its detail page.'); return; }
    choose(saved);
    if (saved.length > 3) setMessage('Showing your first three saved programs in weekday order. Change the selection below to compare others.');
  }
  async function save(id: string) {
    const wasSaved = savedEventIds.includes(id);
    setMessage(null);
    if (await toggleEvent(id)) setMessage(wasSaved ? 'Program removed from your saved plans.' : 'Program saved on this device. No ticket has been purchased.');
  }

  return <Screen>
    <PageHeader eyebrow="FIND YOUR KIND OF EVENING" title="Compare the program." description="Choose up to three proposed programs and explore the admission, dinner approach, and evening details together." />
    <PreviewNotice calendar />
    <ActionButton label="Compare my saved programs" disabled={!ready} secondary onPress={useSaved} />
    <Feedback message={message} />
    <SectionHeader title="Choose up to three" />
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{selected.length} of 3 programs selected</Text>
    {selected.length === 3 && <Body>Three programs selected. Remove one to choose another.</Body>}
    <View style={styles.grid}>{events.map(event => {
      const checked = selectedIds.includes(event.id);
      const disabled = !checked && selectedIds.length === 3;
      return <Pressable key={event.id} accessibilityRole="checkbox" accessibilityLabel={`${event.day}: ${event.title}`} accessibilityState={{ checked, disabled }} aria-checked={checked} disabled={disabled} onPress={() => toggle(event.id)} style={[compare.choice, { width: width >= 900 ? '31.5%' : width >= 600 ? '48%' : '100%' }, checked && compare.selected, disabled && { opacity: 0.5 }]}>
        <Text style={styles.smallBody}>{event.day}</Text><Text style={styles.cardTitle}>{event.title}</Text><Text style={compare.marker}>{checked ? 'Selected ✓' : 'Add to comparison +'}</Text>
      </Pressable>;
    })}</View>
    {selected.length > 0 && <ActionButton label="Clear comparison" secondary onPress={() => choose([])} />}
    <SectionHeader title="Your comparison" />
    {!selected.length ? <Card title="Which evening feels like you?" description="Choose a program above to begin. Add a second or third to compare. Your selection stays in this page’s link; it does not change saved plans until you press Save." /> : <View style={styles.grid}>{selected.map(event => {
      const saved = savedEventIds.includes(event.id);
      const dinner = event.day === 'Sunday' ? 'Gospel jazz brunch is planned, followed by R&B jazz until 6 pm.' : event.admission === 'Ticketed' ? 'One culture signature plate and one alternate plate are planned.' : 'An open menu is planned.';
      return <View key={event.id} style={[styles.card, { width: width >= 900 ? '31.5%' : width >= 600 ? '48%' : '100%', padding: 20 }]}>
        <Eyebrow>{event.day.toUpperCase()}</Eyebrow><Text accessibilityRole="header" style={styles.cardTitle}>{event.title}</Text>
        <Text style={compare.label}>Admission</Text><Body>{event.admission === 'Free' ? 'Free entry proposed. Meals and drinks are not confirmed as included.' : 'Ticketed entry proposed. Prices and food inclusions will be announced.'}</Body>
        <Text style={compare.label}>Dinner</Text><Body>{dinner}</Body>
        <Text style={compare.label}>Opening</Text><Body>{event.opening ?? 'Opening details have not been announced.'}</Body>
        <Text style={compare.label}>After the show</Text><Body>{event.afterParty ?? 'No after-party has been announced for this proposed program.'}</Body>
        <ActionButton label={saved ? `Remove ${event.day} program` : `Save ${event.day} program`} secondary disabled={!ready || busy} onPress={() => { void save(event.id); }} />
        <Button label={`View ${event.day} details`} href={{ pathname: '/events/[id]', params: { id: event.id } }} secondary />
        <Button label={`Plan a ${event.day} visit`} href={{ pathname: '/visit', params: { day: event.day } }} secondary />
      </View>;
    })}</View>}
    <Body>These are recurring program ideas, not confirmed events. Dishes, dates, artists, pricing, and after-party entry terms will be announced. Saving does not purchase tickets or reserve a table.</Body>
    <Button label="Review your saved plan" href="/plans" secondary /><Button label="Browse all programs" href="/events" secondary /><Footer />
  </Screen>;
}

const compare = StyleSheet.create({
  choice: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: 16, gap: 6, minHeight: 100, width: '100%' },
  selected: { borderColor: theme.colors.gold, backgroundColor: theme.colors.elevated },
  marker: { color: theme.colors.gold, fontSize: 12, lineHeight: 20 },
  label: { color: theme.colors.gold, fontSize: 14, fontWeight: '600', marginTop: 10 },
});
