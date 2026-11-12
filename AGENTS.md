# Dira Creative — Project Operating Instructions

## Product identity
- Parent company: Royalty Holdings (Pty) Ltd
- Operating brand: Dira Creative
- Category: Brand & Business Development Agency
- Location: Gaborone, Botswana
- Phone: +267 74 343 719
- Email: info.diracreative@gmail.com
- Website: pending
- Tagline: “Building brands that communicate clearly, operate efficiently, and scale effectively.”
- Registered company number: UIN BW 00001917522

## Product objective
Build an integrated Business OS for Royalty Holdings, initially operated through Dira Creative. It must support the real client journey from discovery and enquiry through service selection, proposals/quotes, approval, project execution, deliverables, invoicing, payments, records and ongoing support.

## Source lineage and visual standard
- This repository was explicitly cloned from gatshaayanda/iteration13 at the product owner's direction.
- The Iteration 13 mobile WashRide reference at docs/assets/washride-home-reference.jpeg is the visual craftsmanship reference. Adapt its compact mobile composition, clear hierarchy, dominant action, useful secondary actions and polished finish. Never copy WashRide branding, car imagery or its palette.
- Dira palette: Light Blue #f4f6fc; Azure #4bb4ce; Dark Turquoise #0097b2; Dark Grey #222222.
- Typography: Radnika Next for headings/primary typography; Open Sans for supporting text. Use available local assets if present; otherwise safe sans-serif fallbacks.
- The public/account/owner lockup uses `src/components/DiraBrand.tsx`; place the official logo at `public/diralogo.jpeg` to replace its safe D monogram fallback. Never fabricate or redraw the official mark.
- Readable text is mandatory: normal text and controls >=14 CSS px; nonessential metadata >=12px; WCAG AA contrast. Never clip essential descriptions or prices.
- Compactness applies to public Store, enquiries, customer account, owner workspace, forms, CRUD, settings and records—not just the landing page.

## Product areas
1. Public Dira presence: agency proposition, five development stages, complete service catalogue, package pricing, portfolio and enquiry.
2. Client workspace: scoped enquiries, proposals, approvals, project progress, tasks, deliverables, invoices, payment records and communication.
3. Owner Briefcase / Business OS: Today, clients, pipeline, projects, tasks, service catalogue CRUD, deliverables, calendar, receipts/records, finances, brand assets, documents, team responsibilities, insights and settings.
4. Parent-company oversight: Royalty Holdings identity and company records, with Dira Creative as the operating agency.

The public home route (src/app/page.tsx) is the agency storefront: it leads with the three audience package paths, explains the five development stages, and keeps the full published catalogue searchable. Package and service selections route into /request with the selected catalogue item prefilled. The optional scripted ServiceGuide remains available and must stay dismissible and non-blocking. Do not reintroduce the retired browser-local storefront/admin demo into the public landing page.

## UX research and onboarding decisions
- Follow `docs/DIRA-UX-AND-ONBOARDING-DECISIONS.md` for the audience paths, psychology-informed choice architecture, progressive-disclosure enquiry form, colour constraints and first-QA acceptance journeys.
- Lead with three plain-language audience package paths, then provide a searchable full service catalogue. Do not hide or remove any supplied service or price.
- Enquiry fallback without configured online submission must clearly prepare a WhatsApp draft and say it is not sent until the customer presses Send.

## Five development stages
1. Define Your Identity — logo, colour, typography, iconography, graphic elements, photography direction, illustration and layout.
2. Establish Your Presence — company profiles, proposals, portfolios, pitch decks, business cards, websites, applications and maintenance.
3. Structure Your Operations — workflows, team structures, function mapping and operational support.
4. Connect With Your Market — flyers, brochures, posters, advertising, social media, video ads and motion graphics.
5. Optimise for Growth — asset/resource management, revenue optimisation, gap analysis, strategic problem-solving and growth solutions.

## Verified service catalogue and pricing (BWP)
- Logo design: Basic P250; Standard P450; Professional Logo Set P1,200; Full Inclusive Logo Design Suite P3,250.
- Colour: Basic Palette P150; Standard System P300; Full System P600.
- Typography: Basic Pairing P150; Standard System P350; Full System P700.
- Iconography: Basic 3–5 icons P200; Standard 6–12 icons P400; Custom System P800.
- Graphic elements: Basic P200; Standard P400; Full System P900.
- Image/photography direction: Basic P350; Standard P650; Full System P995.
- Illustration: Basic P250; Standard P500; Custom Direction P1,000.
- Layout/composition: Basic P250; Standard P500; Full System P1,000.
- Novice package: P3,200 (published maximum; scope and any price adjustment are discussed and agreed before approval).
- Elevate package: P5,200 (published maximum; scope and any price adjustment are discussed and agreed before approval).
- Elite package: P12,500 (published maximum; scope and any price adjustment are discussed and agreed before approval).
Use the fixed package prices above. Discuss and agree any scope adjustment or negotiated price before customer approval. Do not publish ranges or custom-priced package cards without a specific approved price. Public storefront and customer account must not display Dira phone/email contact details; collect customer details only inside private order/account flows.

