import { readArtistProspectActions, type ArtistProspectAction } from './artistProspectActions';
import { readArtistProspects, type ArtistProspect } from './artistProspects';

export const MAX_ARTIST_PROSPECT_BUNDLE = 200000;
export type ArtistProspectBundle = { prospects: ArtistProspect[]; actions: ArtistProspectAction[] };
export type ArtistProspectBundleIssue = { key: string; refId: string; kind: 'duplicate-name' | 'orphaned-follow-up' | 'name-mismatch'; title: string; detail: string };
export function createArtistProspectBundle(bundle: ArtistProspectBundle) { return JSON.stringify({ app: 'PTown Access', type: 'artist-prospect-bundle', format: 1, ...bundle }); }
export function readArtistProspectBundle(value: string): ArtistProspectBundle {
  if (!value.trim() || value.length > MAX_ARTIST_PROSPECT_BUNDLE) throw new Error('Invalid transfer'); const parsed: unknown = JSON.parse(value); if (!parsed || typeof parsed !== 'object') throw new Error('Invalid transfer'); const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; prospects?: unknown; actions?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'artist-prospect-bundle' || packet.format !== 1 || !Array.isArray(packet.prospects) || !Array.isArray(packet.actions)) throw new Error('Invalid transfer'); const prospects = readArtistProspects(JSON.stringify(packet.prospects)); const actions = readArtistProspectActions(JSON.stringify(packet.actions));
  if (prospects.length !== packet.prospects.length || actions.length !== packet.actions.length || prospects.length > 200 || actions.length > 400 || new Set(prospects.map(item => item.id)).size !== prospects.length || new Set(actions.map(item => item.id)).size !== actions.length) throw new Error('Invalid transfer'); return { prospects, actions };
}
export function inspectArtistProspectBundle(bundle: ArtistProspectBundle): ArtistProspectBundleIssue[] {
  const issues: ArtistProspectBundleIssue[] = []; const names = new Map<string, ArtistProspect[]>(); for (const prospect of bundle.prospects) { const key = prospect.name.trim().toLocaleLowerCase(); const group = names.get(key) ?? []; group.push(prospect); names.set(key, group); }
  for (const [normalized, group] of names) if (group.length > 1) issues.push({ key: `duplicate:${normalized}`, refId: normalized, kind: 'duplicate-name', title: `Duplicate prospect name: ${group[0].name}`, detail: `${group.length} incoming profiles use this name. Their IDs remain distinct, but the owner should verify which prospect each follow-up belongs to.` });
  for (const action of bundle.actions) { const prospect = bundle.prospects.find(item => item.id === action.prospectId); if (!prospect) issues.push({ key: `orphan:${action.id}`, refId: action.id, kind: 'orphaned-follow-up', title: `Unlinked follow-up: ${action.action}`, detail: `The previous prospect “${action.prospectName}” is not included in this transfer.` }); else if (prospect.name !== action.prospectName) issues.push({ key: `mismatch:${action.id}`, refId: action.id, kind: 'name-mismatch', title: `Prospect name mismatch: ${action.action}`, detail: `The follow-up says “${action.prospectName},” while its linked profile is named “${prospect.name}.”` }); }
  return issues;
}
