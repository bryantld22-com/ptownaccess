import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { mediaGroupDivisions } from '../src/data/mediaGroup';
import { theme } from '../src/theme';
import { MEDIA_PASSPORTS_KEY, readMediaPassports, type MediaPassportDraft } from '../src/utils/mediaPassports';

export default function MediaAcademyDashboard() {
  const router = useRouter();
  const { division: routeDivision } = useLocalSearchParams<{ division?: string | string[] }>();
  const [drafts, setDrafts] = useState<MediaPassportDraft[]>([]);
  const [divisionId, setDivisionId] = useState('all');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => { const value = Array.isArray(routeDivision) ? routeDivision[0] : routeDivision; setDivisionId(mediaGroupDivisions.some(item => item.id === value) ? value! : 'all'); }, [routeDivision]);
  useFocusEffect(useCallback(() => {
    let active = true;
    void AsyncStorage.getItem(MEDIA_PASSPORTS_KEY).then(value => { if (active) { setDrafts(readMediaPassports(value)); setError(false); } }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []));
  const visible = drafts.filter(item => divisionId === 'all' || item.divisionId === divisionId);
  const mentorMissing = drafts.filter(item => !item.mentor.trim());
  const skillCount = drafts.reduce((sum, item) => sum + item.skills.length, 0);
  function choose(id: string) { setDivisionId(id); router.setParams({ division: id === 'all' ? undefined : id }); }
  return <Screen>
    <PageHeader eyebrow="PTOWN MEDIA ACADEMY · BUILD 85" title="See the saved Skills Passport work." description="A device-local planning view of division coverage, portfolio notes, and drafts awaiting a proposed mentor." />
    <PreviewNotice />
    <Card title="Draft evidence, not verified achievement" description="Counts describe entries saved on this device only. Marked skills still need mentor review and verification. This view does not certify training, enroll participants, or promise placement." />
    {!ready ? <Body>Loading saved Skills Passports…</Body> : error ? <Card title="Passport data unavailable" description="Saved drafts could not be read. Existing device data was not changed." /> : <>
      <SectionHeader title="At a glance" />
      <View style={styles.grid}>
        <Metric label="Saved drafts" value={drafts.length} />
        <Metric label="Skills with evidence noted" value={skillCount} />
        <Metric label="Mentor to propose" value={mentorMissing.length} />
        <Metric label="Divisions represented" value={new Set(drafts.map(item => item.divisionId)).size} />
      </View>
      <SectionHeader title="By Media Group division" />
      {mediaGroupDivisions.map(division => {
        const group = drafts.filter(item => item.divisionId === division.id);
        return <Card key={division.id} title={`${division.title} · ${group.length}`} description={`${group.reduce((sum, item) => sum + item.skills.length, 0)} skills with evidence noted · ${group.filter(item => !item.mentor.trim()).length} drafts without a proposed mentor`} />;
      })}
      <SectionHeader title="Review saved drafts" />
      <View accessibilityRole="tablist" accessibilityLabel="Filter Skills Passports by division" style={styles.grid}>
        {[{ id: 'all', title: 'All divisions' }, ...mediaGroupDivisions].map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: divisionId === item.id }} onPress={() => choose(item.id)} style={{ minHeight: 44, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 22, backgroundColor: divisionId === item.id ? theme.colors.gold : theme.colors.surface }}><Text style={{ color: divisionId === item.id ? theme.colors.background : theme.colors.cream }}>{item.title}</Text></Pressable>)}
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{visible.length} of {drafts.length} saved drafts shown</Text>
      {visible.length ? visible.map(item => <View key={item.id} style={styles.card}>
        <Text style={styles.cardTitle}>{item.participant}</Text>
        <Body>{mediaGroupDivisions.find(value => value.id === item.divisionId)?.title}{'\n'}{item.skills.length} skills with evidence noted · {item.mentor.trim() ? `Proposed mentor: ${item.mentor}` : 'Mentor to propose'}{'\n'}Last edited: {item.updatedAt.slice(0, 10)}</Body>
        <Button label={`Open ${item.participant} Skills Passport`} href={{ pathname: '/media-passport', params: { draft: item.id } }} secondary />
      </View>) : <Card title="No drafts in this view" description="Choose another division or create a Skills Passport draft." />}
    </>}
    <Button label="Create or edit Skills Passports" href="/media-passport" />
    <Button label="Back up saved Skills Passports" href="/media-passport-backup" secondary />
    <Button label="Return to PTown Media Group" href="/media-group" secondary /><Footer />
  </Screen>;
}
function Metric({ label, value }: { label: string; value: number }) { return <View style={[styles.card, { minWidth: 150, flexGrow: 1 }]}><Text style={{ color: theme.colors.gold, fontSize: 28, fontWeight: '700' }}>{value}</Text><Text style={styles.cardTitle}>{label}</Text></View>; }
