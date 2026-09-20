import type { MediaProjectStatus } from '../data/mediaProjects';

export const MEDIA_DRAFTS_KEY = '@ptown/media-drafts/v1';
export type MediaDraft = { id: string; title: string; division: string; owner: string; status: MediaProjectStatus; deadline: string; notes: string; updatedAt: string };
export function readMediaDrafts(value: string | null): MediaDraft[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error('Invalid drafts');
  return parsed.filter((item): item is MediaDraft => Boolean(item && typeof item === 'object' && typeof (item as MediaDraft).id === 'string' && typeof (item as MediaDraft).title === 'string' && typeof (item as MediaDraft).division === 'string' && typeof (item as MediaDraft).owner === 'string' && typeof (item as MediaDraft).status === 'string' && typeof (item as MediaDraft).deadline === 'string' && typeof (item as MediaDraft).notes === 'string' && typeof (item as MediaDraft).updatedAt === 'string'));
}
export function templateForMediaDraft(draft: MediaDraft) {
  if (draft.status === 'Production') return 'show-rundown';
  if (draft.status === 'Review' || draft.status === 'Approved') return 'approval-record';
  if (draft.status === 'Archived') return 'archive-handoff';
  return 'assignment-brief';
}
export function mediaDraftSummary(draft: MediaDraft) {
  return ['PTOWN MEDIA GROUP — PRIVATE PRODUCTION DRAFT', '', `Project: ${draft.title}`, `Division: ${draft.division}`, `Owner or responsible role: ${draft.owner}`, `Status: ${draft.status}`, `Deadline or timing: ${draft.deadline || 'Not entered'}`, `Planning notes: ${draft.notes || 'Not entered'}`, `Last updated: ${draft.updatedAt}`, '', 'PRIVATE DEVICE DRAFT — Not submitted, shared, assigned, or approved.'].join('\n');
}
