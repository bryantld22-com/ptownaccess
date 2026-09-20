import { readMediaActionTransfer, type MediaAction } from './mediaActions';
import { readMediaDraftTransfer, type MediaDraft } from './mediaDrafts';

export const MAX_MEDIA_BUNDLE_TRANSFER = 200000;
export type MediaBundle = { drafts: MediaDraft[]; actions: MediaAction[] };
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
