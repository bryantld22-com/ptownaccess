import { View } from 'react-native';
import type { ProgramEvent } from '../types';
import { Body, Button, SectionHeader, styles } from './ui';

export function FriendInvitationLinks({ programs }: { programs: ProgramEvent[] }) {
  if (!programs.length) return null;
  return <View style={styles.card}>
    <SectionHeader title="Plan with friends" />
    <Body>Start a Friend 2 Friend invitation from this proposed program. Only the program choice carries over—dates, group size, notes, and saved dinner plans stay separate.</Body>
    {programs.map(program => <Button key={program.id} label={`Invite friends to ${program.title}`} href={{ pathname: '/friends', params: { program: program.id } }} secondary />)}
    <Body>This opens a planning preview. It does not contact anyone, reserve admission, or record an RSVP.</Body>
  </View>;
}
