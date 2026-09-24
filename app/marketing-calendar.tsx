import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { marketingCampaigns, marketingFunnel } from '../src/data/marketing';
import { theme } from '../src/theme';

type Quarter = 'all' | '1' | '2' | '3' | '4';
const quarters: { id: Quarter; label: string }[] = [
  { id: 'all', label: 'Full year' }, { id: '1', label: 'Months 1–3' },
  { id: '2', label: 'Months 4–6' }, { id: '3', label: 'Months 7–9' }, { id: '4', label: 'Months 10–12' },
];

export default function MarketingCalendar() {
  const { quarter } = useLocalSearchParams<{ quarter?: string | string[] }>();
  const router = useRouter();
  const routeQuarter = typeof quarter === 'string' && quarters.some(item => item.id === quarter) ? quarter as Quarter : 'all';
  const [selected, setSelected] = useState<Quarter>('all');
  useEffect(() => setSelected(routeQuarter), [routeQuarter]);
  const visible = marketingCampaigns.filter(item => selected === 'all' || Math.ceil(item.month / 3).toString() === selected);
  function select(value: Quarter) {
    setSelected(value);
    router.setParams({ quarter: value === 'all' ? undefined : value });
  }

  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Campaign Calendar' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 67" title="A campaign rhythm from foundation to launch." description="Twelve relative planning months with a clear owner function, action, and measurement for each step." />
    <PreviewNotice />
    <Card title="Planning sequence, not scheduled dates" description="Month 1 starts when PTown approves the marketing work plan. Opening dates, campaign spend, ticket links, partner commitments, and venue readiness are not confirmed by this calendar." />
    <SectionHeader title="Choose a planning period" />
    <View accessibilityRole="tablist" accessibilityLabel="Marketing planning periods" style={styles.grid}>
      {quarters.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: selected === item.id }} aria-selected={selected === item.id} onPress={() => select(item.id)} style={[local.tab, selected === item.id && local.active]}><Text style={[local.label, selected === item.id && local.activeLabel]}>{item.label}</Text></Pressable>)}
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{visible.length} of 12 campaign months shown.</Text>
    {visible.map(item => <Card key={item.month} title={`Month ${item.month} · ${item.title}`} description={`${item.channel} · ${item.action} Measure: ${item.measure}`} />)}
    <SectionHeader title="PTown Access marketing funnel" />
    <Body>Use real opt-in, booking, and attendance data only after those systems are activated. These are measurement definitions, not live metrics.</Body>
    {marketingFunnel.map(item => <Card key={item.stage} title={item.stage} description={`Signal: ${item.signal}. Review: ${item.decision}`} />)}
    <Button label="Return to Marketing & Brand" href="/marketing" />
    <Footer />
  </Screen>;
}

const local = StyleSheet.create({
  tab: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  active: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  label: { color: theme.colors.cream, fontSize: 14, fontWeight: '600' },
  activeLabel: { color: theme.colors.background },
});
