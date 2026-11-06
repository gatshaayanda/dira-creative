# Iteration 13 — Reusable PWA Foundation Contract

## Fast handoff for future implementation chats
- **Golden baseline:** [GOLDEN-BASELINE.md](./GOLDEN-BASELINE.md) records protected behavior, recovery policy and new-project adaptation steps. Do not casually move or develop on the golden reference branch.
- **Installation lock:** [docs/PWA-INSTALLATION-LOCK.md](./docs/PWA-INSTALLATION-LOCK.md) is mandatory before any PWA/install change and must be carried into every clone. Installation behavior is frozen during routine identity, styling and feature work.
- **Repository role:** Iteration 13 is the portfolio's engineering standards, architecture and SOP reference. It is not the default cloning source. New-project source selection is governed by `CLONING.md` and `docs/ADMIN-HUB-APP-FACTORY-SOP.md`: use `gatshaayanda/africhiko` by default unless the product owner names or approves another source. Existing projects are improved in place.
- **Mandatory first read:** [START-HERE.md](./START-HERE.md). Every new implementation chat must start there and follow its reading order; never ask the product owner which docs to inspect.
- **Visual direction (mandatory):** read [docs/VISUAL-DIRECTION-STANDARD.md](./docs/VISUAL-DIRECTION-STANDARD.md) AND open `docs/assets/washride-home-reference.jpeg` before planning, implementing or reviewing any visual/page design. The image is the canonical persistent reference; do not ask the product owner to re-upload it or rely on prose summaries. Apply its composition, hierarchy and finish—not its car-wash branding or literal styling—to the target product.
- **Operational transparency (mandatory):** read [docs/OPERATIONAL-TRANSPARENCY-STANDARD.md](./docs/OPERATIONAL-TRANSPARENCY-STANDARD.md) before implementing or reviewing meaningful loading, search, booking, order, enquiry, upload, payment, messaging, account, admin, background-job or handover workflows. Show genuine activity and outcomes; never fake progress or expose sensitive internals.
- Then read FOUNDATION-BLUEPRINT.md, README.md, and CLONING.md as directed by START-HERE. These files serve different purposes; do not substitute chat summaries for them.
- Read CHAT-WIDGET-RESEARCH.md before adding a chat helper. The current deterministic adaptation lives in src/app/ServiceGuide.tsx; that file separates the Sparkle Legacy reference from research-backed recommendations.
- Before claiming a fix is complete, run the repository's available checks, inspect their actual output, and verify the exact commit/deployment state. A GitHub edit or merge alone is not a build verification. Never weaken or remove install regression checks to make a build pass.
- README is the customer/admin demo walkthrough. Do not assume an earlier conversation summary is newer than the repository.
## Purpose
Iteration 13 is the standards/reference repository and a working prototype that demonstrates responsive customer journeys, browser-local demo workflows, protected PWA installation, iPhone guidance, offline behavior, and staff/admin patterns. It is not the mandatory cloning source for new projects. The service catalogue is sample content, not a real business offering.

## Portfolio source-selection contract

- The product owner chooses the source repository for each new project. Use the exact repository they name; inspect it and recommend changes only after evidence-based comparison. Never silently substitute Iteration 13 or another repository.
- If no source is named, `gatshaayanda/africhiko` is the default starting point for new customer-facing PWAs and Admin Hub applications. Confirm the current repository state before cloning.
- Iteration 13 is the standards, architecture and SOP reference—not the default cloning source. Apply its reusable standards without assuming its demo architecture or features belong in every client app.
- If the product owner asks for a source recommendation, compare relevant portfolio repositories by industry, customer journey, admin workflows, architecture, integrations, protected behavior, visual quality and adaptation risk. State the recommended source and material risks before cloning.
- Existing projects are improved in place. Never reclone or replace an established implementation merely to adopt a different foundation.
- Clone only into the intended empty local directory, connect the new working copy to the new client remote, and establish a clean baseline safely. Inspect a non-empty destination/remote; never force-push or overwrite it.

## Source of truth and workflow
- Product owner / final reviewer: the user. Implementation: ChatGPT.
- GitHub is the source of truth. Inspect the actual branch, latest commit, working tree, instructions, routes, service worker, install code and tests before changing them.
- Existing project workflow: START → INSPECT → BUILD → VERIFY → CHECKPOINT. Keep inspection proportional; do not endlessly re-audit a repository whose context is established.
- Unexpected result: STOP → inspect actual state → identify the first failure → fix → verify.
- Preserve successful behavior. Prefer focused changes over rewrites. Never claim a test, deployment, device test, offline write or Firebase workflow passed without evidence.
- When authorized, push changes to `main`. The user handles Vercel deployments unless explicitly delegated.

