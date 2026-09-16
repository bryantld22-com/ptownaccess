import { Pressable, Text, View } from 'react-native';
import { EventCard, Footer, PageHeader, PreviewNotice, Screen } from '../../src/components/ui';
import { useEventFilter, type EventFilter } from '../../src/hooks/useEventFilter';
import { theme } from '../../src/theme';
export default function Events() {
  const { filter, setFilter, events } = useEventFilter();
  return <Screen><PageHeader eyebrow="THE WEEK AT PTOWN" title="Find your rhythm." description="Jazz, comedy, soul, and Sunday fellowship. Explore our proposed weekly program." /><PreviewNotice calendar />
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>{(['All', 'Free', 'Ticketed'] as EventFilter[]).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={{ minHeight: 48, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30, backgroundColor: filter === item ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: filter === item ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item}</Text></Pressable>)}</View>
    {events.map(event => <EventCard key={event.id} event={event} />)}<Footer /></Screen>;
}
