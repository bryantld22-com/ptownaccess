import { followingWednesday } from './auditionPath';

export type ShowcaseSetSheet = {
  act: string; monday: string; format: string; setList: string; director: string;
  musicians: string; dancers: string; production: string; rehearsal: string;
  callTime: string; recording: string;
};
export function formatShowcaseSetSheet(value: ShowcaseSetSheet): string {
  const wednesday = followingWednesday(value.monday);
  if (!wednesday) throw new Error('A valid Monday date is required');
  return [
    'PTOWN · INVITATION-DEPENDENT SHOWCASE SET SHEET',
    `Act: ${value.act.trim()}`,
    `Proposed Monday audition: ${value.monday}`,
    `Possible Wednesday performance: ${wednesday} (9 days later)`,
    `Performance format and target length: ${value.format.trim()}`,
    `Set or material, order, keys and tempos: ${value.setList.trim()}`,
    `Music director contact plan: ${value.director.trim() || 'To confirm'}`,
    `Musicians and backing tracks: ${value.musicians.trim() || 'To confirm'}`,
    `Dancers and choreography: ${value.dancers.trim() || 'To confirm'}`,
    `Inputs, stage, lighting and video cues: ${value.production.trim() || 'To confirm'}`,
    `Rehearsal or sound-check plan: ${value.rehearsal.trim() || 'To confirm'}`,
    `Call time and changeover: ${value.callTime.trim() || 'To confirm'}`,
    `Recording permissions and media plan: ${value.recording.trim() || 'To confirm'}`,
    'Working draft only. PTown must confirm the invitation, artist acceptance, availability, personnel, rights, and schedule before circulating an official call sheet or promising a stage slot.',
    'Nothing was saved, sent, booked, or approved by this form.',
  ].join('\n');
}
