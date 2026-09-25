export const FRIEND_CIRCLE_KEY = '@ptown/friend-circle/v1';
export type FriendCircleInterest = 'Music' | 'Dinner' | 'Creative' | 'Community';
export const friendCircleInterests: FriendCircleInterest[] = ['Music', 'Dinner', 'Creative', 'Community'];
export type FriendCirclePerson = { id: string; name: string; interest: FriendCircleInterest; idea: string };
export function readFriendCircle(raw: string | null): FriendCirclePerson[] {
  if (raw === null) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length > 25) throw new Error('Invalid friend circle');
  const ids = new Set<string>();
  for (const item of parsed) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid friend circle');
    const person = item as Record<string, unknown>;
    if (Object.keys(person).length !== 4 || typeof person.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(person.id) || ids.has(person.id) || typeof person.name !== 'string' || !person.name.trim() || person.name.length > 60 || typeof person.idea !== 'string' || person.idea.length > 120 || !friendCircleInterests.includes(person.interest as FriendCircleInterest)) throw new Error('Invalid friend circle');
    ids.add(person.id);
  }
  return parsed as FriendCirclePerson[];
}
