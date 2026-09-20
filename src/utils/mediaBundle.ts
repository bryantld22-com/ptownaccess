import { readMediaActionTransfer, type MediaAction } from './mediaActions';
import { readMediaDraftTransfer, type MediaDraft } from './mediaDrafts';

export const MAX_MEDIA_BUNDLE_TRANSFER = 200000;
export type MediaBundle = { drafts: MediaDraft[]; actions: MediaAction[] };
export type MediaBundleIssue = { key: string; refId: string; kind: 'duplicate-title' | 'orphaned-action' | 'title-mismatch'; title: string; detail: string };
export function createMediaBundleTransfer(bundle: MediaBundle) { return JSON.stringify({ app: 'PTown Access', type: 'media-group-bundle', format: 1, ...bundle }); }
export function readMediaBundleTransfer(value: string): MediaBundle {
  if (!value.trim() || value.length > MAX_MEDIA_BUNDLE_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(value); if (!parsed || typeof parsed !== 'object') throw new Error('Invalid transfer');
  const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; drafts?: unknown; actions?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'media-group-bundle' || packet.format !== 1 || !Array.isArray(packet.drafts) || !Array.isArray(packet.actions)) throw new Error('Invalid transfer');
  const drafts = readMediaDraftTransfer(JSON.stringify({ app: 'PTown Access', type: 'media-drafts', format: 1, drafts: packet.drafts }));
  const actions = readMediaActionTransfer(JSON.stringify({ app: 'PTown Access', type: 'media-actions', format: 1, actions: packet.actions }));
  return { drafts, actions };
}
export function inspectMediaBundle(bundle: MediaBundle): MediaBundleIssue[] {
  const issues: MediaBundleIssue[] = []; const titleGroups = new Map<string, MediaDraft[]>();
  for (const draft of bundle.drafts) { const key = draft.title.trim().toLocaleLowerCase(); const group = titleGroups.get(key) ?? []; group.push(draft); titleGroups.set(key, group); }
  for (const [normalized, group] of titleGroups) if (group.length > 1) issues.push({ key: `duplicate:${normalized}`, refId: normalized, kind: 'duplicate-title', title: `Duplicate draft title: ${group[0].title}`, detail: `${group.length} incoming drafts use this title. Their IDs remain distinct, but the owner should verify which project each action belongs to.` });
  for (const action of bundle.actions) { const draft = bundle.drafts.find(item => item.id === action.draftId); if (!draft) issues.push({ key: `orphan:${action.id}`, refId: action.id, kind: 'orphaned-action', title: `Unlinked action: ${action.action}`, detail: `The previous draft “${action.draftTitle}” is not included in this bundle.` }); else if (draft.title !== action.draftTitle) issues.push({ key: `mismatch:${action.id}`, refId: action.id, kind: 'title-mismatch', title: `Draft title mismatch: ${action.action}`, detail: `The action says “${action.draftTitle},” while its linked draft is titled “${draft.title}.”` }); }
  return issues;
}
