import { useEffect, useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { FriendInvitationLinks } from '../src/components/FriendInvitationLinks';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { events } from '../src/data/events';
import { tournamentGames, type TournamentGameId } from '../src/data/tournament';
import { theme } from '../src/theme';

type GameFilter = 'all' | TournamentGameId;

export default function Tournament() {
  const { game } = useLocalSearchParams<{ game?: string | string[] }>();
  const router = useRouter();
  const routeGame = typeof game === 'string' && tournamentGames.some(item => item.id === game) ? game as TournamentGameId : 'all';
  const [selected, setSelected] = useState<GameFilter>('all');
  useEffect(() => { setSelected(routeGame); }, [routeGame]);
  const visible = selected === 'all' ? tournamentGames : tournamentGames.filter(item => item.id === selected);
  const monday = events.find(event => event.id === 'monday-jazz');
  function choose(value: GameFilter) {
    setSelected(value);
    router.setParams({ game: value === 'all' ? undefined : value });
  }

  return <Screen>
    <Stack.Screen options={{ title: 'Monthly Tournament Hub' }} />
    <PageHeader eyebrow="MONDAY AT PTOWN · MONTHLY FEATURE" title="Cards, Dominoes & Chess Tournament" description="Explore the five games planned for PTown’s monthly Monday tournament and follow confirmed details as they are released." />
    <PreviewNotice calendar />
    <Card title="Part of Auditions for PTown" description="The monthly tournament adds a community game-night experience without replacing Monday’s artist and comedian auditions. The room schedule and timing between activities will be announced." />
    <Card title="Free admission · PTown Access check-in planned" description="Monday development nights are planned with free guest admission. PTown Access registration and check-in will be required once enabled. Registration is not open, and viewing this page does not enroll a player, hold a place, or record attendance." />
    <SectionHeader title="Choose a game" />
    <Body>View all five games or focus the hub on one. The selected game stays in the page link so you can return to the same view.</Body>
    <View accessibilityRole="tablist" accessibilityLabel="Tournament games" style={styles.grid}>
      {([{ id: 'all', title: 'All games' }, ...tournamentGames] as { id: GameFilter; title: string }[]).map(item => <Pressable key={item.id} accessibilityRole="tab" aria-selected={selected === item.id} accessibilityState={{ selected: selected === item.id }} onPress={() => choose(item.id)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: selected === item.id ? theme.colors.gold : theme.colors.border, backgroundColor: selected === item.id ? theme.colors.gold : theme.colors.surface }}><Text style={{ color: selected === item.id ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item.title}</Text></Pressable>)}
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{visible.length} of {tournamentGames.length} tournament games shown</Text>
    {visible.map(item => <Card key={item.id} title={item.title} description={`${item.category} · Included in the monthly tournament plan. Game-specific table setup, player or team format, rules, scoring, match order, and time limits will be announced.`} />)}
    <SectionHeader title="Tournament readiness" />
    <Card title="Monthly date and start time" description="To be confirmed. PTown has not published a tournament date, arrival window, start time, or closing time." />
    <Card title="Entry and competition format" description="To be confirmed. Player eligibility, game assignments, table or bracket structure, advancement, tie-breakers, and capacity have not been published." />
    <Card title="Host, sponsor, and prizes" description="A radio-personality host and sponsorship opportunities are planned for development. No host, sponsor, prize, or promotional terms are confirmed." />
    {monday && <FriendInvitationLinks programs={[monday]} />}
    <Button label="Open Auditions for PTown" href="/events/monday-jazz" />
    <Button label="Plan a Monday visit" href={{ pathname: '/visit', params: { day: 'Monday' } }} secondary />
    <Button label="Browse all programs" href="/events" secondary />
    <Footer />
  </Screen>;
}
