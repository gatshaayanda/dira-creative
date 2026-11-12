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
- Readable text is mandatory: normal text and controls >=14 CSS px; nonessential metadata >=12px; WCAG AA contrast. Never clip essential descriptions or prices.
- Compactness applies to public Store, enquiries, customer account, owner workspace, forms, CRUD, settings and records—not just the landing page.

## Product areas
1. Public Dira presence: agency proposition, five development stages, complete service catalogue, package pricing, portfolio and enquiry.
2. Client workspace: scoped enquiries, proposals, approvals, project progress, tasks, deliverables, invoices, payment records and communication.
3. Owner Briefcase / Business OS: Today, clients, pipeline, projects, tasks, service catalogue CRUD, deliverables, calendar, receipts/records, finances, brand assets, documents, team responsibilities, insights and settings.
4. Parent-company oversight: Royalty Holdings identity and company records, with Dira Creative as the operating agency.

The local prototype currently demonstrates enquiries, quote send/approve/decline, project task checklists, client messages/attachments, requested-date calendar, service CRUD, customer discounts and receipt/payment recording. These actions are browser-local. Only expose a module as production-operational when its server-side actions and persistence are implemented. Clearly distinguish prototype/local state from server-persisted/shared state.

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
- Novice package: P2,100–P3,200.
- Elevate package: P3,400–P5,200.
- Elite package: P9,500–P12,500.
- Ultimate package: custom scope and pricing.
Use these supplied prices only. A range must remain visible as a range; Ultimate must be described as custom pricing, not P0.

## Protected foundation behavior
- Preserve the inherited PWA install lifecycle: early beforeinstallprompt capture, retained native prompt, click-triggered browser prompt, branded dismissible card, iOS Safari Share → Add to Home Screen guidance, embedded-browser handling and service-worker update lifecycle.
- Preserve the inherited chatbot/ServiceGuide behavior and its truthful scripted-guide disclosures. Change project-specific identity and content, not its interaction architecture.
- Preserve existing request/account/owner interactions, UploadThing upload flows, receipt rendering, local/offline shell and responsive behavior unless a demonstrated defect requires a narrow authorized fix.
- Do not rewrite src/app/pwa-register.tsx install mechanics or weaken scripts/verify-identity.mjs install regression guards.
- Do not reuse inherited Firebase project identifiers, credentials, customer data, analytics identifiers or deployment settings. Database and production auth configuration will be supplied separately by the product owner.
- Use UploadThing for required media uploads. Do not introduce Firebase Storage.

## Current persistence/security boundary
The inherited Store, account, owner workspace, requests, statuses, messages, receipts and preferences use browser-local demo storage. This is not shared persistence, cross-device sync, production authentication or a security boundary. The one-word owner demo gate is not production auth. Do not enter real customer records or claim a server-side payment, email, notification or sync succeeded. Keep the application clearly labelled as a prototype until the approved backend/auth details are connected and tested.

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
