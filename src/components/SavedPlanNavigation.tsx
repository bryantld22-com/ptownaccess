import { Pressable, Text, View } from 'react-native';
import { usePreviewStore } from '../state/PreviewStore';
import { theme } from '../theme';
import { Body, SectionHeader, styles } from './ui';

export const profileViews = ['all', 'events', 'dinner', 'membership', 'creative'] as const;
export type ProfileView = typeof profileViews[number];

export function SavedPlanNavigation({ selected, onSelect }: { selected: ProfileView; onSelect: (view: ProfileView) => void }) {
  const { ready, savedEventIds, savedPathwayIds, reservationDraft, membershipInterest } = usePreviewStore();
  const items: { id: ProfileView; title: string; count: number }[] = [
    { id: 'all', title: 'All plans', count: savedEventIds.length + savedPathwayIds.length + Number(!!reservationDraft) + Number(!!membershipInterest) },
    { id: 'events', title: 'Events', count: savedEventIds.length },
    { id: 'dinner', title: 'Dinner', count: Number(!!reservationDraft) },
    { id: 'membership', title: 'Membership', count: Number(!!membershipInterest) },
    { id: 'creative', title: 'Creative', count: savedPathwayIds.length },
  ];
  return <>
    <SectionHeader title="Your saved plan at a glance" />
    <Body>Choose a category to find your saved ideas or start a new plan. Category links show this device’s plans; they do not share or sync saved information.</Body>
    <View accessibilityRole="tablist" accessibilityLabel="Saved plan categories" style={styles.grid}>{items.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.title} accessibilityState={{ selected: selected === item.id, disabled: !ready }} aria-selected={selected === item.id} disabled={!ready} onPress={() => onSelect(item.id)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 30, borderWidth: 1, borderColor: theme.colors.border, opacity: ready ? 1 : 0.5, backgroundColor: selected === item.id ? theme.colors.gold : theme.colors.surface }}>
      <Text style={{ color: selected === item.id ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item.title}</Text>
      <Text accessibilityLabel={ready ? `${item.count} saved` : 'Not loaded'} style={{ color: selected === item.id ? theme.colors.background : theme.colors.muted }}>{ready ? item.count : '…'}</Text>
    </Pressable>)}</View>
  </>;
}
