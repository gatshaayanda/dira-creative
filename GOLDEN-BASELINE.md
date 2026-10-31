# Iteration 13 Golden Baseline

## Status and purpose

This repository's accepted baseline is the customer-first Service Studio PWA at GitHub `main`. Preserve it as Iteration 13's protected working reference and standards example. It is not the default cloning source for new projects. Source selection is controlled by the product owner; Africhiko is the default only when no source is named. This supersedes the repository's former Iteration-13-as-default cloning rule; The Plug-first wording is also historical and no longer governs source selection.

**Install/guide collision fix:** `1296f2bdc64a013e7b079467f95167cf02dfc527`. The golden branch was first created from `da03d01b750283980ea5d1aebe39856565e8e134` and then fast-forwarded to include the approved handoff/cloning policy cleanup. Treat the current head of `golden/iteration13-service-studio` as the authoritative recovery snapshot; do not infer its head from this document.

The stable recovery branch `golden/iteration13-service-studio` is intended to point to the approved baseline. Do not develop directly on it or move it casually. Any baseline promotion must be reviewed and deliberately recorded by the product owner.

## What is protected

- The mandatory [PWA Installation Lock](./docs/PWA-INSTALLATION-LOCK.md): install behavior is frozen during routine adaptation, and every clone must retain its automated regression guard. Never promote or copy a generic desktop/Android install explainer.

- Customer-first service catalogue → request form → My account journey.
- Local demo data model and honest local-only wording.
- Admin demo CRUD for sample services, announcements and request statuses.
- Customer account workspace, request-specific local conversations, checklist and notes.
- PWA install prompt capture and click-to-prompt behavior; embedded-browser handoff; iPhone Safari installation guide.
- Install flow is frozen during visual/identity work: no generic desktop/Android install explainer, no fake prompt, and no dead install CTA. Desktop/Android show the CTA only while a retained native `beforeinstallprompt` event is available; iOS Safari alone gets manual Share → Add to Home Screen guidance.
- Regression guard: the identity/build verifier scans all active UI source files and fails if generic desktop/Android install copy or a Chrome-menu fallback reappears. Never relax or narrow this check just to make a build pass.
- Service-worker cache namespace, offline shell, update/refresh behavior and fallbacks.
- Responsive layout, legible text, keyboard focus, reduced-motion behavior and accessible feedback.
- Existing UploadThing setup and Firebase configuration/rules/data: do not change without explicit permission.
- Clear distinction between prototype behavior and production requirements.

## Recovery and change policy

1. Inspect the current GitHub `main` commit and the golden branch before a substantial change.
2. Keep changes small and focused. Never overwrite `main` with a wholesale reset just because something looks wrong.
3. If a change regresses behavior, inspect the diff and return only the affected files/behavior to the known-good baseline; do not discard unrelated improvements.
4. Do not modify the golden branch as part of ordinary feature work. Promote a new baseline only after the product owner approves it and relevant checks pass.
5. A commit or branch is not proof of a green build or successful deployment. Report GitHub checks, Vercel state, browser/device QA and offline QA separately.
6. Do not promote an install-flow change to the golden branch until identity/install invariant checks and the available build checks pass. Branding-only changes must not edit the install runtime.

## New-project adaptation contract

Iteration 13 is the engineering standards and reference repository. It is not a universal copy-and-paste app and is not production-ready merely because its demo works. It is not the default source for new client projects.

For every new project:

1. **Select and inspect the source.** For an existing project, continue its repository; do not reclone it. For a new project, use the exact source named by the product owner. If none is named, use `gatshaayanda/africhiko`. If asked for a recommendation, compare relevant industry-specific portfolio apps and explain material risks before cloning. Iteration 13 remains the standards reference, not the default source.
2. **Research the real product and users online.** Use official sources and relevant UX/accessibility/security guidance. Record only findings that affect product decisions.
3. **Map the customer journey first.** Define the customer's next action, service/catalogue, request/booking/order flow, status language, account needs and expected staff response.
4. **Map staff/admin work.** Ensure customer requests and admin changes use the same intended records and workflows.
5. **Reset all inherited identity.** App name, brand, domain/base URL, metadata/social cards, manifest, icons/favicon/Apple metadata, visible copy, media, routes, service-worker/cache namespaces, local/session-storage keys, environment examples and identity-verification assertions.
6. **Choose persistence and security intentionally.** The current demo uses browser-local storage. A real app needs an approved backend, authenticated customer ownership, staff/admin authorization at the server/security-rule boundary, safe file access and actual notification delivery if promised. Never make Firebase public to bypass errors.
7. **Preserve installation separately from branding.** Inspect `layout.tsx`, `pwa-register.tsx`, both manifest representations, icon assets, `sw.js`, iPhone guide and identity script before edits. Never replace a working prompt with a fake or dead button.
8. **Adapt, don't transplant.** Reuse proven interaction patterns, not sample prices, identity, theme-specific extras, customer data or business logic. Account extras must fit the actual product; omit irrelevant gamification.
9. **Verify and report honestly.** Run identity checks, lint, typecheck and build where available; inspect CI and deployment status; test customer/admin flows, mobile/tablet/desktop, install and offline behavior. State what still requires physical-device QA.
10. **Checkpoint.** Commit and push to `main` when authorized; record the exact commit, checks, deployment state and remaining setup.

## Known limitations of this baseline

- Service orders, edits, announcements, status, messages and account extras are local to one browser profile.
- Admin demo is not a security boundary and must not receive real customer records.
- No remote inbox, email delivery, cross-device sync or production payment flow is implemented.
- UploadThing attachments require internet and are not queued offline.
- PWA install/offline patterns are reusable but must be tested after identity changes on actual supported browsers/devices.
- Firebase project integration inherited from the repository must be inspected deliberately before a new product uses it; do not assume it belongs to the new client.

## Required first reads

Start at [START-HERE.md](./START-HERE.md), then read [AGENTS.md](./AGENTS.md), [FOUNDATION-BLUEPRINT.md](./FOUNDATION-BLUEPRINT.md), [README.md](./README.md), and [CLONING.md](./CLONING.md). These are complementary: entry workflow, protected rules, architecture, demo walkthrough and adaptation procedure.
