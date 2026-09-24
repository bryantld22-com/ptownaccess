export const marketingRoles = [
  { role: 'Marketing director', accountable: 'Department plan, audience priorities, campaign budget, approvals, and monthly performance review.' },
  { role: 'Brand & creative lead', accountable: 'Voice, visual standards, creative briefs, asset inventory, and final brand quality review.' },
  { role: 'Digital & analytics lead', accountable: 'Website and app paths, consent-based contact journeys, tracking definitions, and reporting.' },
  { role: 'Event campaign lead', accountable: 'Program-specific briefs, confirmed details, launch dates, venue coordination, and guest guidance.' },
  { role: 'Community lead', accountable: 'Local activations, street teams, radio hosts, partner referrals, and accessible outreach.' },
  { role: 'Sponsorship lead', accountable: 'Sponsor packages, written deliverables, approvals, fulfillment evidence, and renewal review.' },
] as const;

export const campaignSteps = [
  { title: '1. Brief', detail: 'Name the audience, objective, program, owner, dates, offer, budget ceiling, channels, needed assets, consent requirements, and success measure.' },
  { title: '2. Verify', detail: 'Confirm event date and capacity, performer permissions, menu and price claims, ticket or reservation path, accessibility details, and sponsor obligations.' },
  { title: '3. Produce', detail: 'Request Media Group production through a shared brief. Keep its editorial decisions and rights review with its own leadership.' },
  { title: '4. Approve', detail: 'Brand reviews presentation; program owner verifies facts; legal or finance reviews claims where needed; marketing director authorizes timing and spend.' },
  { title: '5. Publish', detail: 'Use approved assets and tracked links, record versions and channel owners, and retain a correction and cancellation path.' },
  { title: '6. Measure', detail: 'Compare reach, qualified interest, attendance, return visits, cost, feedback, and sponsor fulfillment against the brief.' },
] as const;

export const budgetLines = [
  'Brand identity and creative production',
  'Website, app, analytics, and accessibility',
  'Paid placement by campaign and channel',
  'Print, signage, and street activation',
  'Event launches and community partnerships',
  'Photography, video, rights, and licensing',
  'Staff, contractors, training, and contingency',
] as const;