## Protected foundation behavior
- Preserve the inherited PWA install lifecycle: early beforeinstallprompt capture, retained native prompt, click-triggered browser prompt, branded dismissible card, iOS Safari Share → Add to Home Screen guidance, embedded-browser handling and service-worker update lifecycle.
- Preserve the inherited chatbot/ServiceGuide behavior and its truthful scripted-guide disclosures. Change project-specific identity and content, not its interaction architecture.
- Preserve existing request/account/owner interactions, UploadThing upload flows, receipt rendering, local/offline shell and responsive behavior unless a demonstrated defect requires a narrow authorized fix.
- Do not rewrite src/app/pwa-register.tsx install mechanics or weaken scripts/verify-identity.mjs install regression guards.
- The approved Firebase project is `the-wall-ab746` (Firestore Native, `(default)`, `africa-south1`). The public web configuration is recorded in `.env.example`; server-side routes require a matching Firebase service-account JSON in `FIREBASE_ADMIN_KEY` and `FIREBASE_PROJECT_ID=the-wall-ab746`. Never commit service-account credentials or `DIRA_OPERATIONS_WORD`.
- Use UploadThing for required media uploads. Do not introduce Firebase Storage.

## Current persistence/security boundary
The public home route is a catalogue and decision surface only; it does not create browser-local customer or owner records. The production journeys are `/request` (anonymous Firebase Auth session + server-validated Firestore enquiry when configured; otherwise an explicit WhatsApp draft fallback), `/account` (customer Firebase Auth, enquiry subscriptions, quote approval, project tasks and conversations), `/admin` (one-word Operations gate + Firebase custom token + role-checked owner workspace), and `/admin/storefront` (Firestore service CRUD). Owner updates and client quote approvals use Firebase Admin transactions. The production flows are only operational when the `the-wall-ab746` web config, matching `FIREBASE_ADMIN_KEY`, `FIREBASE_PROJECT_ID`, `DIRA_OPERATIONS_WORD`, and UploadThing token where uploads are used are configured in the runtime. Do not treat browser-local preview records from retired iterations as real customer data.

## Notification preferences
- Notification lead-time is an optional `leadMinutes` preference. Existing saved records without it must remain readable and use the 15-minute default; keep the supported choices in `src/components/NotificationSettings.tsx` aligned with the UI.

## Implementation discipline
- GitHub main is source of truth. Inspect relevant files before edits; make focused changes and review diffs.
- Never invent backend behavior, client data, prices or payment confirmation.
- Do not change install behavior or chatbot behavior as part of identity work.
- Keep customer and owner views tied to the same record model; do not fabricate duplicate records.
- Keep quotes, unpaid work, confirmed payments, completed-job sales and projections separate.
- Use truthful states, timestamps and activity history derived from actual actions.
- Run npm ci, identity/offline checks, lint and build when execution is available. Inspect actual output. A GitHub push is not a build or deployment.
- The product owner handles Vercel deployments unless explicitly delegated.
- Never force-push or rewrite history.

## Verification commands
- npm run verify:identity
- npm run verify:offline
- npm run lint
- npm run build

## Checkpoint
Record exact branch/commit, changed areas, checks and outputs, visual QA, customer/owner journey QA, pending backend configuration and whether the app is ready for QA.


## Live activity and Firebase telemetry

Dira records privacy-limited customer journey events through `src/lib/firebase/journey-analytics.ts` and the authenticated server route `src/app/api/analytics/journey/route.ts`. The public storefront and project enquiry flow record visits, catalogue views, project-flow opens, selected services/packages and submitted enquiries. Events use anonymous Firebase sessions and must never include customer contact details, briefs, attachments or payment data. Admin telemetry uses the lifetime `customerJourneyAnalytics/summary` aggregate plus a bounded latest-100 event sample; keep admin reads bounded to avoid unnecessary Firestore usage. The 25 GB display is a reference ceiling against the estimated JSON payload bytes of Dira's tracked events only, not total Firebase project storage, billing, Firestore reads/writes or bandwidth. See `docs/OPERATIONAL-TRANSPARENCY-STANDARD.md` before changing event collection or the meter. The server route uses the existing `FIREBASE_PROJECT_ID` and `FIREBASE_ADMIN_KEY` configuration and the `the-wall-ab746` project.
