# Cloning and adapting portfolio projects safely

**Before cloning or adapting:** read [START-HERE.md](./START-HERE.md), [AGENTS.md](./AGENTS.md), [GOLDEN-BASELINE.md](./GOLDEN-BASELINE.md), [docs/PWA-INSTALLATION-LOCK.md](./docs/PWA-INSTALLATION-LOCK.md), [FOUNDATION-BLUEPRINT.md](./FOUNDATION-BLUEPRINT.md), [docs/ADMIN-HUB-APP-FACTORY-SOP.md](./docs/ADMIN-HUB-APP-FACTORY-SOP.md), [docs/CLONE-RESET-CHECKLIST.md](./docs/CLONE-RESET-CHECKLIST.md) and [README.md](./README.md). Start-HERE is the mandatory handoff. Iteration 13 is the engineering standards/reference repository, not the default clone source. The product owner selects the source for each new project; if none is specified, use `gatshaayanda/africhiko`. Existing projects are improved in place.

Use this guide to select, inspect, clone and safely adapt the product owner's chosen source repository. It does not prescribe Iteration 13 as the source. For an existing project, inspect and improve that repository in place instead of recloning it.
## 1. Establish the source and target

The product owner selects the source repository. Record its exact `owner/repository`, default branch and commit. Never develop directly on Iteration 13's golden recovery branch.

1. Use the exact source the product owner names. Do not silently substitute Iteration 13, Africhiko or another repository.
2. If no source is named, use `gatshaayanda/africhiko` as the default starting point for new customer-facing PWAs and Admin Hub apps.
3. If asked to recommend a source, inspect relevant portfolio repositories and compare industry fit, customer journey, admin workflows, architecture, integrations, protected features, visual quality and adaptation risk. Explain the recommendation before cloning.
4. Use Iteration 13 as the engineering standards, architecture and SOP reference—not the default clone source. Read its relevant governance documents and apply the standards to the selected source.
5. Confirm the target repository, intended empty local directory, product brief, domain, brand, media and integration decisions. Do not invent unknown business details.
6. Inspect source and target branches/remotes before cloning or pushing. Never overwrite an existing local project or non-empty remote; stop and reconcile safely. Never force-push.
7. Read `docs/ADMIN-HUB-APP-FACTORY-SOP.md` and `docs/CLONE-RESET-CHECKLIST.md` and record source lineage plus target baseline in the new project's `AGENTS.md`.

## 2. Preserve installation before changing identity

**Installation is frozen during ordinary project adaptation.** Treat it as infrastructure, not branding. The full mandatory contract and regression checklist are in [docs/PWA-INSTALLATION-LOCK.md](./docs/PWA-INSTALLATION-LOCK.md); every new clone must preserve and run the installation invariant guard in `scripts/verify-identity.mjs`. For a new project's icon, colors, typography, layout or copy, change artwork and metadata only; do not rewrite `layout.tsx`, `pwa-register.tsx`, event names, prompt timing, service-worker behavior or install visibility.

Inspect these exact files and assets in the source and target:
- `src/app/layout.tsx` — metadata, manifest declaration, early `beforeinstallprompt` capture and embedded-browser detection.
- `src/app/pwa-register.tsx` — retained one-shot event, branded install click, iOS Safari guide, embedded-browser handoff, service-worker registration and update behavior.
- `src/app/manifest.ts` and `public/manifest.webmanifest` — inspect both and verify which one is actually served; do not assume one overrides the other.
- `public/iteration13-icon.svg`, `public/iphone-install.svg`, `public/sw.js`, `src/app/iphone-install/page.tsx`, and `scripts/verify-identity.mjs`.
- `package.json` and the actual build output.

### Non-negotiable install behavior
1. When `beforeinstallprompt` fires, capture and retain the event; call its native `prompt()` directly from the user's branded install click.
2. On desktop/Android, show the install CTA only while that retained native prompt is available. No custom modal, generic Chrome/Edge menu explainer, fake prompt or dead install button when the event is absent.
3. On iOS Safari only, provide concise Share → Add to Home Screen guidance. Do not use that manual fallback on desktop/Android.
4. Keep the blocking embedded-browser handoff and the iPhone guide with its referenced assets.
5. `npm run verify:identity` checks the protected install invariants as well as project identity. Run it, lint and build after adaptation; inspect the actual served manifest/icons. Physical Chrome/Android and iPhone/Safari QA remains required before claiming device installation works.

