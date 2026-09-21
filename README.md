# PTown Access

Build 32 adds a read-only cloud reconciliation center that compares keys and
canonical payload checksums without changing either data copy. It builds on the
controlled Owner-only migration executor, server-side conflict protection, and checksummed
operations backup and guarded recovery workflow. Cloud features remain off until
client configuration, schema, staff authorization, backup, recovery, conflict,
and migration reconciliation checks pass.

Build 14 of PTown Dinner Club’s app for Paducah, Kentucky. React Native,
Expo SDK 57, TypeScript, and Expo Router. Black, warm cream, and gold.

## Included

- Supplied PTown Dinner Club logo displayed on Home, with full artwork contained
  at its original 2:1 aspect ratio across phone, tablet, and desktop widths.
  The bundled PNG is copied unchanged from the owner’s upload.

- Updated weekly program: Tuesday is Musician Jam Session; Saturday is Any Genre.

- Creative-library searches and division/saved filters persist in direct query
  links and reloads. Defaults match static HTML before applying URL state.
- Saved-interest links use the destination device’s plans, with distinct loading
  and unreadable-storage states. Reset clears the search and filter together.

- Section location labels and contextual library links on non-Home screens.
  Event details return to their weekday; creative details link to both the
  creative library and the relevant PTown division. Unknown links use a
  neutral recovery label without presenting URL text as a valid program.

- Persistent Home, Search, Visit guide, and Saved plans shortcuts on every page,
  with current-page indicators, keyboard links, and touch-sized controls.
- A Plan and explore directory on PTown brings search, visit planning, program
  comparison, creative discovery, plan review, and manual backups together.

- Weekday program links render without hydration errors and keep their selection
  after reload. Section and detail headers identify the current destination.
- Missing pages provide search, saved-plan, and home recovery links; unavailable
  program and pathway details also link to their respective libraries.

- Optional dinner planning notes (up to 280 characters), with a visible count and
  clear distinction between a saved idea and a request submitted to PTown.
- Notes persist through edits, Profile, review/copy/share, and manual transfers.
  Earlier drafts without notes remain readable; invalid notes require recovery.

- Unified PTown search across seven proposed programs, seven creative pathways,
  eight main sections, and five planning tools. Word and category filters combine.
- Search suggestions, saved-result filtering, clear empty/error states, and direct
  query links that retain searches and categories across reloads.

- Manual saved-plan backup and transfer codes, with acknowledged copying and selectable
  text when copying is unavailable. Codes contain planning preferences, not purchased tickets.
- Reviewed replacement restores on another device, cancellation, invalid-code rejection,
  failed-write preservation, and explicit recovery from unreadable local data.

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
the project to open it. It is a preview of Build 14, not an App Store release.

## Run

Use Node.js 24 LTS and npm.

## Supabase development activation

Copy `.env.example` to a local `.env` file and provide only the development
project URL and publishable key. `.env` files are ignored by Git. Never place a
Supabase service-role key in Expo configuration, a browser build, a mobile build,
or this repository.

Keep `EXPO_PUBLIC_RUNTIME_MODE=preview` and
`EXPO_PUBLIC_SYNC_ENABLED=false` during development setup. Apply
`supabase/migrations/202609210001_ptown_operations.sql`, establish the first
Owner profile through a controlled administrative process, deploy the
`invite-staff` Edge Function, and use `/operations/activation` to run the safe
schema connection check. Production sync must remain disabled until backup,
restore, authorization, conflict, and migration reconciliation tests pass.

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

Backup tests transfer plans between independent browser contexts, verify actual clipboard
contents, review/cancel/edit invalidation, legacy compatibility, rejection of unknown
programs and impossible dates, failed writes, unreadable-data recovery, and narrow layouts.

Search tests verify combined words and category filters, suggestions, direct links,
reloads, browser history, destination routes, saved-interest removal, unreadable-data
handling, unchanged stored plans, and responsive layouts.

Dinner-note tests verify persistence, editing/removal, summary and backup contents,
independent-device transfers, older drafts, maximum length, invalid-note rejection,
failed writes, and phone layouts.

## Build 14 completion

The app foundation, event and creative discovery, plan review, navigation, and device planning flows are implemented. TypeScript checks,
Expo dependency checks, web/iOS/Android exports, and Chromium navigation
and saved-plan checks passed during development. Screens were visually reviewed at phone
and desktop widths. Physical-device testing and replacement of the temporary
launcher monogram with approved artwork remain release tasks.

The preview uses static Expo web output hosted privately. The hosting identity
is retained in `.openai/hosting.json`; runtime accounts, booking services, and
payments have not been introduced.

## Earlier preview hardening

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

## Build 11 navigation verification

Browser regressions cover all seven direct weekday URLs and reloads, invalid weekday
parameters, contextual headers, and missing-link recovery without changing saved plans.
The local static preview serves matching dynamic recovery pages, or the generic
not-found page, with HTTP 404 for unknown paths.

Validation: TypeScript, web/iOS/Android exports, and all 31 Chromium browser tests
passed. Expo’s bundled offline dependency check reported dependencies up to date.
Navigation headers and recovery pages were visually reviewed at 320-pixel phone width.

## Build 12 navigation verification

The shared shortcuts remain visible while page content scrolls, support keyboard
activation, and mark their exact current destination. PTown’s directory opens all
six planning tools without changing stored programs, dinner drafts, or interests.

Validation: TypeScript and web/iOS/Android exports passed, along with all 33
Chromium browser tests. Controls and layouts were checked at phone, tablet, and
desktop widths; phone and desktop screens were visually reviewed. Expo’s bundled
offline dependency check reported dependencies up to date. Physical-device
accessibility and release testing remain outstanding.

## Build 13 location verification

Non-Home screens identify their section and relevant parent destinations. Event
details return to the corresponding weekday filter, distinguishing Monday and
Tuesday programs. Creative details link to the library and their division.
Unknown URLs show a neutral recovery location rather than a claimed program.

TypeScript, web/iOS/Android exports, and all 35 Chromium browser tests passed.
Regressions cover every event weekday, all three creative divisions, direct
links, reloads, history, unchanged saved plans, narrow layouts, and unknown-link
recovery. Phone event and pathway pages were visually reviewed. Expo’s bundled
offline dependency check reported dependencies up to date.

## Build 14 creative-link verification

Creative-library search text and filters now stay in `q` and `filter` parameters.
Direct links and reloads apply them after static hydration. Reset removes both
parameters; detail navigation and browser history retain the prior library URL.
Invalid/repeated parameters use defaults, and direct query text is limited to
120 characters. Saved-interest filters read only the current device, distinguish
loading/unreadable data from empty results, and leave stored plans unchanged.

TypeScript, web/iOS/Android exports, and all 38 Chromium browser tests passed.
Coverage includes every division, combined words and filters, reloads, detail
history, reset, independent-device contexts, invalid inputs, unreadable storage,
and responsive layouts. Phone query and saved-filter pages were visually reviewed.
Expo’s bundled offline dependency check reported dependencies up to date.
