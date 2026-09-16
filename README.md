# PTown Access

Build 7 of PTown Dinner Club’s app for Paducah, Kentucky. React Native,
Expo SDK 57, TypeScript, and Expo Router. Black, warm cream, and gold.

## Included

- Compare up to three proposed programs with admission, dinner, opening, and after-party
  details; selections survive reloads in the URL and never change favorites automatically.
- Compare saved programs, save/remove favorites with acknowledged device writes, and open
  a program detail or weekday visit guide directly from the comparison.

- An interactive Plan Your Visit guide with persistent weekday URLs, proposed dinner
  policies, ticket/VIP/membership links, saved-draft weekday selection, and expandable FAQs.

- Home with eight working section links and spotlight programming.
- Bottom tabs: Home, Events, Tickets, PTown, and Profile.
- Proposed weekly event program, admission filters, and program detail pages.
- VIP, Media, Reservations, Memberships, Save the Arts (including the Heritage
  Tour), and Artist Development pages.
- Shared screen, header, card, button, theme, types, and local sample data.
- Responsive browser layouts, static deep links, and unknown-route handling.
- Saved event programs, one editable reservation draft, and membership interest.
- Device storage, a saved-plans Profile, explicit clear-data confirmation, and
  recovery from unreadable storage. Failed writes preserve previously saved plans.
- Search across program titles, genres, weekdays, and details; combine admission,
  saved-program, and weekday filters with clear empty states and a reset action.
- List and responsive weekly views, with Monday–Sunday ordering and saved markers.
- An optional planning checklist that updates from saved plans and links a dinner
  draft’s local weekday to that day’s proposed program. Weekday links survive reloads.
- A plan review page with programs, dinner draft, membership interest, and weekday
  alignment; links from Home, Profile, and Tickets.
- Copyable preview text, native sharing, supported browser sharing, cancellation
  handling, and selectable text when automatic copying is unavailable.
- Saved ticketed programs on Tickets, clearly distinguished from purchased passes.
- Seven planned creative pathways across Save the Arts, Artist Development, and Media,
  including the Heritage Tour, Saturday Arts Sessions, and Culinary Artist Development.
- A searchable creative library, division and saved-interest filters, and pathway
  detail pages with focus areas and proposed projects.
- Creative interests saved on the device, shown in Profile and included in copied or
  shared summaries. Saving does not submit an application, enroll, or notify PTown.

This is a planning and navigation preview. Plans are stored on the current device
with AsyncStorage (browser local storage on web) and do not sync. No backend services,
authentication, databases, payments, booking submission, or enrollment.
Sample programs are not confirmed event listings. The PT monogram launcher icons are
temporary and should be replaced with approved PTown artwork before release.

## Private browser preview

[Open PTown Access](https://ptown-access.bryantld22.chatgpt.site)

This is an owner-private browser preview. Use the ChatGPT account that owns
the project to open it. It is a preview of Build 7, not an App Store release.

## Run

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run start
```

Scan the Expo development QR code with a compatible Expo Go app on a phone
connected to the same network. Press `w` for a browser preview, or run
`npm run web`. Native emulators need their platform tools installed; this
repository does not contain App Store or Google Play builds.

For Chromebook development, open this repository in GitHub Codespaces, run
`npm ci`, then `npm run web -- --port 8081`. Open the forwarded port in the
Codespaces Ports panel. A Codespaces preview is temporary, not a deployed app.

## Checks

```sh
npm run typecheck
npm run check:dependencies
npm run build:all
npx playwright install chromium
npm run test:web
```

GitHub Actions runs these checks on pushes and pull requests. Browser tests
cover all eight Home links, rendered link styling, event filters, detail-page
reloads, the Heritage Tour, and screen widths from 320 to 1280 pixels. They also cover
saved-plan persistence, reservation validation and editing, failed writes, clear-data
confirmation, and recovery from corrupt data. Discovery tests cover combined searches
and filters, weekly layouts, saved-event removal, checklist progress, and local weekday
links in a time zone west of UTC. Review tests verify earlier saved data remains
readable, actual browser clipboard text, sharing payloads, cancellation, copy/share
failures, unreadable-data handling, and the distinction between favorites and tickets.
Creative tests cover all pathway detail links, combined search and division filters,
saved-interest reloads/removal, compatibility with earlier storage, failed writes,
confirmation before clearing, and rejection of invalid interest data. Earlier plans
without a `savedPathwayIds` field load with an empty creative-interest list; writes
preserve existing events, dinner drafts, and membership interests.
Browser sharing is available only when the browser exposes its share API; copying
and selectable summary text remain available. Exported files
are generated in `dist/` and are not committed. Hosting is a separate step.

## Structure

```text
app/                 Expo Router tabs and detail pages
src/components/      Reusable screen, cards, headers, and buttons
src/theme/           Shared colors, spacing, and radii
src/data/            Local sample programs, creative pathways, and section content
src/hooks/           Event filter state
src/state/           Versioned device preview storage and actions
src/utils/           Local-date weekday calculation and preview summary formatting
src/types/           Shared content types
src/services/        Reserved for later approved integrations
assets/              Temporary PT monogram launcher assets
```

## Next implementation priorities

1. Replace temporary launcher assets with the approved PTown logo and icons.
2. Confirm real event dates, artists, pricing, food inclusions, and policies.
3. Test on physical iPhone, Android, and tablet devices; review large text and
   assistive technology behavior, native clipboard, and native share-sheet completion
   and cancellation.
4. Review the private browser preview on laptop, phone, and tablet.
5. Define accounts, reservations, tickets, and membership requirements before
   introducing any backend or payment integration.

Visit-guide tests cover all seven days, reloads and invalid weekday links, FAQs,
saved-draft links in a western time zone, expired draft notices, and narrow layouts.

Comparison tests cover selection caps, deduplicated and invalid URLs, reloads,
weekday visit links, device saving/removal, failed writes, earlier plan preservation,
unreadable data, and responsive layouts.

## Build 7 completion

The app foundation, event and creative discovery, plan review, navigation, and device planning flows are implemented. TypeScript checks,
Expo dependency checks, web/iOS/Android exports, and Chromium navigation
and saved-plan checks passed during development. Screens were visually reviewed at phone
and desktop widths. Physical-device testing and replacement of the temporary
launcher monogram with approved artwork remain release tasks.

The preview uses static Expo web output hosted privately. The hosting identity
is retained in `.openai/hosting.json`; runtime accounts, booking services, and
payments have not been introduced.

## Final preview hardening

Stored dinner drafts now reject impossible calendar dates during recovery. Valid
older drafts remain available for editing, with a date-passed notice on Profile,
plan review, and the copied/shared summary. Saved programs are retained when a
valid dinner draft becomes old. Invalid stored data is left untouched until the
owner chooses the existing reset action.

Release still requires approved logo assets, confirmed programming and policies,
and physical iPhone/Android testing. No payment or booking service is enabled.

Validation for this hardening update: TypeScript and web/iOS/Android exports
passed, along with eight direct date/summary assertions. Expo's bundled offline
dependency check reported dependencies up to date; the online check timed out.
A browser regression test was added, but the suite could not run locally because
Chromium download was blocked by network timeouts. GitHub Actions retains the
full browser suite for an environment with browser download access.