## New-project documentation handoff

Every new client repository must receive a project-specific `AGENTS.md` before substantial implementation. It must describe the actual source lineage, product identity, architecture and data flows, customer/admin journeys, authentication and authorization boundaries, integrations, setup requirements, known limitations, protected features/files, PWA installation and chatbot locks, verification commands and the latest verified checkpoint. Carry forward only protections that exist in the selected source or are explicitly required by the product owner; do not falsely claim that a feature exists. Update the file when material decisions or verified behavior change. The client repo's own code and instructions then become its source of truth.

## Evidence-led change and regression-prevention protocol

Apply this protocol to every feature, bug report, visual complaint, install issue, and project adaptation. It is a default for every project cloned from this foundation.

1. **Observed behavior beats assumptions.** A product owner's report that a feature works on a real device is evidence to preserve and verify in context—not an invitation to rewrite it. Record what was observed, on which version/device/path when known, separately from any suspected cause.
2. **A complaint starts diagnosis, not automatic repair.** Before changing code, compare the deployed version/commit with the current source and recent commit history. Reproduce or inspect the relevant browser/device behavior when possible. Identify the first proven failure and the smallest affected surface; do not treat a proposed cause as a fact.
3. **Protect unrelated functionality by default.** Define the task's scope and mark protected/working behavior before editing. A product-card task does not authorize install, authentication, service-worker, offline, persistence, upload, or routing changes unless evidence demonstrates a dependency or the product owner explicitly authorizes them.
4. **Review the proposed diff before pushing.** Inspect changed files and behavior against the task and approved baseline. Check protected files, event lifecycles, identity/configuration, and side effects. Any unexplained protected-file change is a stop-release condition: revert or justify it with evidence before continuing.
5. **Verify the actual result.** Run focused tests and the available type/lint/build/CI checks; inspect their actual outputs. Check the deployed commit and status when accessible. Report separately: code changed and commit created; changes pushed/merged; checks actually run and results; deployment status; and browser/device/offline QA still required. A commit, green CI, or successful push is not proof of live deployment or real-device behavior.
6. **Unexpected result: stop and find the first failure.** Do not stack speculative fixes. Compare source, commit, deployment/cache state, protected implementation and browser evidence; repair the first proven cause, then rerun relevant checks.
7. **Keep the release focused.** Bundle related changes into one reviewed commit where practical. Never force-push or rewrite history without explicit authorization. The product owner handles Vercel deployment unless they delegate it.

These rules complement—not replace—the PWA installation lock and other project-specific protected contracts. Preserve known-good installation and chatbot behavior unless an explicit authorized task and evidence require a narrowly scoped change.

## Reusable product principles
- Customer action first. Make the next step obvious, reduce unnecessary navigation, and keep copy concise.
- Mobile-first, accessible, legible UI; WCAG 2.2 AA contrast is the baseline. Apply compact, task-focused information density across every surface—not only the homepage—including booking, customer account and admin pages. Avoid oversized headers/cards, redundant welcome/hero sections and unnecessary vertical whitespace; keep operational information scannable without making controls cramped. Verify keyboard focus, narrow layouts, empty/error/loading states and touch targets.
- For visual planning and QA, follow `docs/VISUAL-DIRECTION-STANDARD.md`; its compactness requirement applies to all routes and screen types, while visual identity remains industry-specific.
- Real workflows over decorative controls. Validate forms, persist state, expose useful feedback, and make admin changes visible to the customer view. Use visible press/focus states and accessible, dismissible toasts for meaningful outcomes; never claim a local write succeeded unless localStorage accepted it. Avoid JavaScript alert/confirm for routine UX.
- Keep account creation proportionate. Let customers explore before requesting credentials unless a real product requirement demands otherwise.
- Minimize Firebase reads/writes. Do not change Firebase config, rules, collections or production data without explicit instruction.
- Keep demo data, project-specific requirements and unverified ideas distinct. Local browser storage is not shared persistence, authenticated access, a server database or cloud synchronization.

## Operational transparency — show genuine work and outcomes

