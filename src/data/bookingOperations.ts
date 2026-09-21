export type PipelineStatus = 'Identified' | 'Contacted' | 'Warm' | 'Negotiating' | 'Booked' | 'Nurture';

export type ArtistLead = {
  id: string;
  name: string;
  genre: string;
  market: string;
  recognition?: string;
  feeRange: string;
  status: PipelineStatus;
  contactRoute: string;
  contactVerified: boolean;
  contactSource: string;
  contactVerifiedOn?: string;
  lastContact?: string;
  followUpDate?: string;
  nextAction: string;
  notes: string;
  feeHistory: { date: string; quote: string; source: string }[];
  showHistory: { date: string; event: string; result: string }[];
  contractStatus: 'Not started' | 'Drafting' | 'Sent' | 'Signed';
  paymentStatus: 'Not started' | 'Deposit due' | 'Deposit paid' | 'Paid in full';
};

export const artistLeads: ArtistLead[] = [
  { id: 'noah-thompson', name: 'Noah Thompson', genre: 'Country', market: 'Kentucky', recognition: 'American Idol alumnus', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official booking/management', contactVerified: false, contactSource: 'Pending official-source verification', nextAction: 'Verify current representation', notes: 'Potential fit for Saturday Any Genre and regional Kentucky marketing.', feeHistory: [], showHistory: [], contractStatus: 'Not started', paymentStatus: 'Not started' },
  { id: 'huntergirl', name: 'HunterGirl', genre: 'Country', market: 'Tennessee', recognition: 'American Idol alumna', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official booking/management', contactVerified: false, contactSource: 'Pending official-source verification', nextAction: 'Verify current representation', notes: 'Evaluate routing opportunities from Nashville into Paducah.', feeHistory: [], showHistory: [], contractStatus: 'Not started', paymentStatus: 'Not started' },
  { id: 'emily-ann-roberts', name: 'Emily Ann Roberts', genre: 'Country', market: 'Tennessee', recognition: 'The Voice alumna', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official booking/management', contactVerified: false, contactSource: 'Pending official-source verification', nextAction: 'Verify current representation', notes: 'Strong Saturday Any Genre prospect; verify room-size fit and routing.', feeHistory: [], showHistory: [], contractStatus: 'Not started', paymentStatus: 'Not started' },
  { id: 'jake-hoot', name: 'Jake Hoot', genre: 'Country', market: 'Tennessee', recognition: 'The Voice alumnus', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official booking/management', contactVerified: false, contactSource: 'Pending official-source verification', nextAction: 'Verify current representation', notes: 'Consider for a cross-generational Saturday headline program.', feeHistory: [], showHistory: [], contractStatus: 'Not started', paymentStatus: 'Not started' },
  { id: 'clark-beckham', name: 'Clark Beckham', genre: 'Soul / Pop', market: 'Nashville', recognition: 'American Idol alumnus', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official artist/booking channel', contactVerified: false, contactSource: 'Pending official-source verification', nextAction: 'Verify current contact', notes: 'Possible Friday R&B/Blues or Saturday Any Genre fit.', feeHistory: [], showHistory: [], contractStatus: 'Not started', paymentStatus: 'Not started' },
];

export function getArtistLead(id: string) {
  return artistLeads.find(artist => artist.id === id);
}

export const weeklyProgramming = [
  { day: 'Mon', program: 'House Jazz', booking: 'House / community' },
  { day: 'Tue', program: 'Musician Jam Session', booking: 'Musicians / guests' },
  { day: 'Wed', program: 'PTown Flow Practice', booking: 'Program night' },
  { day: 'Thu', program: 'Comedy', booking: 'Ticketed' },
  { day: 'Fri', program: 'R&B / Blues', booking: 'Ticketed' },
  { day: 'Sat', program: 'Any Genre', booking: 'Ticketed' },
  { day: 'Sun', program: 'Communion Sunday', booking: 'Gospel Jazz / brunch' },
];

export const outreachSequence = [
  { step: 1, label: 'Initial inquiry', timing: 'Day 0', rule: 'Draft for approval before first send' },
  { step: 2, label: 'First follow-up', timing: 'Day 3', rule: 'Only when no reply is logged' },
  { step: 3, label: 'Second follow-up', timing: 'Day 10', rule: 'Only when no reply is logged' },
  { step: 4, label: 'Nurture', timing: 'Day 21', rule: 'Stop sequence and move to future-date nurture' },
];
