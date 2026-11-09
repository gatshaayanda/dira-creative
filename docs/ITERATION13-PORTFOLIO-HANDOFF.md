# Iteration 13 — Portfolio Product & Engineering Handoff

**Purpose:** this repository is the canonical reference for the Admin Hub portfolio's product direction, visual craft, operational transparency, reusable engineering standards and implementation discipline. It is not a universal clone template and is not the default source repository.

## 1. What this repository is for

Use Iteration 13 whenever the product owner asks to:
- Establish or refine the Admin Hub / 13Studio product experience.
- Set or update shared visual, UX, accessibility, operational-transparency, PWA, offline, security, QA or delivery standards.
- Start a new client project and determine which reusable standards should travel into it.
- Improve an existing portfolio app against the approved shared standards.
- Resolve a cross-project implementation rule or recurring regression.

**GitHub main is the source of truth.** At the start of every implementation or QA chat, inspect this repository's current instructions and current code/docs rather than relying on old chat summaries.

## 2. What to read and when

Always start with:
1. `AGENTS.md`
2. `START-HERE.md`
3. `GOLDEN-BASELINE.md`
4. `docs/CHANGE-SAFETY-STANDARD.md`
5. `FOUNDATION-BLUEPRINT.md`
6. `README.md`

Then read only the relevant standards:
- Visual work: `docs/VISUAL-DIRECTION-STANDARD.md` **and open** `docs/assets/washride-home-reference.jpeg`.
- Customer/staff workflows: `docs/OPERATIONAL-TRANSPARENCY-STANDARD.md`.
- PWA/install: `docs/PWA-INSTALLATION-LOCK.md`.
- New repo or adaptation: `CLONING.md`, `docs/ADMIN-HUB-APP-FACTORY-SOP.md`, `docs/CLONE-RESET-CHECKLIST.md`, and the selected source repo's own instructions.
- Account changes: inspect the actual account component, data model, authentication, upload path and staff/admin workflow.

Use `docs/README.md` as the document map. Do not read every file indiscriminately or ask the product owner to repeat documented rules.

## 3. Visual reference contract

The WashRide reference image is a **craftsmanship and composition reference**, not a business template. Transfer its:
- immediate identity and recognisable logo/wordmark;
- strong, relevant visual/hero treatment;
- concise high-contrast headline;
- one dominant primary action;
- compact, useful secondary-action grid;
- consistent iconography, cards, borders, depth and spacing;
- app-like mobile composition and persistent navigation only where useful.

Do not copy WashRide's name, automotive imagery, car-wash actions, palette or business language. Adapt the composition to the target brand and industry. Compactness applies to the entire product: home, booking, customer account, staff, admin, CRUD, settings and forms. Keep admin information dense but clearly separated and easy to scan.

For Iteration 13 itself, the service-studio visual identity is a dark midnight/blue digital-product studio with crisp blue actions, light readable form surfaces and a compact two-column service catalogue on mobile. The sample service prices and browser-local workflow remain clearly labelled demo content.

The public storefront's footer logo is the discreet owner-entry affordance; do not add a public Admin button/link to customer navigation. The intended product model is Store + private owner Briefcase / **Your Business OS**, with useful areas such as Today, Customers, Orders & Jobs, Receipts & Records, Calendar, Insights, Store Design, Settings and **My Notes**. Keep My Notes in the owner workspace, not the customer account. Only expose OS modules that are actually implemented; do not represent a local demo as Gmail-secured or cross-device private storage. A true owner Gmail authentication boundary must be implemented and verified before real business records are placed behind this entry point.

The WashRide reference means compact, app-like composition—not simply a smaller type scale. Keep the hero short enough to reveal useful content/actions early, use a strong but contained visual, compress redundant proof chips and decorative whitespace, and make the service catalogue visible without a long marketing scroll. Apply the same compactness to all inner workspaces.


## 4A. Iteration 13 product standard — Store + Briefcase + Login

Iteration 13 is the live product demonstration of a small-business operating system, not merely a 13Studio services landing page. The complete customer journey and owner workflow must read as one product:

