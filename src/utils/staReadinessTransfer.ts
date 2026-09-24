import { readStaReadiness } from './staReadiness';
import type { StaReadinessRecord } from '../data/staReadiness';
export const MAX_STA_READINESS_TRANSFER = 10000;
export function createStaReadinessTransfer(record: StaReadinessRecord): string {
  const code = JSON.stringify({ app: 'PTown Access', type: 'sta-preparation-transfer', format: 1, record });
  if (code.length > MAX_STA_READINESS_TRANSFER) throw new Error('Transfer too large');
  return code;
}
export function readStaReadinessTransfer(code: string): StaReadinessRecord {
  if (!code.trim() || code.length > MAX_STA_READINESS_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(code);
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid transfer');
  const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; record?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'sta-preparation-transfer' || packet.format !== 1 || !packet.record) throw new Error('Invalid transfer');
  return readStaReadiness(JSON.stringify(packet.record));
}
