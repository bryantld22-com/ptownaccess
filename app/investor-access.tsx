import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { SectionIcon } from '../src/components/SectionIcon';
import { investorAccessTiers, type InvestorAccessTierId } from '../src/data/investorAccess';
import { theme } from '../src/theme';

const defaultTier = investorAccessTiers[0];

export default function InvestorAccess() {
  const { tier } = useLocalSearchParams<{ tier?: string | string[] }>();
  const router = useRouter();
  const routeTier = typeof tier === 'string' && investorAccessTiers.some(item => item.id === tier) ? tier as InvestorAccessTierId : defaultTier.id;
  const [selected, setSelected] = useState<InvestorAccessTierId>(defaultTier.id);
  useEffect(() => { setSelected(routeTier); }, [routeTier]);
  const active = investorAccessTiers.find(item => item.id === selected) ?? defaultTier;

  function choose(id: InvestorAccessTierId) {
    setSelected(id);
    router.setParams({ tier: id === defaultTier.id ? undefined : id });
  }

  return <Screen>
    <Stack.Screen options={{ title: 'Investor Access' }} />
    <PageHeader eyebrow="PTOWN EXECUTIVE INVESTORS EDITION · ACCESS BLUEPRINT" title="The right investor sees the right information." description="Stage investor information by verified need, protect PTown’s confidential records, and make every protected grant specific, reviewable, and temporary." />
    <PreviewNotice />
    <Card title="Blueprint—not a live investor portal" description="No sign-in, investor verification, document access, data room, financial file, investment offer, approval, or transaction is active here. This page maps the safeguards required before the Executive Investors Edition goes live." />

    <SectionHeader title="Choose an information tier" />
    <View accessibilityRole="tablist" accessibilityLabel="Investor information tiers" style={styles.grid}>
      {investorAccessTiers.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: selected === item.id }} aria-selected={selected === item.id} onPress={() => choose(item.id)} style={[local.tab, selected === item.id && local.tabSelected]}>
        <Text style={[local.tabLevel, selected === item.id && local.tabTextSelected]}>{item.level.toUpperCase()}</Text>
        <Text style={[local.tabTitle, selected === item.id && local.tabTextSelected]}>{item.title}</Text>
      </Pressable>)}
    </View>

    <View style={local.tierCard}>
      <SectionIcon name={active.icon} />
      <Text style={styles.eyebrow}>{active.level.toUpperCase()} TIER</Text>
      <Text accessibilityRole="header" style={local.tierTitle}>{active.title}</Text>
      <Body>{active.summary}</Body>
    </View>

    <SectionHeader title="Planned material for this tier" />
    <TierList items={active.materials} />
    <SectionHeader title="Required before access" />
    <TierList items={active.requirements} numbered />
    <SectionHeader title="Denied by default" />
    <TierList items={active.deniedByDefault} blocked />

    <SectionHeader title="Controls for every protected investor tier" />
    <View style={styles.grid}>
      <Card title="Verified identity and status" description="Confirm who the person is, why access is needed, and whether the person is prospective, approved for diligence, or an active investor." />
      <Card title="Confidentiality and legal review" description="Use the appropriate NDA, disclosures, securities guidance, and professional legal/accounting review before protected financial information is shared." />
      <Card title="Document-level scope" description="Grant the smallest set of folders or documents needed for the approved purpose; higher trust never means unrestricted access." />
      <Card title="Audit, expiration, and revocation" description="Record protected grants and activity, review access regularly, expire temporary permission, and remove it immediately when status or need changes." />
    </View>

    <Card title="Investor access does not create operating authority" description="Investor information tiers remain separate from PTown staff, performer, production, director, administrator, and ownership-control roles. A financial relationship never silently grants backstage, personnel, media, system, or management access." />
    <Card title="Not an investment offer" description="This preview is an internal access-design map, not an offer to sell securities, a solicitation, legal advice, tax advice, or financial advice. Live investor materials require qualified legal and accounting review." />
    <Button label="Review PTown operational access roles" href="/access-roles" secondary />
    <Button label="Return to PTown Media Group" href="/media-group" secondary />
    <Button label="Return to PTown" href="/ptown" secondary />
    <Footer />
  </Screen>;
}

function TierList({ items, numbered = false, blocked = false }: { items: readonly string[]; numbered?: boolean; blocked?: boolean }) {
  return <View style={[local.list, blocked && local.blockedList]}>{items.map((item, index) => <View key={item} style={local.listRow}>
    <Text aria-hidden style={[local.marker, blocked && local.blockedMarker]}>{numbered ? `${index + 1}` : blocked ? '×' : '•'}</Text>
    <Text style={local.listText}>{item}</Text>
  </View>)}</View>;
}

const local = StyleSheet.create({
  tab: { flexBasis: 220, flexGrow: 1, minWidth: 0, minHeight: 78, paddingHorizontal: 18, paddingVertical: 15, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center', gap: 4 },
  tabSelected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  tabLevel: { color: theme.colors.gold, fontSize: 11, lineHeight: 17, fontWeight: '700', letterSpacing: 1.5 },
  tabTitle: { color: theme.colors.cream, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  tabTextSelected: { color: theme.colors.background },
  tierCard: { backgroundColor: theme.colors.elevated, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.gold, gap: 10 },
  tierTitle: { color: theme.colors.cream, fontSize: 28, lineHeight: 35, fontWeight: '600' },
  list: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, gap: 14 },
  blockedList: { borderLeftWidth: 3, borderLeftColor: theme.colors.gold },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  marker: { width: 24, color: theme.colors.gold, fontSize: 15, lineHeight: 25, fontWeight: '700', textAlign: 'center' },
  blockedMarker: { color: theme.colors.muted },
  listText: { flex: 1, color: theme.colors.muted, fontSize: 16, lineHeight: 25 },
});
