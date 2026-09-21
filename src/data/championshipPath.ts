import type { SectionIconName } from '../components/SectionIcon';

export type ChampionshipFocus = {
  id: 'season' | 'funding' | 'chess' | 'media';
  label: string;
  title: string;
  icon: SectionIconName;
  summary: string;
  build: readonly string[];
  safeguards: readonly string[];
  pending: string;
};

export const championshipFocuses = [
  {
    id: 'season',
    label: 'Quarterly season',
    title: 'Quarterly competition path',
    icon: 'trophy-outline',
    summary: 'Use four well-run PTown events to turn neighborhood play into a clear season, verified standings, and a credible championship opportunity.',
    build: [
      'Publish one season calendar with registration windows, capacity, check-in, and accessibility information before entries open.',
      'Run Spades, Bid Whist, and Dominoes as the core championship divisions; keep Hearts available as a community exhibition unless PTown later approves a formal division.',
      'Award points under one published system at each quarterly stop, then post reviewed standings and corrections on a stated schedule.',
      'Advance eligible leaders to a PTown Grand Championship or an approved external event only after qualification and invitation requirements are verified.',
    ],
    safeguards: [
      'Publish game rules, team or player format, scoring, tie-breakers, conduct, dispute review, and late-arrival policy before registration.',
      'Separate the tournament director, score verification, and final dispute decision whenever staffing permits.',
      'Never describe an interest, invitation, saved plan, or unverified result as registration, qualification, or a championship berth.',
    ],
    pending: 'No quarterly dates, registration window, points table, standings, qualifiers, or championship berths are active in this preview.',
  },
  {
    id: 'funding',
    label: 'Entry & sponsors',
    title: 'Sponsor-first funding',
    icon: 'megaphone-outline',
    summary: 'Launch with sponsors carrying the event and travel award so participation stays accessible and the prize promise never depends on last-minute entry revenue.',
    build: [
      'Offer presenting, division, broadcast, hospitality, and travel-partner packages with specific benefits and sponsor-disclosure rules.',
      'Ring-fence committed travel support and define what the award covers: destination, transport, lodging, meals, eligibility, taxes, substitutions, and cancellation.',
      'Use free preregistration for the first season when sponsorship covers delivery; add only a modest published fee later if verified operating costs require it.',
      'If a fee is introduced, disclose its use, refund and transfer policy, deadlines, and any distinction between venue admission, competitor registration, prizes, and travel support.',
    ],
    safeguards: [
      'Obtain Kentucky legal, tax, accounting, insurance, and venue review before collecting fees or advertising a prize or sponsored trip.',
      'Do not promise that entry fees fund a prize pool or trip unless counsel has approved the structure and the money is already controlled as disclosed.',
      'Confirm sponsor funds and written award terms before promotion; prepare a fair replacement or cancellation process.',
    ],
    pending: 'No registration fee, sponsor, prize, cash value, trip, destination, or travel coverage is confirmed or offered here.',
  },
  {
    id: 'chess',
    label: 'Chess hub',
    title: 'Official chess hub path',
    icon: 'extension-puzzle-outline',
    summary: 'Build a welcoming local chess home first, then seek the affiliation, officials, equipment, and reporting required to send qualified contenders onward.',
    build: [
      'Identify the appropriate local, state, and national chess organizations and compare club, affiliate, rated-event, and championship requirements.',
      'Recruit or train the required tournament director or arbiter and document clocks, boards, pairings, ratings, anti-cheating, appeals, and result-submission procedures.',
      'Separate community learning events from rated or sanctioned competition so every player knows which rules and credentials apply.',
      'Send contenders to outside championships only after PTown verifies eligibility, qualification, registration, travel terms, and the receiving event’s acceptance.',
    ],
    safeguards: [
      'Do not use “official,” “sanctioned,” “rated,” “qualifier,” or an organization’s marks until written status permits it.',
      'Publish age, rating, residency, membership, equipment, notation, conduct, and appeal requirements for each chess event.',
      'Keep coaching, selection, pairing, adjudication, and travel-award decisions reviewable and free of undisclosed conflicts.',
    ],
    pending: 'PTown is not represented here as an affiliated chess club, sanctioned tournament site, rated-event organizer, or championship qualifier.',
  },
  {
    id: 'media',
    label: 'Film & broadcast',
    title: 'Film and broadcast plan',
    icon: 'videocam-outline',
    summary: 'Treat every tournament as a media property with participant dignity, competition integrity, sponsor transparency, and reusable PTown storytelling built in.',
    build: [
      'Create a production rundown for live hosting, table coverage, interviews, score updates, sponsor moments, highlights, captions, and the final archive.',
      'Use clear registration-time and on-site notices for filming zones, interview choices, participant releases, and guardian consent when minors may appear.',
      'Package short highlights, winner stories, standings recaps, and the road-to-championship series for PTown channels and approved media partners.',
      'Track audience reach, registrations attributable to promotion, sponsor delivery, watch time, reusable clips, and community impact after each event.',
    ],
    safeguards: [
      'Protect private conversations, score sheets, contact information, minors, and anyone who has not granted the required permission.',
      'Position cameras and crews so they do not reveal protected information, coach players, distract tables, or compromise anti-cheating controls.',
      'Clear music, logos, likeness, clips, commentary, sponsor disclosures, corrections, accessibility, and archive rights before release.',
    ],
    pending: 'No livestream, recording consent, media partner, sponsor inventory, distribution channel, or participant release is active through this page.',
  },
] as const satisfies readonly ChampionshipFocus[];

export type ChampionshipFocusId = typeof championshipFocuses[number]['id'];

export const championshipLaunchSequence = [
  'Approve the game rules, season structure, legal review, and event budget.',
  'Secure sponsors and fully document the travel award before promoting it.',
  'Confirm chess affiliation steps, officials, venue capacity, and equipment.',
  'Publish the calendar, eligibility, registration policy, consent choices, and code of conduct.',
  'Run each event, verify results, publish corrections, deliver sponsor reports, and review the next quarter.',
] as const;
