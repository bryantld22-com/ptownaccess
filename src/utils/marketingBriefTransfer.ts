import { readMarketingBrief, type MarketingBriefRecord } from './marketingBrief';

export const MAX_MARKETING_BRIEF_TRANSFER = 5000;
export function createMarketingBriefTransfer(record: MarketingBriefRecord): string {
  const code = JSON.stringify({ app: 'PTown Access', type: 'marketing-brief-transfer', format: 1, record });
  if (code.length > MAX_MARKETING_BRIEF_TRANSFER) throw new Error('Transfer too large');
  return code;
}
export function readMarketingBriefTransfer(code: string): MarketingBriefRecord {
  if (!code.trim() || code.length > MAX_MARKETING_BRIEF_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(code);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid transfer');
  const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; record?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'marketing-brief-transfer' || packet.format !== 1 || !packet.record) throw new Error('Invalid transfer');
  return readMarketingBrief(JSON.stringify(packet.record));
}