- Apply `docs/OPERATIONAL-TRANSPARENCY-STANDARD.md` to every relevant customer and staff/admin workflow. It complements the mandatory WashRide visual reference; both standards apply together.
- Make genuine work legible at the moment it matters: what is being searched, checked, saved, uploaded, reviewed, assigned, processed or completed; what actually happened; and what the next useful action is.
- Drive progress, statuses, timestamps and activity history from real handlers, persisted records or authoritative integration responses. Never invent stages, percentages, queue positions, completion estimates, payment confirmation, message delivery or background activity.
- Distinguish requested from confirmed, local from remote, cached from synced, pending from completed, and sent from delivered. State offline and integration limits honestly.
- Keep the experience compact and accessible. Customer views explain their own record and next step; admin views expose actionable operational context. Enforce privacy and role/record authorization before showing activity.
- For instant work, use concise confirmation instead of theatrical loading. Never slow a system down to make effort appear greater.

## Demo behavior
- The customer service-order demo on `/` uses localStorage intentionally so a reviewer can submit an order without Firebase credentials.
- Demo services, prices, media URLs, announcements, customer requests and statuses are editable locally. The admin demo is a prototype control surface, not a security boundary and not suitable for real customer data.
- The requested timeline date is a customer preference, not a confirmed delivery commitment. No payment is taken.
- Never describe local-only changes as synced to a server or shared with another device.
- Preserve the PWA pattern lab at `/patterns`, the iPhone installation guide at `/iphone-install`, and the existing offline guide.

## Installation — protected, do-not-touch-by-default behavior

### Regression stop rule — install UI is not up for redesign
- Never add a desktop/Android install explainer, browser-menu walkthrough, fake prompt, fallback modal, or “Continue on the website” install screen. That exact class of regression is prohibited.
- The only desktop/Android install UI is the branded CTA shown while a real, retained `beforeinstallprompt` event is available; its click must call the event's `prompt()` immediately. If the event is absent, show no install CTA. iOS Safari alone may show the Share → Add to Home Screen guide.
- For branding work, edit icon files and identity metadata only. Do not edit `src/app/pwa-register.tsx`, the early capture script in `src/app/layout.tsx`, or install visibility/event handling unless the product owner explicitly requests an install-mechanics change.
- The identity verifier must scan all active UI source files for forbidden generic install copy, not just the primary PWA component. A check that passes only because it scans one file is insufficient.
- If a user sees install UI that is absent from source, inspect the actual deployed commit and service-worker cache version first. Bump the app's cache namespace when a stale shell must be retired; do not rewrite a working prompt to mask stale deployment/cache state.
**The install flow is a protected foundation primitive, not a design component.** For branding, icon, color, typography, layout, copy, catalogue or account work, do not edit the install runtime or its event flow. Change only the relevant icon assets and metadata references. Any install-mechanics change requires an explicit product requirement, a focused diff, checks, and browser QA.

- Preserve the early `beforeinstallprompt` capture in `src/app/layout.tsx`, the retained one-shot event, the `iteration13-open-install` click event, and the user-initiated call to the native browser prompt in `src/app/pwa-register.tsx`.
- **Native prompt first:** when the browser supplies `beforeinstallprompt`, retain it and invoke `prompt()` directly from the user's branded install click. Do not consume it during page load, defer the call behind another user interaction, or replace it with a custom imitation.
- **No generic install explainer/modal on desktop or Android.** The install CTA is visible only when a retained native prompt is available. If the browser has not offered a prompt, do not display a dead CTA or a modal telling users to use the Chrome/Edge menu.
- **iOS exception:** because iOS Safari does not provide `beforeinstallprompt`, show concise Share → Add to Home Screen guidance only in iOS Safari. Do not show that manual guide as a substitute on desktop or Android.
- Keep the blocking embedded-browser handoff and `/iphone-install` Safari guide, including referenced media assets. A social referrer alone is not proof that the page is inside an embedded browser.
- Inspect both `public/manifest.webmanifest` and `src/app/manifest.ts` before changing manifest output. Verify which manifest Next.js actually serves; do not assume similarly named files are interchangeable.
- Change icon artwork separately from install mechanics. Keep valid manifest icon paths, MIME types, purpose and supported sizes. Do not delete or rename an icon until every reference is updated and the built manifest/assets have been checked.
- Keep service-worker cache namespaces scoped to Iteration 13. Preserve update detection, the visible refresh action, offline fallback and existing privacy boundaries. Do not cache private Firebase responses as public content.
- `npm run verify:identity` guards install-flow invariants and runs as part of `npm run build`. After any PWA asset/metadata change, run identity verification, lint and build; inspect the served manifest/assets. State that real Chrome/Android and iPhone/Safari testing remains for the product owner unless it was actually performed.
- **If installation regresses, do not improvise a new install UI.** Stop and inspect `main`, the deployed commit, `src/app/layout.tsx`, `src/app/pwa-register.tsx`, `src/app/pwa.css`, `src/app/install-card.css`, both manifest declarations, icons, `public/sw.js`, and verifier output. Compare the native prompt/card behavior to the approved Africhiko implementation and Iteration 13's tested platform paths. Fix the first proven failure, strengthen the guard if it missed the regression, then run the full checks. Restore the last known-good behavior instead of adding another prompt, modal, fallback, or listener.

