export const accessRequestWindows = [
  { id: 'event-shift', title: 'One event or shift', rule: 'Ends when the assigned event or shift ends.' },
  { id: 'short-assignment', title: 'Short assignment', rule: 'Ends on the reviewed project or assignment end date.' },
  { id: 'ongoing', title: 'Ongoing responsibility', rule: 'Requires a scheduled access review and immediate revocation when responsibility changes.' },
] as const;

export type AccessRequestWindowId = typeof accessRequestWindows[number]['id'];

export const accessRequestControls = [
  'Verify identity and the person responsible for approving this role',
  'Limit access to the selected responsibility—no broader role access',
  'Confirm required consent, training, safety, and confidentiality steps',
  'Set an expiration or scheduled review and a revocation trigger',
] as const;
