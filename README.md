# Dira Creative — Royalty Holdings Business OS

**Dira Creative** is the Brand & Business Development Agency operating under **Royalty Holdings (Pty) Ltd**. This repository is the working product adaptation of the Iteration 13 foundation, selected explicitly by the product owner.

> Building brands that communicate clearly, operate efficiently, and scale effectively.

## Company details
- Parent company: Royalty Holdings (Pty) Ltd
- Registered UIN: BW 00001917522
- Operating brand: Dira Creative
- Category: Brand & Business Development Agency
- Location: Gaborone, Botswana
- Phone: +267 74 343 719
- Email: info.diracreative@gmail.com
- Website: pending

## Product direction
The Business OS is intended to manage the full client journey:

1. Discover Dira's services and packages.
2. Submit a project enquiry with a clear brief.
3. Review and approve a proposal/quotation.
4. Track project work, tasks, milestones and deliverables.
5. Review invoices, payments and receipts.
6. Continue communication and ongoing support.

The owner workspace is intended to bring together Today, clients, pipeline, projects, tasks, services, deliverables, calendar, records, finances, brand assets, documents, staff responsibilities, insights and settings. Modules must only be presented as operational when their actual workflows and persistence are implemented.

## Brand
- Light Blue: #f4f6fc
- Azure: #4bb4ce
- Dark Turquoise: #0097b2
- Dark Grey: #222222
- Primary typeface: Radnika Next
- Supporting typeface: Open Sans
- Design philosophy: Designed to stand out.

The mobile-first composition adapts the approved Iteration 13 WashRide reference at docs/assets/washride-home-reference.jpeg. The reference informs hierarchy, compactness, readable information density and finish; it does not supply Dira's brand identity. The source repository does not currently contain the Radnika Next or Open Sans font files; the stylesheet declares them as preferred families and retains readable system fallbacks until licensed font assets are supplied.

## Services and pricing
The supplied service catalogue and brand-package descriptions/prices are recorded in [docs/DIRA-PROJECT-BRIEF.md](./docs/DIRA-PROJECT-BRIEF.md). Prices are in Botswana pula (BWP). Package ranges remain ranges; Ultimate is custom-scoped and must not be represented as a zero-priced service.

## Current implementation
The first adaptation pass has:
- Replaced the public application identity, PWA metadata, app icon, page copy and visual palette with Dira Creative.
- Added the complete supplied priced brand-identity service tiers and the Novice, Elevate and Elite package cards.
- Added the five development stages, custom Ultimate package enquiry and direct email/phone contact.
- Added owner-issued customer discounts, quote sending, customer quote approval/decline, project task checklists and a requested-date calendar.
- Removed the unrelated racing promotion and capacity claims from the Dira customer journey.
- Preserved the existing customer request/account, owner workspace CRUD, receipt rendering, UploadThing client attachment workflow, guided chatbot, service worker and install lifecycle.
- Isolated the browser-local data keys and service-worker cache names for Dira Creative.

## Important current boundary
The inherited request/account/owner workflows still use browser-local prototype storage. The one-word owner gate is not production authentication. Browser-local records are not shared, cross-device or server-persisted. No real payment is taken. Do not enter real client records until the approved database, authentication and authorization design has been connected and verified.

Firebase environment placeholders are intentionally blank. The inherited Firebase project identity must not be reused. UploadThing configuration also requires the Dira project token. The product owner will provide database details after the end-to-end product remake is ready for that integration.

## Development
Requirements: Node.js 20+ and npm.

```bash
npm ci
npm run dev
```

Verification:

```bash
npm run verify:identity
npm run verify:offline
npm run lint
npm run build
```

## Protected foundation behavior
Do not rewrite the PWA install lifecycle or chatbot interaction architecture as part of brand adaptation. Preserve the captured native install prompt, click-to-prompt behavior, branded dismissible install card, iOS Safari guidance, embedded-browser handoff, service-worker update lifecycle, offline shell and upload feedback. See [AGENTS.md](./AGENTS.md), [CLONING.md](./CLONING.md) and [docs/CHANGE-SAFETY-STANDARD.md](./docs/CHANGE-SAFETY-STANDARD.md) for the project-specific protections.

## Checkpoint
The brand/catalogue and local workflow adaptation is in progress. Quote approval, project tasks and requested-date calendar are browser-local demonstrations. Production database/auth, shared customer records, server-side task/deliverable workflows, verified financial records, live messaging and payment integrations remain to be connected and verified before launch.