## Verification and reporting
Run `npm run verify:identity`, `npm run lint`, and `npm run build` when the available environment permits. Report the exact commit/branch, checks actually run, deployment status separately, and concise QA steps. A successful GitHub push does not prove a successful Vercel deployment.


## Service Guide integration contract
- \`src/app/ServiceGuide.tsx\` is a scripted navigation assistant for this prototype, not AI or live support. Read \`CHAT-WIDGET-RESEARCH.md\` and the “Deterministic Service Guide” section in \`FOUNDATION-BLUEPRINT.md\` before adapting it.
- Keep its customer/admin actions wired to the existing page state and real handlers. Do not duplicate forms/data, invent completed actions, or make the guide required for the primary journey.
- Preserve conservative dismissible teaser behavior, mobile safe areas/dynamic viewport, keyboard/Escape support, reduced-motion styles, session-only history and truthful local/offline wording.
- In a new project, replace demo labels and actions with project-specific workflows, verify authorization for admin actions, and only add network/AI/human handoff integrations when explicitly designed and genuinely implemented.


## Customer account workspace adaptation contract

- The reusable account implementation is `src/app/AccountWorkspace.tsx`, integrated with `src/app/page.tsx`. Preserve and build on its useful account-holder capabilities: request/order history and status, email filtering, project-specific progress/gamification, a lightweight journal, a per-request customer ↔ admin conversation, and image/video/PDF attachments where the target project's upload rules allow them.
- For every new project and every existing project whose account is being improved, inspect that project's real customer journey, data model, authentication, staff/admin workflow, upload endpoints, offline strategy and privacy/security rules first. Then research the target product and audience online before choosing account extras, interaction metaphors, terminology, hierarchy or visual treatment. Use primary product sources and credible UX research (for example, Baymard's account/dashboard consistency guidance) where relevant; cite/record useful findings in project docs. Replace Iteration 13 labels, sample services, journal prompts, status names and helper copy with the target project's own context. Do not transplant a spa garden, game, prices, treatments, customer messages or business-specific content unchanged. Theme-specific extras are optional: choose something genuinely useful for this product, or omit gamification entirely.
- The account should help a customer take the next useful step: see their own history, understand status versus confirmation, message the responsible team on a specific request, share relevant files, and return to supported project-specific extras. Keep sign-in proportionate and never reveal another customer's records.
- In this prototype, request data, conversation messages, statuses, garden progress and journal notes are browser-local. Customer and admin communication is a same-browser demo thread only; it is not email, live chat, a remote inbox, or cross-device sync. File attachments upload to UploadThing only while online (images/PDFs max 4 MB; videos max 16 MB); they are not queued offline. Never claim otherwise.
- When adapting to a real production app, replace local-only account state with a verified authenticated data path, enforce ownership and staff authorization at the server/security-rule boundary, and connect messages/notifications to a real team inbox only when the backend and delivery path are implemented and tested. Do not weaken security rules or expose all requests to make the UI work.
- Keep optional account extras and their data collection proportionate. Gamification should be playful and project-specific, never a misleading health, performance or customer-worth score. Journal privacy and retention must be stated truthfully.
- Verify customer-created messages/files are visible to the authorized staff workflow, staff replies/status changes return to the correct customer view, invalid/oversized files fail clearly, and offline text/local-state behavior is distinct from online upload or remote delivery. Update `README.md` and `CLONING.md` with any project-specific limits.
