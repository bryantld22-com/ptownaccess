import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ActionButton } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { mediaProjectStatuses, sampleMediaProjects, type MediaProjectStatus } from '../src/data/mediaProjects';
import { theme } from '../src/theme';

type StatusFilter = 'All statuses' | MediaProjectStatus;
const statuses: StatusFilter[] = ['All statuses', ...mediaProjectStatuses];
const divisions = ['All divisions', ...Array.from(new Set(sampleMediaProjects.map(project => project.division)))];

export default function MediaDashboard() {
  const router = useRouter(); const params = useLocalSearchParams<{ status?: string | string[]; division?: string | string[] }>();
  const routeStatus = statuses.find(item => item === params.status) ?? 'All statuses'; const routeDivision = divisions.find(item => item === params.division) ?? 'All divisions';
  const [status, setStatus] = useState<StatusFilter>('All statuses'); const [division, setDivision] = useState('All divisions');
  useEffect(() => setStatus(routeStatus), [routeStatus]); useEffect(() => setDivision(routeDivision), [routeDivision]);
  const projects = sampleMediaProjects.filter(project => (status === 'All statuses' || project.status === status) && (division === 'All divisions' || project.division === division));
  const cleared = sampleMediaProjects.filter(project => project.rights === 'Cleared').length; const archiveReady = sampleMediaProjects.filter(project => project.archive === 'Ready').length;
  return <Screen><PageHeader eyebrow="PTOWN MEDIA GROUP · PRODUCTION DASHBOARD" title="Know what is moving—and what is not ready." description="Review sample assignments by department, owner, status, deadline, rights clearance, and archive readiness. This preview contains planning examples, not live productions or staff assignments." /><PreviewNotice />
    <View style={styles.grid}><Metric title="Planned items" value={sampleMediaProjects.length} /><Metric title="Rights cleared" value={cleared} /><Metric title="Archive ready" value={archiveReady} /><Metric title="Awaiting final dates" value={sampleMediaProjects.filter(project => /pending|confirmed/i.test(project.deadline)).length} /></View>
    <SectionHeader title="Filter the production board" />
    <Text style={styles.cardTitle}>Status</Text><View accessibilityRole="tablist" accessibilityLabel="Project status" style={styles.grid}>{statuses.map(item => <Filter key={item} label={item} selected={status === item} onPress={() => { setStatus(item); router.setParams({ status: item === 'All statuses' ? undefined : item }); }} />)}</View>
    <Text style={styles.cardTitle}>Division</Text><View accessibilityRole="tablist" accessibilityLabel="Project division" style={styles.grid}>{divisions.map(item => <Filter key={item} label={item} selected={division === item} onPress={() => { setDivision(item); router.setParams({ division: item === 'All divisions' ? undefined : item }); }} />)}</View>
    {(status !== 'All statuses' || division !== 'All divisions') && <ActionButton label="Reset dashboard filters" secondary onPress={() => { setStatus('All statuses'); setDivision('All divisions'); router.setParams({ status: undefined, division: undefined }); }} />}
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{projects.length} of {sampleMediaProjects.length} sample production items</Text>
    {projects.length ? projects.map(project => <View key={project.id} style={styles.card}><Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: '700' }}>{project.status.toUpperCase()} · {project.division.toUpperCase()}</Text><Text style={styles.cardTitle}>{project.title}</Text><Body>{project.description}</Body><Body>Owner: {project.owner}{'\n'}Deadline: {project.deadline}{'\n'}Rights: {project.rights}{'\n'}Archive: {project.archive}</Body><Button label="Open related production template" href={{ pathname: '/media-templates/[id]', params: { id: project.templateId } }} secondary /></View>) : <Card title="No sample items match" description="Choose another status or division, or reset the production-board filters." />}
    <Button label="Open all production templates" href="/media-templates" /><Button label="Open the Media Director Operations Guide" href="/media-group/operations-guide" secondary /><Footer />
  </Screen>;
}
function Metric({ title, value }: { title: string; value: number }) { return <View style={[styles.card, { minWidth: 180, flexGrow: 1 }]}><Text style={{ color: theme.colors.gold, fontSize: 30, fontWeight: '700' }}>{value}</Text><Text style={styles.cardTitle}>{title}</Text></View>; }
function Filter({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} aria-selected={selected} onPress={onPress} style={{ minHeight: 48, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: selected ? theme.colors.gold : theme.colors.surface }}><Text style={{ color: selected ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{label}</Text></Pressable>; }
