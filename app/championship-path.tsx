import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SectionIcon } from '../src/components/SectionIcon';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { championshipFocuses, championshipLaunchSequence, type ChampionshipFocusId } from '../src/data/championshipPath';
import { theme } from '../src/theme';

const defaultFocus = championshipFocuses[0];

export default function ChampionshipPath() {
  const { focus } = useLocalSearchParams<{ focus?: string | string[] }>();
  const router = useRouter();
  const routeFocus = typeof focus === 'string' && championshipFocuses.some(item => item.id === focus) ? focus as ChampionshipFocusId : defaultFocus.id;
  const [selected, setSelected] = useState<ChampionshipFocusId>(defaultFocus.id);
  useEffect(() => { setSelected(routeFocus); }, [routeFocus]);
  const active = championshipFocuses.find(item => item.id === selected) ?? defaultFocus;

  function choose(id: ChampionshipFocusId) {
    setSelected(id);
    router.setParams({ focus: id === defaultFocus.id ? undefined : id });
  }

  return <Screen>
    <Stack.Screen options={{ title: 'Championship Path' }} />
    <PageHeader eyebrow="PTOWN TOURNAMENT PROGRAM · BUILD 62 BLUEPRINT" title="A local table can lead to a regional stage." description="Build a quarterly cards-and-dominoes season, earn chess-hub credibility, fund winner travel responsibly, and turn every event into measurable PTown media and sponsor value." />
    <PreviewNotice calendar />
    <Card title="Recommended launch model" description="Start sponsor-funded with free preregistration for the first season. Protect committed travel support before promotion. Consider a modest registration fee only after costs, demand, refund terms, and Kentucky legal and tax review are clear." />
    <Card title="Blueprint—not registration or a prize offer" description="This page does not register a player, collect money, reserve entry, publish standings, promise a prize or trip, grant chess affiliation, qualify a contender, obtain media consent, or create a broadcast." />

    <SectionHeader title="Choose a program focus" />
    <View accessibilityRole="tablist" accessibilityLabel="Championship program focuses" style={styles.grid}>
      {championshipFocuses.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: selected === item.id }} aria-selected={selected === item.id} onPress={() => choose(item.id)} style={[local.tab, selected === item.id && local.tabSelected]}>
        <Text style={[local.tabLabel, selected === item.id && local.tabTextSelected]}>{item.label}</Text>
      </Pressable>)}
    </View>

    <View style={local.focusCard}>
      <SectionIcon name={active.icon} />
      <Text style={styles.eyebrow}>{active.label.toUpperCase()}</Text>
      <Text accessibilityRole="header" style={local.focusTitle}>{active.title}</Text>
      <Body>{active.summary}</Body>
    </View>

    <SectionHeader title="Build this" />
    <PlanList items={active.build} numbered />
    <SectionHeader title="Safeguards before launch" />
    <PlanList items={active.safeguards} />
    <Card title="Not active yet" description={active.pending} />

    <SectionHeader title="Launch sequence" />
    <PlanList items={championshipLaunchSequence} numbered />
    <Card title="One accountable scorecard" description="After every quarter, review registrations, attendance, completed matches, disputes, verified standings, sponsor delivery, event cost, media reach, participant feedback, accessibility findings, safety issues, and the next corrective action." />

    <Button label="Return to the Tournament Hub" href="/tournament" />
    <Button label="Review PTown Media Group" href="/media-group" secondary />
    <Button label="Return to PTown" href="/ptown" secondary />
    <Footer />
  </Screen>;
}

function PlanList({ items, numbered = false }: { items: readonly string[]; numbered?: boolean }) {
  return <View style={local.list}>{items.map((item, index) => <View key={item} style={local.listRow}>
    <Text aria-hidden style={local.marker}>{numbered ? `${index + 1}` : '•'}</Text>
    <Text style={local.listText}>{item}</Text>
  </View>)}</View>;
}

const local = StyleSheet.create({
  tab: { flexBasis: 210, flexGrow: 1, minWidth: 0, minHeight: 52, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  tabSelected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  tabLabel: { color: theme.colors.cream, fontSize: 14, lineHeight: 21, fontWeight: '600', textAlign: 'center' },
  tabTextSelected: { color: theme.colors.background },
  focusCard: { backgroundColor: theme.colors.elevated, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.gold, gap: 10 },
  focusTitle: { color: theme.colors.cream, fontSize: 28, lineHeight: 35, fontWeight: '600' },
  list: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, gap: 14 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  marker: { width: 24, color: theme.colors.gold, fontSize: 15, lineHeight: 25, fontWeight: '700', textAlign: 'center' },
  listText: { flex: 1, color: theme.colors.muted, fontSize: 16, lineHeight: 25 },
});
