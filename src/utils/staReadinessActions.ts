import { staReadinessItems, type StaReadinessRecord } from '../data/staReadiness';

export function staReadinessActions(record: StaReadinessRecord) {
  return staReadinessItems.flatMap(item => {
    const entry = record[item.id];
    if (entry.status === 'Ready for review' && entry.note.trim()) return [];
    return [{
      id: item.id,
      title: item.title,
      status: entry.status,
      action: entry.status === 'Ready for review'
        ? 'Add the location of the material and the person who will review it.'
        : item.cue,
      note: entry.note.trim(),
    }];
  });
}

export function formatStaReadinessActions(record: StaReadinessRecord): string {
  const actions = staReadinessActions(record);
  return [
    'SAVE THE ARTS · PREPARATION FOLLOW-UP DRAFT',
    actions.length ? `${actions.length} area(s) need a next step or a review reference.` : 'All seven areas have a review status and a working note. Verify supporting records with the team.',
    ...actions.flatMap((entry, index) => [
      `${index + 1}. ${entry.title} · ${entry.status}`,
      `Next step: ${entry.action}`,
      `Working note: ${entry.note || 'No note entered'}`,
    ]),
    'Assign owners and dates with the team. This draft does not establish grant eligibility, nonprofit status, or a confirmed meeting.',
  ].join('\n');
}
