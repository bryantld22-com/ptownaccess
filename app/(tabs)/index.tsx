import { StyleSheet, Text, View } from 'react-native';
import { Body, Button, EventCard, Eyebrow, Footer, Heading, PreviewNotice, Screen, SectionCard, SectionHeader, styles } from '../../src/components/ui';
import { events, featuredEvent } from '../../src/data/events';
import { sections } from '../../src/data/sections';
import { theme } from '../../src/theme';
import { usePreviewStore } from '../../src/state/PreviewStore';
export default function Home() {
  const { ready, savedEventIds, reservationDraft, membershipInterest } = usePreviewStore();
  return <Screen>
    <View style={home.brandRow}><View><Text style={home.brand}>PTOWN<Text style={{ color: theme.colors.gold }}> ACCESS</Text></Text><Text style={home.brandSub}>YOUR ALL ACCESS PASS TO PTOWN</Text></View><View style={home.location}><Text style={home.locationText}>PADUCAH, KY</Text></View></View>
    <View style={home.hero}><Eyebrow>DINNER. A SHOW. A CONNECTION.</Eyebrow><Heading>Come for the evening.{'\n'}Stay for the feeling.</Heading><Body>Live music, memorable food, and a community that moves together. Welcome to PTown Dinner Club.</Body><Button label="Explore the program" href="/events" /><View style={home.heroBottom}><Text style={home.heroTag}>CULTURE · CREATIVITY · COMMUNITY</Text></View></View>
    <PreviewNotice />
    <View style={styles.card}><SectionHeader title="Your saved plans" /><Body>{ready ? `${savedEventIds.length} saved ${savedEventIds.length === 1 ? 'program' : 'programs'}${reservationDraft ? ' · Dinner draft saved' : ''}${membershipInterest ? ' · Membership interest saved' : ''}` : 'Your device’s saved plans will appear here.'}</Body><Button label="Review your plan" href="/plans" secondary /><Button label="Manage saved plans" href="/profile" secondary /></View>
    <SectionHeader title="In the spotlight" href="/events" action="Weekly program" />
    <View style={home.featured}><Eyebrow>THURSDAY · COMEDY</Eyebrow><Text style={home.featureTitle}>A little soul.{'\n'}A lot of laughter.</Text><Body>{featuredEvent.opening} Dinner and comedy follow.</Body><Button label="Discover Comedy Night" href={{ pathname: '/events/[id]', params: { id: featuredEvent.id } }} secondary /></View>
    <SectionHeader title="Your PTown experience" /><View style={styles.grid}>{sections.map(section => <SectionCard key={section.href} {...section} />)}</View>
    <SectionHeader title="Find your rhythm" href="/events" action="See all" />{events.slice(4).map(event => <EventCard key={event.id} event={event} />)}
    <View style={home.mission}><Eyebrow>MORE THAN ENTERTAINMENT</Eyebrow><Text style={home.missionTitle}>Save the Arts.{'\n'}Build a legacy.</Text><Body>Our flagship mission connects creative discovery with opportunity for the next generation.</Body><Button label="Meet the mission" href="/save-the-arts" secondary /></View><Footer />
  </Screen>;
}
const home = StyleSheet.create({
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingVertical: 12 }, brand: { color: theme.colors.cream, fontSize: 21, fontWeight: '800', letterSpacing: 1 }, brandSub: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1.6, marginTop: 6 }, location: { borderWidth: 1, borderColor: theme.colors.border, padding: 10, borderRadius: 30 }, locationText: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1 },
  hero: { backgroundColor: theme.colors.elevated, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, padding: 28, gap: 20 }, heroBottom: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 20 }, heroTag: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1.4, lineHeight: 18 },
  featured: { backgroundColor: '#261E15', borderRadius: 20, padding: 28, gap: 16, borderWidth: 1, borderColor: theme.colors.border }, featureTitle: { color: theme.colors.cream, fontSize: 30, fontWeight: '600', lineHeight: 38 },
  mission: { padding: 28, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, gap: 16, marginTop: 12 }, missionTitle: { color: theme.colors.gold, fontSize: 28, fontWeight: '600', lineHeight: 36 },
});
