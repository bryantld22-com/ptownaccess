import type { SectionIconName } from '../components/SectionIcon';

export type InvestorAccessTier = {
  id: string;
  title: string;
  level: 'Published' | 'Controlled' | 'Protected' | 'Exceptional';
  icon: SectionIconName;
  summary: string;
  materials: string[];
  requirements: string[];
  deniedByDefault: string[];
};

export const investorAccessTiers = [
  {
    id: 'public-overview',
    title: 'Public Overview',
    level: 'Published',
    icon: 'globe-outline',
    summary: 'Introduce PTown’s mission, venue concept, programs, and community purpose using only information approved for public release.',
    materials: [
      'PTown mission, venue concept, and community purpose',
      'Published program, division, and leadership overview',
      'Nonconfidential investment introduction and controlled contact path',
    ],
    requirements: [
      'Use only materials PTown has approved for public release',
      'Make clear that viewing information does not create investor status',
      'Direct serious interest to a controlled review process',
    ],
    deniedByDefault: [
      'Detailed forecasts, capitalization records, bank records, or tax records',
      'Nonpublic leases, contracts, personal contacts, or internal discussions',
      'Credentials, administrative tools, or data-room links',
    ],
  },
  {
    id: 'prospective',
    title: 'Prospective Investor',
    level: 'Controlled',
    icon: 'search-circle-outline',
    summary: 'Support serious early due diligence with a controlled Executive Investors Edition after identity, interest, confidentiality, and owner review.',
    materials: [
      'Executive summary and controlled capital-raise overview',
      'High-level use of funds, projections, risks, and facility roadmap',
      'Selected team, market, operating-model, and community-impact materials',
    ],
    requirements: [
      'Verify identity, contact information, and serious investment interest',
      'Accept required confidentiality terms before protected materials',
      'Receive owner-approved, time-limited access for a defined purpose',
      'Record the grant, scope, and expiration in a future live system',
    ],
    deniedByDefault: [
      'Bank statements, tax returns, account numbers, or credentials',
      'Full capitalization table, executed agreements, or unrestricted data-room access',
      'Personal, staff, artist, medical, or unrelated operating records',
    ],
  },
  {
    id: 'approved-active',
    title: 'Approved / Active Investor',
    level: 'Protected',
    icon: 'briefcase-outline',
    summary: 'Provide only the detailed records needed by a verified active investor or formally approved due-diligence participant.',
    materials: [
      'Approved detailed pro forma and due-diligence package',
      'Relevant capitalization, agreement, and ownership documents',
      'Construction, licensing, operating, and milestone updates',
      'Approved investor communications and meeting records',
    ],
    requirements: [
      'Verify active investor or formally approved due-diligence status',
      'Complete required confidentiality, NDA, and securities documents',
      'Grant only the folders or documents needed for the approved review',
      'Review, audit, expire, and revoke access when status or need changes',
    ],
    deniedByDefault: [
      'Documents outside the investor’s approved transaction or responsibility',
      'Other investors’ personal records or private communications',
      'Credentials, unrestricted exports, or administrative controls',
    ],
  },
  {
    id: 'document-specific',
    title: 'Document-Specific Permission',
    level: 'Exceptional',
    icon: 'lock-closed-outline',
    summary: 'Handle especially sensitive records one document or folder at a time, with a named purpose, separate approval, and automatic expiration.',
    materials: [
      'Only the exact document or folder approved for a named purpose',
      'A watermarked or view-only copy when practical',
      'A time-limited access record and document-version reference',
    ],
    requirements: [
      'Obtain document-level owner approval',
      'Verify identity, purpose, and need to know',
      'Apply download, redistribution, confidentiality, and legal-review controls',
      'Expire access and review the outcome of every exception',
    ],
    deniedByDefault: [
      'Automatic access to the rest of the investor data room',
      'Permanent access created by one document exception',
      'Banking credentials, passwords, raw identity files, or unrelated personal records',
    ],
  },
] as const satisfies readonly InvestorAccessTier[];

export type InvestorAccessTierId = typeof investorAccessTiers[number]['id'];