- **Store** — the public, business-branded storefront: services/products, offers, announcements, customer enquiries, booking/order entry and customer account sharing.
- **Briefcase** — the owner's private Business OS: Today, customers, jobs/orders, receipts and BUR-ready records, calendar, priorities, projections, insights, Store editor, announcements, theme, settings and My Notes.
- **Login** — one-word, low-friction owner entry. It must authenticate the owner before any real private records are shown. A logo may be the discreet visual shortcut to owner access; do not expose an Admin link in the public customer navigation. Customer access is separately scoped and is not owner login.

The Store and Briefcase must feel like one branded app. A business can select a theme colour (not merely light/dark), and the chosen accessible accent must flow through buttons, active navigation, links, badges, focus rings, charts and highlights. Provide a curated palette plus a custom colour control; derive readable foreground/surface treatments and check contrast. The business identity/theme is owner-controlled and should preview against the public Store before publishing.

### The Briefcase is operational, not decorative

The owner should be able to CRUD the actual Store content: services/products, descriptions, pricing, imagery, visibility, offers and announcements. A saved change must appear in the customer Store through the same data source. Owner preferences should shape custom job priorities, next actions and workload presentation. Include customer records and customer-scoped WhatsApp invitation/share links so the owner can onboard one or multiple contacts; customers open the actual business domain and see only their own permitted account, orders, messages and receipts.

Receipts and records should support retention, search, date filters, export and audit history for high customer volumes (including BUR-related record keeping). Keep confirmed payments/receipts and completed-job actual sales separate from quotations, incomplete jobs and projected sales. A completed job can be counted as actual sales only according to the business's configured completion/payment rules; an unfinished or quoted job remains a projection. Make the assumptions visible.

### Capacity and affordability proposition

The product demonstration should communicate the user's BoardSignal-derived capacity evidence: a 25 GB monthly server allowance has been proven against BoardSignal's observed workload, and is presented as capable of supporting thousands of customer interactions/records in a busy day, rather than framing the business system as airtime consumed by every customer call. The demonstration should show an illustrative high-volume day (thousands of customer interactions; e.g. 1,000+ calls) and a day-off scenario where customer journeys and automated record handling continue while the owner is away.

Do not conflate file storage, monthly data transfer, database operations, API requests, messaging charges or AI usage. The 25 GB allowance must be defined by the actual hosting/provider plan and measured usage. BoardSignal is the evidence reference, not a universal guarantee for every app, payload size, integration or traffic pattern. Show capacity as a transparent benchmark with assumptions and usage reporting; do not promise unlimited service. Present the monthly software/infrastructure expense as a business-operating cost designed to sit below a typical marketing budget, and show the actual plan/cost breakdown rather than inventing a universal price or saying every business will spend the same amount.

### Compact storefront visual contract

Use the WashRide image's app-like composition as the craftsmanship target: identity, relevant hero visual, concise headline, one dominant action, compact secondary action grid, clean card hierarchy and persistent navigation only where it helps. The Store must communicate the proposition quickly: one business OS, its public Store, its private Briefcase and its owner Login. Remove oversized marketing sections and repeated explanations. The first screen should expose the business proposition and customer action; the next screenful should reveal useful products/services. The Briefcase must be compact and operationally dense, with clear section separation, short labels, and progressive disclosure. Do not simply shrink typography or tap targets.

## 5. Product and operational model

The portfolio's product direction is a business-specific digital storefront paired with a private owner workspace (the digital briefcase). Keep these concepts understandable:
- Store: public discovery, services/products, content, enquiries and customer actions.
- Briefcase: private owner operations, customers, orders/jobs, conversations, receipts, calendar, priorities and useful business insights.
- Owner access and customer access are separate security contexts.
- A customer invitation grants access only to that customer's permitted records; it never exposes an owner's private workspace or other customers.
- Actual transactions, confirmed work, quotations, projections and unverified enquiries remain distinct.
- Infrastructure allowances, storage, bandwidth, request counts and third-party costs are measured and explained separately; never invent a universal allowance or imply unlimited usage.

