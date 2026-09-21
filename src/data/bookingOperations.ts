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
  lastContact?: string;
  nextAction: string;
};

export const artistLeads: ArtistLead[] = [
  { id: 'noah-thompson', name: 'Noah Thompson', genre: 'Country', market: 'Kentucky', recognition: 'American Idol alumnus', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official booking/management', nextAction: 'Verify current representation' },
  { id: 'huntergirl', name: 'HunterGirl', genre: 'Country', market: 'Tennessee', recognition: 'American Idol alumna', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official booking/management', nextAction: 'Verify current representation' },
  { id: 'emily-ann-roberts', name: 'Emily Ann Roberts', genre: 'Country', market: 'Tennessee', recognition: 'The Voice alumna', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official booking/management', nextAction: 'Verify current representation' },
  { id: 'jake-hoot', name: 'Jake Hoot', genre: 'Country', market: 'Tennessee', recognition: 'The Voice alumnus', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official booking/management', nextAction: 'Verify current representation' },
  { id: 'clark-beckham', name: 'Clark Beckham', genre: 'Soul / Pop', market: 'Nashville', recognition: 'American Idol alumnus', feeRange: 'Verify quote', status: 'Identified', contactRoute: 'Official artist/booking channel', nextAction: 'Verify current contact' },
];

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