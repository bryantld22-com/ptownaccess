import type { Href } from 'expo-router';
import type { SectionIconName } from '../components/SectionIcon';

export type AccessRoleId = typeof accessRoles[number]['id'];

export type AccessRole = {
  id: string;
  title: string;
  group: 'Guest & member experience' | 'Talent & service' | 'Media & leadership';
  icon: SectionIconName;
  summary: string;
  requestScopes: string[];
  workflow: string[];
  futurePermissions: string[];
  deniedByDefault: string[];
  links: { label: string; href: Href }[];
};

export const accessRoles = [
  {
    id: 'guest-viewer', title: 'Guest / Viewer', group: 'Guest & member experience', icon: 'eye-outline',
    summary: 'Discover public PTown programs and plan an evening without receiving staff, performer, production, or owner information.',
    requestScopes: ['Public program and visitor information', 'My device planning tools', 'A reviewed invitation or plan preview'],
    workflow: ['Explore published programs and visitor information', 'Save private planning preferences on one device', 'Copy or share only a preview the guest has reviewed'],
    futurePermissions: ['View confirmed public schedules and venue policies', 'Manage the guest’s own reservations, tickets, and invitations', 'Control the guest’s own privacy and notification choices'],
    deniedByDefault: ['Other guests’ profiles or plans', 'Staff, performer, contract, or production records', 'Payment, emergency, medical, or administrative information'],
    links: [{ label: 'Browse proposed events', href: '/events' }, { label: 'Plan a visit', href: '/visit' }],
  },
  {
    id: 'registered-member', title: 'Registered Member', group: 'Guest & member experience', icon: 'person-circle-outline',
    summary: 'Build on the guest experience with the member’s own profile, preferences, benefits, and activity—never another member’s private record.',
    requestScopes: ['My own account and profile', 'My own membership benefits', 'My own communication choices'],
    workflow: ['Create and verify one member identity', 'Choose membership and communication preferences', 'Use only benefits attached to that member account'],
    futurePermissions: ['Manage the member’s own account and digital membership', 'See the member’s own benefits, activity, and eligible offers', 'Update consent, visibility, and communication settings'],
    deniedByDefault: ['Another member’s account or activity', 'VIP-only, staff, production, or owner controls', 'Internal financial, contract, emergency, or medical records'],
    links: [{ label: 'Explore memberships', href: '/memberships' }, { label: 'Review device plans', href: '/profile' }],
  },
  {
    id: 'vip-member', title: 'VIP Member', group: 'Guest & member experience', icon: 'diamond-outline',
    summary: 'Receive only the confirmed VIP benefits and experiences attached to the verified member—without leadership or backstage authority.',
    requestScopes: ['My own confirmed VIP benefits', 'My own eligible VIP reservations or access', 'Approved VIP communications for me'],
    workflow: ['Verify active VIP eligibility', 'Review available benefits for a specific event', 'Use the member’s own access while respecting capacity and venue rules'],
    futurePermissions: ['View the member’s confirmed VIP benefits', 'Manage the member’s own eligible VIP reservations or access', 'Receive approved VIP communications and experience details'],
    deniedByDefault: ['Other VIP members’ records', 'Backstage, performer, staff, camera, or control-room access', 'Owner dashboards, financial reports, contracts, or security records'],
    links: [{ label: 'Explore the VIP Society', href: '/vip' }, { label: 'Compare membership plans', href: '/memberships' }],
  },
  {
    id: 'performer-artist', title: 'Performer / Artist', group: 'Talent & service', icon: 'mic-outline',
    summary: 'Manage the artist’s own submissions, invitations, schedule, agreements, and approved media—not other artists or internal evaluation notes.',
    requestScopes: ['My own artist profile and materials', 'My own invitations, agreements, and calls', 'My own approved media and schedule'],
    workflow: ['Submit approved materials through a defined program flow', 'Track the artist’s own review, invitation, and check-in status', 'Receive only confirmed booking, rehearsal, production, and payment instructions'],
    futurePermissions: ['Maintain the artist’s own public profile and materials', 'Review the artist’s own invitations, agreements, calls, and approved media', 'Acknowledge required policies, releases, and schedule updates'],
    deniedByDefault: ['Private owner evaluation or ranking notes', 'Other artists’ contracts, contact details, or payment information', 'Staff, camera, director, security, or administrative controls'],
    links: [{ label: 'Explore Artist Development', href: '/artist-development' }, { label: 'Explore creative pathways', href: '/creative' }],
  },
  {
    id: 'staff-server', title: 'Staff / Server', group: 'Talent & service', icon: 'restaurant-outline',
    summary: 'Use only the shift, table, service, safety, and guest information required to perform an assigned hospitality responsibility.',
    requestScopes: ['My assigned shift and service area', 'An approved service or incident workflow', 'Minimum guest details needed for my service task'],
    workflow: ['Confirm the worker’s identity, role, shift, and location', 'View only assigned service tasks and necessary guest accommodations', 'Record completion or escalate an issue through the responsible supervisor'],
    futurePermissions: ['See assigned shifts, sections, tables, and operating notices', 'Use approved service and incident workflows', 'Access only the minimum guest details needed for service'],
    deniedByDefault: ['Unassigned guest histories or full profiles', 'Performer contracts, production files, payroll, or owner reports', 'Medical details beyond an authorized need-to-know response'],
    links: [{ label: 'Review reservation planning', href: '/reservations' }, { label: 'Open the visit guide', href: '/visit' }],
  },
  {
    id: 'camera-host', title: 'Camera Host', group: 'Media & leadership', icon: 'videocam-outline',
    summary: 'Contribute an approved camera feed or hosted segment only for the assigned production, time, location, and audience.',
    requestScopes: ['My assigned production brief', 'My approved camera device and feed', 'Director cues and assigned media submission'],
    workflow: ['Verify identity, training, equipment, and assignment', 'Accept the production brief, safety rules, consent limits, and stream window', 'Send only the assigned feed while the director retains control'],
    futurePermissions: ['Access the assigned production brief and call time', 'Connect only an approved device and stream key', 'Receive director cues and submit assigned media for review'],
    deniedByDefault: ['Switching, publishing, or archive authority', 'Unassigned cameras, private feeds, backstage areas, or participant records', 'Passwords, master stream keys, contracts, payments, or owner controls'],
    links: [{ label: 'Explore Live & Recorded Production', href: '/media-group/production' }, { label: 'Explore the Media Academy', href: '/media-group/media-academy' }],
  },
  {
    id: 'production-staff', title: 'Production Staff', group: 'Media & leadership', icon: 'construct-outline',
    summary: 'Operate assigned audio, lighting, camera, stage, editing, or archive work within the approved rundown and production plan.',
    requestScopes: ['My assigned production workspace', 'My assigned checks and production files', 'Director review and archive handoff'],
    workflow: ['Receive a named assignment, call sheet, and equipment responsibility', 'Complete safety, rights, release, and technical checks', 'Deliver work for director review without self-publishing'],
    futurePermissions: ['Use assigned production workspaces and records', 'Update only the tasks, checks, and files owned by the assignment', 'Submit work for approval and documented archive handoff'],
    deniedByDefault: ['Final editorial, release, or owner approval unless separately granted', 'Unassigned productions, private talent records, or financial data', 'Publishing credentials, security controls, or unrestricted archives'],
    links: [{ label: 'Open production templates', href: '/media-templates' }, { label: 'Review Media Group production', href: '/media-group/production' }],
  },
  {
    id: 'director', title: 'Director', group: 'Media & leadership', icon: 'film-outline',
    summary: 'Coordinate an assigned department or production, make documented operational decisions, and escalate authority reserved for ownership.',
    requestScopes: ['My assigned department or production', 'Approved live-production controls', 'Delegated editorial and publishing review'],
    workflow: ['Confirm scope, team, budget limit, rights, safety, and decision authority', 'Direct the approved production or department workflow', 'Review evidence, record decisions, and release only within delegated authority'],
    futurePermissions: ['Assign and review authorized department work', 'Control approved live-production feeds and emergency stops', 'Approve within documented editorial, technical, rights, and publishing limits'],
    deniedByDefault: ['Ownership decisions outside the delegated department or production', 'Unrelated staff, artist, member, financial, or medical records', 'Permanent role grants, security administration, or unrestricted data exports'],
    links: [{ label: 'Open the Media Director Guide', href: '/media-group/operations-guide' }, { label: 'Review media readiness', href: '/media-readiness' }],
  },
  {
    id: 'owner-admin', title: 'Owner / Administrator', group: 'Media & leadership', icon: 'shield-checkmark-outline',
    summary: 'Govern role grants, policy, audit, safety, business controls, and final exceptions while keeping day-to-day access least-privileged.',
    requestScopes: ['Verified role administration', 'Protected cross-department readiness review', 'Access review, suspension, and audit'],
    workflow: ['Approve role definitions, owners, conditions, and separation of duties', 'Review access grants, sensitive actions, exceptions, and revocations', 'Audit outcomes and correct policy, training, or permission failures'],
    futurePermissions: ['Manage verified roles and delegated authority', 'Review protected owner dashboards and cross-department readiness', 'Suspend access, investigate exceptions, and preserve required audit records'],
    deniedByDefault: ['Casual access to sensitive records without a business need', 'Sharing credentials or bypassing consent, approval, or audit controls', 'Using administrative authority as a substitute for documented process'],
    links: [{ label: 'Open the Media production dashboard', href: '/media-dashboard' }, { label: 'Open the Artist Development dashboard', href: '/artist-development-dashboard' }],
  },
] as const satisfies readonly AccessRole[];