Do not present Iteration 13's current browser-local demo as shared cloud storage, secure owner login, cross-device account sync or a production customer database. Check the actual code and data boundary before making capability claims.

## 6. Operational transparency and labor illusion

Make genuine work and outcomes visible where useful: received, validated, saved, reviewed, assigned, awaiting customer action, confirmed, in progress, completed or failed. Show the next useful action and preserve a meaningful history for consequential changes.

The labor-illusion insight is used ethically: communicate real work performed and the customer benefit. Never fabricate typing, progress, queue positions, enquiries, scarcity, customer interest, delivery, payments, savings or results. Do not delay a fast action to make software appear busy. Keep a human escalation route where the business requires it.

## 7. How to apply this to a new project

Iteration 13 is a **standards/reference repository, not the default clone source**.

1. Follow the product owner's explicitly named source. If none is named, the current App Factory default is `gatshaayanda/africhiko`.
2. Inspect the selected source and target remote before cloning. For an existing project, work in place; never reclone just to begin.
3. Read source `AGENTS.md`, README, cloning instructions and relevant protected-feature docs.
4. Apply Iteration 13's relevant standards: visual reference, compactness, operational transparency, change safety, accessibility, truthful offline states, security boundaries and verification discipline.
5. Adapt rather than copy wholesale. Preserve working customer journeys, PWA installation, chatbot, offline behavior, uploads, auth and other protected capabilities from the chosen source.
6. Reset all inherited identity, environment, domain, Firebase/project IDs, UploadThing, analytics, cache/storage namespaces and customer/demo content.
7. Create/update the target `AGENTS.md` with the actual source lineage, routes, data model, auth/authorization, integrations, customer/admin journeys, protected behavior, known limitations and verification commands.
8. Implement the brief in the target repository. Do not graft Iteration 13's demo localStorage architecture or sample services into production apps.
9. Verify customer and staff/admin flows, mobile layout, offline boundaries, security, identity, lint/build/tests and deployment separately. Push only when authorized.

## 8. How to apply this to an existing project

1. Inspect the existing repository's latest branch/commit, instructions, implementation and protected behavior.
2. Compare the requested area with the relevant Iteration 13 standard and reference image.
3. Identify the smallest justified change; preserve the existing app's identity, proven data model, auth, install, chatbot, integrations and successful customer journey.
4. Implement and verify in place. Do not rewrite the app to resemble Iteration 13 or replace its visual identity with 13Studio.
5. Update the target project's `AGENTS.md` only when a project-specific invariant, architecture decision or recurring failure mode needs to be retained.
6. Report commit/push, tests/build, deployment and device QA as separate facts.

## 9. Authority and conflict resolution

Use this order:
1. Product owner's latest explicit instruction.
2. Actual target repository code, tests, config and verified runtime.
3. Target repository's `AGENTS.md` and protected contracts.
4. This repository's relevant canonical standards.
5. Architecture and walkthrough documentation.
6. Historical chat summaries.

When a shared standard conflicts with a target project's proven behavior, stop and resolve the conflict explicitly. Never weaken security or break a working capability merely to achieve visual consistency.

## 10. Release checkpoint

Before declaring an adoption complete:
- [ ] Target repo and latest baseline inspected.
- [ ] Exact relevant Iteration 13 docs and reference image reviewed.
- [ ] Brand and industry adapted; no WashRide/13Studio identity copied accidentally.
- [ ] Customer and staff/admin actions remain real and correctly connected.
- [ ] Local, offline, cached, server-persisted and cross-device states are accurately described.
- [ ] Auth, authorization, ownership, uploads and privacy remain protected.
- [ ] PWA install and chatbot locks preserved where present.
- [ ] Mobile, accessibility, empty/error/loading/success states checked.
- [ ] Identity checks, tests, lint and build run where available.
- [ ] Commit, push, deployment and physical-device QA reported separately.
