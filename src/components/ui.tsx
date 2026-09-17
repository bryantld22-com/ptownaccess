import { useEffect, useState, type PropsWithChildren } from 'react';
import { Link, type Href } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { isPastDate } from '../utils/programDay';
import type { ProgramEvent } from '../types';
import { usePreviewStore } from '../state/PreviewStore';
import { QuickNavigation } from './QuickNavigation';
import { PageLocation } from './PageLocation';
import { SectionIcon, type SectionIconName } from './SectionIcon';

const c = theme.colors;
export function Screen({ children }: PropsWithChildren) {
  const { storageError } = usePreviewStore();
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}><QuickNavigation /><ScrollView contentContainerStyle={styles.scroll}><View style={styles.container}><PageLocation />{storageError && <View style={styles.notice}><Text accessibilityRole="alert" style={styles.noticeText}>{storageError}</Text><Link href="/profile" style={styles.textLink}>Open Profile →</Link></View>}{children}</View></ScrollView></SafeAreaView>;
}
export function Eyebrow({ children }: PropsWithChildren) { return <Text style={styles.eyebrow}>{children}</Text>; }
export function Heading({ children }: PropsWithChildren) { return <Text accessibilityRole="header" style={styles.heading}>{children}</Text>; }
export function Body({ children }: PropsWithChildren) { return <Text style={styles.body}>{children}</Text>; }
export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <View style={styles.pageHeader}><Eyebrow>{eyebrow}</Eyebrow><Heading>{title}</Heading>{description && <Body>{description}</Body>}</View>;
}
export function SectionHeader({ title, href, action = 'Explore' }: { title: string; href?: Href; action?: string }) {
  return <View style={styles.sectionHeader}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>{href && <Link href={href} style={styles.textLink}>{action} →</Link>}</View>;
}
export function Button({ label, href, secondary = false }: { label: string; href: Href; secondary?: boolean }) {
  return <Link href={href} asChild><Pressable accessibilityRole="link" android_ripple={{ color: c.border }} style={StyleSheet.flatten([styles.button, secondary && styles.secondaryButton])}><Text style={[styles.buttonText, secondary && { color: c.cream }]}>{label} →</Text></Pressable></Link>;
}
export function Card({ title, description }: { title: string; description: string }) {
  return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text><Body>{description}</Body></View>;
}
export function DraftDateNotice({ date }: { date: string }) {
  return isPastDate(date) ? <View style={styles.notice}><Body>This preferred date has passed. Update your dinner draft.</Body><Button label="Update dinner draft" href="/reservations" secondary /></View> : null;
}
export function PreviewNotice({ calendar = false }: { calendar?: boolean }) {
  return <View style={styles.notice}><Text style={styles.noticeText}>{calendar ? 'SAMPLE PROGRAM · Proposed weekly schedule. Dates, artists, and ticket prices are not confirmed.' : 'APP PREVIEW · Explore PTown’s planned experience. Bookings, purchases, and enrollment are not open.'}</Text></View>;
}
export function SectionCard({ title, subtitle, href, icon }: { title: string; subtitle: string; href: Href; icon: SectionIconName }) {
  const { width } = useWindowDimensions();
  const [layoutReady, setLayoutReady] = useState(Platform.OS !== 'web');
  useEffect(() => { setLayoutReady(true); }, []);
  return <Link href={href} asChild><Pressable accessibilityRole="link" android_ripple={{ color: c.border }} style={StyleSheet.flatten([styles.sectionCard, { width: !layoutReady || width < 600 ? '100%' : width >= 900 ? '23.5%' : '48%' }])}>
    <View style={styles.sectionCardTop}><SectionIcon name={icon} /><Text style={styles.arrow}>↗</Text></View>
    <Text style={styles.cardTitle}>{title}</Text><Text style={styles.smallBody}>{subtitle}</Text>
  </Pressable></Link>;
}
export function EventCard({ event }: { event: ProgramEvent }) {
  const { savedEventIds } = usePreviewStore();
  return <Link href={{ pathname: '/events/[id]', params: { id: event.id } }} asChild><Pressable accessibilityRole="link" android_ripple={{ color: c.border }} style={styles.eventCard}>
    <View style={styles.dayBlock}><Text style={styles.dayText}>{event.day.slice(0, 3).toUpperCase()}</Text><Text style={styles.daySubtext}>Weekly</Text></View>
    <View style={{ flex: 1, gap: 5 }}><Text style={styles.cardTitle}>{event.title}</Text><Text style={styles.smallBody}>{event.category} · {event.admission}</Text>{savedEventIds.includes(event.id) && <Text style={{ color: c.gold, fontSize: 12 }}>Saved on this device</Text>}</View><Text style={styles.arrow}>→</Text>
  </Pressable></Link>;
}
export function Footer() { return <View style={styles.footer}><Text style={styles.footerBrand}>PTOWN DINNER CLUB</Text><Text style={styles.smallBody}>Paducah, Kentucky · Excellence Earns Trust.</Text></View>; }
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: 36 }, container: { width: '100%', maxWidth: 1100, alignSelf: 'center', padding: 20, gap: 20 },
  eyebrow: { color: c.gold, fontSize: 11, letterSpacing: 2.4, fontWeight: '700', lineHeight: 19 },
  heading: { color: c.cream, fontSize: 36, fontWeight: '600', lineHeight: 44, letterSpacing: -1 },
  body: { color: c.muted, fontSize: 16, lineHeight: 25 }, smallBody: { color: c.muted, fontSize: 13, lineHeight: 20 },
  pageHeader: { gap: 12, paddingVertical: 12 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  sectionTitle: { color: c.cream, fontSize: 23, fontWeight: '600' }, textLink: { color: c.gold, fontSize: 14, paddingVertical: 12 },
  button: { backgroundColor: c.gold, minHeight: 48, paddingVertical: 15, paddingHorizontal: 20, borderRadius: theme.radius.button, alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: c.gold },
  buttonText: { color: c.background, fontSize: 15, fontWeight: '700' }, secondaryButton: { backgroundColor: 'transparent', borderColor: c.border },
  card: { backgroundColor: c.surface, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: c.border, gap: 10 }, cardTitle: { color: c.cream, fontSize: 18, fontWeight: '600', lineHeight: 25 },
  notice: { backgroundColor: c.elevated, padding: 16, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: c.gold }, noticeText: { color: c.muted, fontSize: 12, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, sectionCard: { backgroundColor: c.surface, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: c.border, gap: 8 },
  sectionCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 }, arrow: { color: c.gold, fontSize: 20 },
  eventCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 16, alignItems: 'center' },
  dayBlock: { backgroundColor: c.elevated, padding: 12, borderRadius: 12, alignItems: 'center', minWidth: 65, gap: 4 }, dayText: { color: c.gold, fontSize: 14, fontWeight: '700' }, daySubtext: { color: c.muted, fontSize: 10 },
  footer: { gap: 8, paddingTop: 26, marginTop: 12, borderTopWidth: 1, borderTopColor: c.border }, footerBrand: { color: c.gold, fontSize: 12, letterSpacing: 2, fontWeight: '700' },
});
