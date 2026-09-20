import { readArtistProspectActions, type ArtistProspectAction } from './artistProspectActions';
import { readArtistProspects, type ArtistProspect } from './artistProspects';

export const MAX_ARTIST_PROSPECT_BUNDLE = 200000;
export type ArtistProspectBundle = { prospects: ArtistProspect[]; actions: ArtistProspectAction[] };
export function createArtistProspectBundle(bundle: ArtistProspectBundle) { return JSON.stringify({ app: 'PTown Access', type: 'artist-prospect-bundle', format: 1, ...bundle }); }
export function readArtistProspectBundle(value: string): ArtistProspectBundle {
  if (!value.trim() || value.length > MAX_ARTIST_PROSPECT_BUNDLE) throw new Error('Invalid transfer'); const parsed: unknown = JSON.parse(value); if (!parsed || typeof parsed !== 'object') throw new Error('Invalid transfer'); const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; prospects?: unknown; actions?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'artist-prospect-bundle' || packet.format !== 1 || !Array.isArray(packet.prospects) || !Array.isArray(packet.actions)) throw new Error('Invalid transfer'); const prospects = readArtistProspects(JSON.stringify(packet.prospects)); const actions = readArtistProspectActions(JSON.stringify(packet.actions));
  if (prospects.length !== packet.prospects.length || actions.length !== packet.actions.length || prospects.length > 200 || actions.length > 400 || new Set(prospects.map(item => item.id)).size !== prospects.length || new Set(actions.map(item => item.id)).size !== actions.length) throw new Error('Invalid transfer'); return { prospects, actions };
}