The installation baseline is a working feature. Do not rewrite it while performing a branding reset. The approved Africhiko installation experience is the reference standard for the compact native-install card plus platform-specific iOS Safari and embedded-browser paths. Iteration 13 documents the safeguards and contains its own protected implementation; it is not the default clone source. Preserve those paths unless the product owner explicitly authorizes a specific change. If installation breaks, stop and inspect the actual branch/deployment/cache, compare against the known-good Africhiko card/native prompt and Iteration 13 runtime, repair the first proven failure, and strengthen `verify:identity` so the same regression fails CI. Never stack speculative fixes or introduce a second install mechanism. If a future product brief explicitly requires different installation behavior, isolate the change and verify it before promoting it to the reusable foundation.


### Regression prevention — mandatory for every clone
The install flow is a frozen infrastructure boundary. Do not “improve” or restyle it by replacing the native prompt with instructions. The following are release-blocking regressions on desktop/Android: copy such as “If your browser provides a native install prompt”, “Chrome install option”, or instructions to use the Chrome/Edge menu; any install explainer shown when no native event exists; a dead install button; or a custom install modal that replaces the native prompt. Do not add these in a new project either.

- Keep one install controller and one retained event. The branded button must invoke the retained event's `prompt()` directly from its click.
- Show the desktop/Android button only while the retained native event exists. When it is unavailable, let the website work normally without inventing a fallback.
- Restrict manual Share → Add to Home Screen guidance to iOS Safari.
- Make `verify:identity` scan the full active UI source tree for forbidden install copy and assert the native event/click contract. The build must fail if that copy returns.
- When the unwanted screen appears only on a live site but is absent from current source, compare the deployment SHA and service-worker cache namespace before touching install code. Retire stale app-shell caches through the normal versioned service-worker activation path.

## Evidence-led diagnosis and regression prevention — mandatory for every clone

Carry this workflow into every target project's `AGENTS.md` and use it for all future maintenance, not just cloning:

1. **Observed behavior beats assumptions.** Preserve and verify functionality the product owner reports working on real devices. Record observed symptoms separately from a suspected cause.
2. **Complaint means diagnose first.** Compare the deployed version/commit, source, recent commit history, relevant checks and actual browser/device behavior before deciding a defect exists. Reproduce where possible and identify the first proven failure before editing.
3. **Protect unrelated functionality.** Define the requested scope and list protected surfaces. Do not change installation, authentication, service worker/offline behavior, persistence, uploads or other unrelated systems unless evidence shows a dependency or the product owner explicitly authorizes it.
4. **Review the complete diff before pushing.** Compare changed files against the task and approved baseline. An unexplained change to protected behavior blocks release until resolved.
5. **Verify and report honestly.** Inspect actual test/CI outputs and deployment status. Report code/commit, push/merge, checks, deployment, and remaining real-browser/device/offline QA as separate facts.
6. **Stop on surprises.** Diagnose the first failure; avoid speculative stacked fixes. Bundle related work into one reviewed commit where practical. Never force-push or rewrite history without explicit authorization.

Apply these principles alongside the mandatory PWA installation lock. A product-specific task such as changing catalogue cards is not permission to redesign installation or authentication.

## 3. Research current icon and install requirements
Use current primary documentation and inspect the actual rendered/served files before making a change:
- MDN Web App Manifest: https://developer.mozilla.org/en-US/docs/Web/Manifest
- web.dev PWA installation: https://web.dev/learn/pwa/installation/
- Chrome installability guidance: https://developer.chrome.com/docs/capabilities/pwa-install
- Apple iPhone/iPad home-screen web apps: https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios

Check current support for SVG and raster manifest icons rather than assuming all browsers behave identically. Prefer valid, purpose-built 192×192 and 512×512 PNG icons for broad compatibility when the project can produce them; an SVG icon may be retained as an additional scalable icon. Verify each asset's actual dimensions, file type and path. Do not point a PNG declaration at an SVG or list dimensions the asset does not have.

## 4. Reset identity as a controlled change
Update identity consistently across:
- app name, short name, description, metadata, canonical/base URL and social metadata;
- manifest names, start URL, scope, theme/background colors and icon declarations;
- favicon, install icons, Apple web-app title/metadata and social preview media;
- visible copy, page titles, alt text, example links, and iPhone installation guidance;
- service-worker cache names and any app-specific localStorage/session keys;
- environment examples, scripts, docs, tests and identity-verification assertions.

Do not replace install code just to change an icon. Update icon assets and their references as a separate change from install mechanics. Keep the old known-good behavior until the new identity has passed verification.

