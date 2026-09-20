import { mediaProjectStatuses, type MediaProjectStatus } from '../data/mediaProjects';
import { mediaTemplates } from '../data/mediaTemplates';

export const MEDIA_DRAFTS_KEY = '@ptown/media-drafts/v1';
export type MediaWorkbookRecord = { documentName: string; location: string; reviewer: string; reviewedOn: string; statusAtReview?: MediaProjectStatus };
export type MediaWorkbookEntry = { checks: string[]; notes: string; record?: MediaWorkbookRecord };
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
  return Object.values(value).every(entry => entry && Array.isArray(entry.checks) && entry.checks.every(check => typeof check === 'string') && typeof entry.notes === 'string' && entry.notes.length <= 1000 && validRecord(entry.record));
}
function validRecord(record: MediaWorkbookEntry['record']) { return record === undefined || Boolean(record && typeof record.documentName === 'string' && record.documentName.length <= 160 && typeof record.location === 'string' && record.location.length <= 240 && typeof record.reviewer === 'string' && record.reviewer.length <= 120 && typeof record.reviewedOn === 'string' && record.reviewedOn.length <= 40 && (record.statusAtReview === undefined || mediaProjectStatuses.includes(record.statusAtReview))); }
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
const gateStages: Record<MediaProjectStatus, string[]> = {
  Assigned: [],
  'Pre-production': ['assignment-brief'],
  Production: ['assignment-brief', 'rights-checklist'],
  Review: ['assignment-brief', 'rights-checklist'],
  Approved: ['assignment-brief', 'rights-checklist', 'approval-record'],
  Archived: ['assignment-brief', 'rights-checklist', 'approval-record', 'archive-handoff'],
};
export function mediaDraftGates(draft: MediaDraft) {
  const required = gateStages[draft.status];
  return required.map(id => {
    const template = mediaTemplates.find(item => item.id === id)!;
    const marked = draft.workbook?.[id]?.checks.filter(check => template.checks.includes(check)).length ?? 0;
    const recordQuality = mediaRecordQuality(draft, id);
    return { id, title: template.title, marked, total: template.checks.length, complete: marked === template.checks.length, recordComplete: recordQuality.state === 'current', recordQuality };
  });
}
export type MediaRecordQuality = { state: 'missing' | 'incomplete' | 'invalid' | 'stale' | 'current'; issues: string[] };
export function mediaRecordQuality(draft: MediaDraft, stageId: string): MediaRecordQuality {
  const record = draft.workbook?.[stageId]?.record;
  if (!record || ![record.documentName, record.location, record.reviewer, record.reviewedOn].some(value => value.trim())) return { state: 'missing', issues: ['No supporting-record reference is entered.'] };
  const missing = [['document name', record.documentName], ['location or reference', record.location], ['reviewer', record.reviewer], ['review date', record.reviewedOn]].filter(([, value]) => !value.trim()).map(([label]) => `Missing ${label}.`);
  if (missing.length) return { state: 'incomplete', issues: missing };
  if (!realIsoDay(record.reviewedOn)) return { state: 'invalid', issues: ['Review date must be a real date in YYYY-MM-DD format.'] };
  const reviewed = new Date(`${record.reviewedOn}T00:00:00Z`); const today = new Date(); today.setUTCHours(23, 59, 59, 999);
  if (reviewed > today) return { state: 'invalid', issues: ['Review date cannot be in the future.'] };
  const issues: string[] = []; const updatedDay = draft.updatedAt.slice(0, 10);
  if (updatedDay && record.reviewedOn < updatedDay) issues.push('The private draft changed after the entered review date. Re-review the supporting record.');
  if (record.statusAtReview && record.statusAtReview !== draft.status) issues.push(`Draft status changed from ${record.statusAtReview} to ${draft.status} after this record reference was saved.`);
  if (!record.statusAtReview) issues.push('No status-at-review record is available. Save this workbook stage again after review.');
  return issues.length ? { state: 'stale', issues } : { state: 'current', issues: [] };
}
function realIsoDay(value: string) { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); if (!match) return false; const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))); return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3]); }
export function mediaDraftReadiness(draft: MediaDraft) {
  const gates = mediaDraftGates(draft); const recommendation = mediaDraftStageRecommendation(draft);
  const blocked = gates.some(gate => !gate.complete || gate.recordQuality.state !== 'current');
  const recordIssues = gates.reduce((total, gate) => total + gate.recordQuality.issues.length, 0);
  return { blocked, gates, recommendation, recordIssues, timing: mediaDraftTiming(draft.deadline) };
}
export function mediaDraftTiming(value: string) {
  const trimmed = value.trim(); if (!trimmed) return { state: 'missing' as const, label: 'No deadline or timing entered' };
  if (!realIsoDay(trimmed)) return { state: 'descriptive' as const, label: trimmed };
  const today = new Date(); const todayKey = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;
  if (trimmed < todayKey) return { state: 'overdue' as const, label: `${trimmed} has passed` };
  if (trimmed === todayKey) return { state: 'today' as const, label: `${trimmed} is today` };
  return { state: 'upcoming' as const, label: `${trimmed} is upcoming` };
}
export function mediaDraftStageRecommendation(draft: MediaDraft) {
  const order = ['assignment-brief', 'rights-checklist', 'approval-record', 'archive-handoff'];
  for (const id of order) {
    const template = mediaTemplates.find(item => item.id === id)!;
    const marked = draft.workbook?.[id]?.checks.filter(check => template.checks.includes(check)).length ?? 0;
    if (marked < template.checks.length) return { id, title: template.title, remaining: template.checks.length - marked };
  }
  return null;
}
