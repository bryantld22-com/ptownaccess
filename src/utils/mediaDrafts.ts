import { mediaProjectStatuses, type MediaProjectStatus } from '../data/mediaProjects';

export const MEDIA_DRAFTS_KEY = '@ptown/media-drafts/v1';
export type MediaWorkbookEntry = { checks: string[]; notes: string };
export type MediaDraft = { id: string; title: string; division: string; owner: string; status: MediaProjectStatus; deadline: string; notes: string; updatedAt: string; workbook?: Record<string, MediaWorkbookEntry> };
export function readMediaDrafts(value: string | null): MediaDraft[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error('Invalid drafts');
  return parsed.filter((item): item is MediaDraft => Boolean(item && typeof item === 'object' && typeof (item as MediaDraft).id === 'string' && typeof (item as MediaDraft).title === 'string' && typeof (item as MediaDraft).division === 'string' && typeof (item as MediaDraft).owner === 'string' && mediaProjectStatuses.includes((item as MediaDraft).status) && typeof (item as MediaDraft).deadline === 'string' && typeof (item as MediaDraft).notes === 'string' && typeof (item as MediaDraft).updatedAt === 'string' && validWorkbook((item as MediaDraft).workbook)));
}
function validWorkbook(value: MediaDraft['workbook']) {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every(entry => entry && Array.isArray(entry.checks) && entry.checks.every(check => typeof check === 'string') && typeof entry.notes === 'string' && entry.notes.length <= 1000);
}
export function templateForMediaDraft(draft: MediaDraft) {
  if (draft.status === 'Production') return 'show-rundown';
  if (draft.status === 'Review' || draft.status === 'Approved') return 'approval-record';
  if (draft.status === 'Archived') return 'archive-handoff';
  return 'assignment-brief';
}
export function mediaDraftSummary(draft: MediaDraft) {
  const workbookCount = Object.values(draft.workbook ?? {}).reduce((total, entry) => total + entry.checks.length, 0);
  return ['PTOWN MEDIA GROUP — PRIVATE PRODUCTION DRAFT', '', `Project: ${draft.title}`, `Division: ${draft.division}`, `Owner or responsible role: ${draft.owner}`, `Status: ${draft.status}`, `Deadline or timing: ${draft.deadline || 'Not entered'}`, `Planning notes: ${draft.notes || 'Not entered'}`, `Workbook checks marked: ${workbookCount}`, `Last updated: ${draft.updatedAt}`, '', 'PRIVATE DEVICE DRAFT — Not submitted, shared, assigned, or approved.'].join('\n');
}
export const MAX_MEDIA_DRAFT_TRANSFER = 100000;
export function createMediaDraftTransfer(drafts: MediaDraft[]) { return JSON.stringify({ app: 'PTown Access', type: 'media-drafts', format: 1, drafts }); }
export function readMediaDraftTransfer(value: string): MediaDraft[] {
  if (!value.trim() || value.length > MAX_MEDIA_DRAFT_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid transfer');
  const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; drafts?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'media-drafts' || packet.format !== 1) throw new Error('Invalid transfer');
  const drafts = readMediaDrafts(JSON.stringify(packet.drafts));
  if (!Array.isArray(packet.drafts) || drafts.length !== packet.drafts.length || drafts.length > 100) throw new Error('Invalid transfer');
  const ids = new Set<string>();
  for (const draft of drafts) {
    if (!draft.id || !draft.title.trim() || !draft.owner.trim() || ids.has(draft.id) || draft.title.length > 120 || draft.owner.length > 120 || draft.deadline.length > 120 || draft.notes.length > 1000) throw new Error('Invalid transfer');
    ids.add(draft.id);
  }
  return drafts;
}