## 5. Verify before promoting the clone
1. Run `npm run verify:identity`, lint and build.
2. Inspect the built/served manifest URL and parse its actual JSON. Confirm all declared icons resolve with correct content types and dimensions.
3. Confirm the page's install action still retains and invokes the browser's real `beforeinstallprompt` event directly from a user click when supported.
4. Confirm the iPhone guide, referenced illustration/video, embedded-browser handoff, service-worker registration, cache namespace, update/refresh path and offline fallback still work.
5. Test a clean install in desktop Chrome/Android Chrome and iPhone Safari when physical devices are available. A build alone is not proof of installation or offline behavior.
6. Search for leftover source identities, project IDs, hostnames, cache names, icon paths and copy. Do not declare the reset complete while any unintended inherited identity remains.
7. Push the verified changes and report commit, checks, deployment status and remaining device QA separately.

## 6. Operational transparency travels with every project

Every new project and every material workflow improvement must apply [docs/OPERATIONAL-TRANSPARENCY-STANDARD.md](./docs/OPERATIONAL-TRANSPARENCY-STANDARD.md) together with [docs/VISUAL-DIRECTION-STANDARD.md](./docs/VISUAL-DIRECTION-STANDARD.md) and the canonical WashRide reference image. Carry this requirement into the target `AGENTS.md`. Adapt the visible work to the actual business: search/check stages, booking or request lifecycle, upload/payment/message states, staff assignment, customer progress and final outcomes. Wire every state to real data/actions and enforce record ownership and role access. Do not copy sample business content, expose private internals or fabricate progress. See the operational standard for the complete contract.

## 7. Keep scope honest
Iteration 13's service-order page is a local demo. Its localStorage requests, admin edits and analytics are not a shared backend. For a real project, decide its data model and authorization boundary from that project's brief; never present the demo admin as secure real-world administration.


## Adapt the customer account to the target project

Treat the account as a reusable capability set, not fixed Iteration 13 branding. Inspect `src/app/AccountWorkspace.tsx`, the customer order/request data shape, admin request workflow, UploadThing/file endpoints, local persistence and current authentication before editing.

**Research and visual-context gate (mandatory for every clone and account redesign):** search online for the actual target product/category and current account/customer-portal UX patterns before deciding on labels, account extras, gamification, visual motifs or section structure. Prefer official product sources and credible UX research; for dashboard consistency, see [Baymard: Cards dashboard layouts](https://baymard.com/research-articles/cards-dashboard-layout) and [Baymard: Account dashboard UX](https://baymard.com/ecommerce-design-examples/58-account-dashboard). Record the useful product-specific decision briefly in the target project's docs. Do not reuse the reference project's novelty feature merely because it exists in this foundation: Iteration 13 uses a practical project-preparation checklist, not the Tripple S spa garden. Make account sections one coherent design system (same card surface, spacing, heading hierarchy, label treatment, borders, controls and responsive behavior); vary content only when hierarchy or task importance calls for it. Prefer a useful, product-native tool over decorative gamification, and omit optional extras when research does not support them.

Preserve relevant capabilities and fit them to the product:
- Customer request/order history, status explanations and obvious next actions.
- A request-specific conversation where customer messages and staff/admin replies are visible to the correct sides.
- Attachment sharing with explicit file-type, size, connection and progress/error feedback.
- Optional project-appropriate progress aids or small interactions only when research and the actual product context justify them. Do not default to gamification or carry the spa garden/game theme into unrelated products. If no contextual extra is useful, omit it rather than forcing a novelty widget.
- A lightweight journal, saved preferences, offers, reminders or other account extras only when they make sense for the project.
- Offline access to cached app shell and honestly supported local drafts/state, with clear separation from server synchronization.

For the Iteration 13 prototype, the customer and admin share localStorage on one browser profile. Messages and status updates work in that local demo thread but are not sent to a real admin, email address or other device. Text/local changes can be tested offline after the app shell is cached. UploadThing attachments require internet; the current endpoint accepts images up to 4 MB, PDFs up to 4 MB and videos up to 16 MB. Offline attachments are not queued.

For production adaptations, implement the target project's authenticated persistence and record ownership checks; authorize admin replies on the server/security-rule boundary; choose whether uploads are private/public and apply matching access controls; and implement actual notification delivery only if configured. Do not label localStorage as a customer account, secure journal, remote communication, or cloud backup. Keep account creation proportionate and preserve anonymous identity when linking credentials if that is part of the existing app.

Before QA handoff, verify: empty account, matching/non-matching email, multiple requests, status changes, customer message → admin reply → customer sees reply, upload success/failure and size limits, offline text/state persistence, offline upload messaging, mobile/keyboard usability, and that the account's game/copy/assets match the target project rather than inherited demo content.
