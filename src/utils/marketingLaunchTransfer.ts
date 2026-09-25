import { readMarketingLaunchReview, type MarketingLaunchReview } from './marketingLaunchReview';

export const MAX_MARKETING_LAUNCH_TRANSFER = 7000;
export function createMarketingLaunchTransfer(record: MarketingLaunchReview): string {
  const code = JSON.stringify({ app: 'PTown Access', type: 'marketing-launch-transfer', format: 1, record });
  if (code.length > MAX_MARKETING_LAUNCH_TRANSFER) throw new Error('Transfer too large');
  return code;
}
export function readMarketingLaunchTransfer(code: string): MarketingLaunchReview {
  if (!code.trim() || code.length > MAX_MARKETING_LAUNCH_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(code);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid transfer');
  const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; record?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'marketing-launch-transfer' || packet.format !== 1 || !packet.record) throw new Error('Invalid transfer');
  const review = readMarketingLaunchReview(JSON.stringify(packet.record));
  if (!review) throw new Error('Invalid transfer');
  return review;
}
