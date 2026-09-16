# PTown Access

Build 1 of PTown Dinner Club’s app for Paducah, Kentucky. React Native,
Expo SDK 57, TypeScript, and Expo Router. Black, warm cream, and gold.

## Included

- Home with eight working section links and spotlight programming.
- Bottom tabs: Home, Events, Tickets, PTown, and Profile.
- Proposed weekly event program, admission filters, and program detail pages.
- VIP, Media, Reservations, Memberships, Save the Arts (including the Heritage
  Tour), and Artist Development pages.
- Shared screen, header, card, button, theme, types, and local sample data.
- Responsive browser layouts, static deep links, and unknown-route handling.

This is a foundation and navigation preview. No backend services,
authentication, databases, payments, booking submission, or enrollment.
Sample programs are not confirmed event listings. The PT monogram launcher icons are
temporary and should be replaced with approved PTown artwork before release.

## Private browser preview

[Open PTown Access](https://ptown-access.bryantld22.chatgpt.site)

This is an owner-private browser preview. Use the ChatGPT account that owns
the project to open it. It is a preview of Build 1, not an App Store release.

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
reloads, the Heritage Tour, and screen widths from 320 to 1280 pixels. Exported files
are generated in `dist/` and are not committed. Hosting is a separate step.

## Structure

```text
app/                 Expo Router tabs and detail pages
src/components/      Reusable screen, cards, headers, and buttons
src/theme/           Shared colors, spacing, and radii
src/data/            Local sample programs and section content
src/hooks/           Event filter state
src/types/           Shared content types
src/services/        Reserved for later approved integrations
assets/              Temporary PT monogram launcher assets
```

## Next implementation priorities

1. Replace temporary launcher assets with the approved PTown logo and icons.
2. Confirm real event dates, artists, pricing, food inclusions, and policies.
3. Test on physical iPhone, Android, and tablet devices; review large text and
   assistive technology behavior.
4. Review the private browser preview on laptop, phone, and tablet.
5. Define accounts, reservations, tickets, and membership requirements before
   introducing any backend or payment integration.

## Build 1 completion

The app foundation and navigation are implemented. TypeScript checks,
Expo dependency checks, web/iOS/Android exports, and Chromium navigation
checks passed during development. Screens were visually reviewed at phone
and desktop widths. Physical-device testing and replacement of the temporary
launcher monogram with approved artwork remain release tasks.

The preview uses static Expo web output hosted privately. The hosting identity
is retained in `.openai/hosting.json`; runtime accounts, booking services, and
payments have not been introduced.
