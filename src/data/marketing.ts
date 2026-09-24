export const marketingFunctions = [
  { title: 'Brand & Creative', description: 'Own PTown identity, voice, design standards, campaign briefs, and approvals across venue, website, app, print, and merchandise.' },
  { title: 'Digital Marketing', description: 'Own website and app discovery, email and opt-in journeys, paid campaigns, landing pages, analytics, and conversion reporting.' },
  { title: 'Event Marketing', description: 'Build program-specific campaigns for auditions, jam sessions, comedy, ticketed nights, tournaments, brunch, and special events.' },
  { title: 'Community & Street Marketing', description: 'Coordinate local hosts, neighborhood partners, flyers, pop-ups, campuses, and referral activity in Paducah and the region.' },
  { title: 'Partnerships & Sponsorship', description: 'Package sponsor opportunities, track deliverables, support tourism relationships, and report documented outcomes.' },
] as const;

export const marketingPhases = [
  { title: 'Months 1–3 · Foundation', description: 'Confirm audience segments, brand kit, venue story, consent-based contact capture, baseline budget, and measurement definitions.' },
  { title: 'Months 4–6 · Community proof', description: 'Introduce artists and departments, build the regional partner map, test content themes, and grow opt-in interest by program.' },
  { title: 'Months 7–9 · Launch preparation', description: 'Prepare event campaign briefs, creative assets, sponsor placements, staff scripts, media calendar, and reservation and ticket paths.' },
  { title: 'Months 10–12 · Launch & learning', description: 'Publish only confirmed dates and offers, monitor attendance and conversion, fulfill partner commitments, and revise the next quarter.' },
] as const;

export const marketingCampaigns = [
  { month: 1, title: 'Brand foundation', channel: 'Brand & Creative', action: 'Approve identity, message guide, image standards, and asset inventory.', measure: 'Approved brand kit and asset owner.' },
  { month: 2, title: 'Audience discovery', channel: 'Digital Marketing', action: 'Interview guests and artists; define local, regional, visitor, and VIP audience segments.', measure: 'Segment profiles and baseline awareness.' },
  { month: 3, title: 'Opt-in design', channel: 'Digital Marketing', action: 'Map consent language, preference categories, welcome messages, and contact stewardship.', measure: 'Approved consent and measurement specification.' },
  { month: 4, title: 'Meet the artists', channel: 'Event Marketing', action: 'Prepare an auditions-to-Wednesday artist story series, subject to consent and confirmed programming.', measure: 'Qualified artist inquiries and content engagement.' },
  { month: 5, title: 'Neighborhood connections', channel: 'Community & Street Marketing', action: 'Build a Paducah partner and street-team calendar with tracked referrals.', measure: 'Partner participation and referral interest.' },
  { month: 6, title: 'Regional reach', channel: 'Partnerships & Sponsorship', action: 'Prepare regional tourism, hospitality, and sponsor introductions with specific benefits.', measure: 'Qualified partner conversations and proposals.' },
  { month: 7, title: 'Weekly program stories', channel: 'Event Marketing', action: 'Build distinct campaign briefs for jam sessions, comedy, R&B, any-genre Saturday, and brunch.', measure: 'Program-page visits and interested guests.' },
  { month: 8, title: 'Ticket path review', channel: 'Digital Marketing', action: 'Test program discovery through confirmed ticket, dinner, or reservation calls to action.', measure: 'Page-to-action conversion and abandoned steps.' },
  { month: 9, title: 'Launch creative', channel: 'Brand & Creative', action: 'Approve photo, video, print, radio, and social assets with Media Group production handoffs.', measure: 'Approved assets delivered by deadline.' },
  { month: 10, title: 'Opening campaign', channel: 'Event Marketing', action: 'Release confirmed dates, admission, food details, accessibility, and arrival guidance.', measure: 'Verified attendance, cost per response, and guest feedback.' },
  { month: 11, title: 'Return visit', channel: 'Digital Marketing', action: 'Invite opted-in guests to relevant upcoming programs and gather respectful feedback.', measure: 'Repeat visits and opt-out rate.' },
  { month: 12, title: 'Year-one review', channel: 'Partnerships & Sponsorship', action: 'Report campaign results, sponsor fulfillment, lessons, and next-year priorities.', measure: 'Documented outcomes and approved next-quarter budget.' },
] as const;

export const marketingFunnel = [
  { stage: 'Discover', signal: 'Campaign reach and referral source', decision: 'Which audiences and channels produce qualified interest?' },
  { stage: 'Explore', signal: 'Program-page views and useful actions', decision: 'Do guests understand the experience, timing, food, and accessibility?' },
  { stage: 'Opt in', signal: 'Consent-based preferences and confirmed subscriptions', decision: 'Are people choosing relevant updates with clear consent?' },
  { stage: 'Attend', signal: 'Verified check-ins, tickets, or reservations when enabled', decision: 'Does interest become attendance at a sustainable cost?' },
  { stage: 'Return', signal: 'Repeat attendance, feedback, and referrals', decision: 'Which experiences bring guests back and earn recommendations?' },
] as const;
