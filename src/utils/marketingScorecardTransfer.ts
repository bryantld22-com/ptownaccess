import { readMarketingScorecardPlan, type MarketingScorecardPlan } from './marketingScorecardPlan';

export const MAX_MARKETING_SCORECARD_TRANSFER = 2000;
export function createMarketingScorecardTransfer(record: MarketingScorecardPlan): string {
  const validated = readMarketingScorecardPlan(JSON.stringify(record));
  if (!validated) throw new Error('Invalid scorecard');
  const code = JSON.stringify({ app: 'PTown Access', type: 'marketing-scorecard-transfer', format: 1, record: validated });
  if (code.length > MAX_MARKETING_SCORECARD_TRANSFER) throw new Error('Transfer too large');
  return code;
}
export function readMarketingScorecardTransfer(code: string): MarketingScorecardPlan {
  if (!code.trim() || code.length > MAX_MARKETING_SCORECARD_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(code);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid transfer');
  const packet = parsed as Record<string, unknown>;
  if (Object.keys(packet).length !== 4 || packet.app !== 'PTown Access' || packet.type !== 'marketing-scorecard-transfer' || packet.format !== 1 || !packet.record) throw new Error('Invalid transfer');
  const record = readMarketingScorecardPlan(JSON.stringify(packet.record));
  if (!record) throw new Error('Invalid transfer');
  return record;
}
