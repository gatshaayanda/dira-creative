# Operational Transparency Standard — Show the Work, Not Theatre

**Purpose:** make genuine application activity, progress, decisions and outcomes understandable to the people using the product. This standard applies alongside the canonical visual reference in [VISUAL-DIRECTION-STANDARD.md](./VISUAL-DIRECTION-STANDARD.md); neither replaces the other.

## Core principle

People value a service more confidently when they can understand what is happening on their behalf. Research on the “labor illusion” and service transparency (including Buell and Norton’s online-search experiments) suggests that revealing meaningful work can improve perceived value and trust, even when the final result is unchanged.

Translate that insight into useful product behavior: **show the real work that helps the user, at the moment it matters, in language they understand.** Do not slow work down, invent activity, expose internal reasoning, or add decorative progress purely to make software look busy.

## 1. Where transparency belongs

Apply it across relevant customer, staff and administrator journeys—not just on a homepage or one loading screen.

- **Discovery and search:** when the system searches or compares real options, show the meaningful stages (for example, searching providers, checking dates, comparing available options) and then the actual result. The labels must correspond to real requests or computations.
- **Booking, orders and enquiries:** show what has been received, validated, saved, assigned, reviewed, confirmed or still needs action. Distinguish a request from an accepted booking, quote, order or payment.
- **Uploads and documents:** show the actual upload state, file name where safe, progress when measurable, completion or a useful failure/retry path. Never imply an upload completed when it did not.
- **Payments and receipts:** distinguish initiated, pending, verified, failed, refunded and settled states according to the payment provider/backend evidence. Never infer payment from a button click or screenshot.
- **Customer accounts:** show the customer's own records, current status, last meaningful update, responsible next step and any action required from them.
- **Staff/admin workspaces:** show incoming work, ownership/assignment, priority where justified, status, last activity, outstanding actions and the result of staff changes. Customer and staff views should describe the same underlying record consistently.
- **Background work and integrations:** expose useful states such as connecting, syncing, processing, retry required, delayed or unavailable only when the underlying integration supports those states.
- **Handover and maintenance:** summarize delivered capabilities, tested workflows, known limits, operational ownership and what ongoing support actually includes.

Do not force a progress display into instant actions. A concise confirmation is better than an unnecessary spinner when work is effectively immediate.

## 2. Truthful loading and progress

Use the following rules for any loading, searching, saving, processing, uploading or synchronization experience.

1. **Describe the actual operation.** Prefer “Checking appointment availability” over “Please wait”. Use sequential stage labels only when the application really performs those stages.
2. **Use determinate progress only when measurable.** A percentage or progress bar must be derived from real completed work, known totals, bytes transferred or a reliable task state. Never animate a percentage to create an illusion of progress.
3. **For indeterminate work, say what is happening.** Use a calm activity indicator and a concise live status. If work takes longer than expected, explain the delay honestly and offer a safe retry/cancel path where supported.
4. **Keep the user oriented.** State what triggered the work, what is being checked or changed, and what happens next. Preserve entered information when a retry is safe.
5. **Finish with an outcome.** Report what completed, what failed, what remains pending and the next useful action. A spinner disappearing without an outcome is not enough.
6. **Respect reduced motion and accessibility.** Use semantic status/live regions, do not rely on animation or color alone, avoid disruptive movement, and keep screen-reader announcements concise rather than repeating every tick.
7. **Do not delay completion.** Never add artificial waiting, staged fake steps, fake typing, fake queue positions or fake progress. The system should remain as fast as it can be.

## 3. Operational status is a real product feature

For meaningful multi-step work, model the lifecycle explicitly rather than deriving status from decorative UI.

- Define valid states and transitions for the real business process.
- Record authoritative events from the backend or trusted action handler; include timestamps and responsible actor/system where appropriate.
- Display the current state, what it means, the most recent meaningful update and the next action or owner.
- Make status changes visible to the correct customer and staff users through the intended shared data path.
- Keep pending, accepted/confirmed, in progress, completed, cancelled, failed and needs-information states distinct where the domain requires them.
- Provide history/audit context for consequential changes such as assignment, quote approval, payment verification or cancellation.
- Use notifications only when delivery is implemented; an in-app status change is not proof that an email, push or WhatsApp message was delivered.

A status label is not operational transparency if the underlying action does not work. Connect it to real persistence, authorization and business logic.

## 4. Translate engineering into user value

Explain technical capabilities through the outcome they enable.

| Technical work | User-facing meaning |
| --- | --- |
| Database relationships and validation | The right customer, request, service and transaction stay connected |
| Authentication and authorization | People see and change only the records they are permitted to access |
| Availability/search integrations | Users can see which options were actually checked |
| Upload pipeline | People can see whether their files arrived and what to do if they did not |
| PWA and offline support | The app can be installed and previously cached content may remain available; unsent work is clearly identified |
| Notifications and messaging | Users can see whether a message was saved, queued, sent or delivered—only to the extent the provider confirms it |
| Analytics and monitoring | Owners can understand actual usage and service health without exposing private customer data |
| Admin CRUD and workflow automation | Staff can act on real records and customers can see the resulting changes |

Use plain language and show a working demonstration wherever practical. Do not overwhelm customers with infrastructure jargon or reveal sensitive implementation details.

## 5. Privacy, security and honest boundaries

Transparency is not indiscriminate disclosure.

- Show each customer only their own records and permitted activity; show staff only the data their role authorizes.
- Never expose secrets, access tokens, internal prompts/reasoning, private notes, security rules, raw logs, other customers' data or sensitive integration payloads.
- Summarize system activity at the level useful to the user (for example, “Checking available appointment times”), not by exposing internal queries or confidential provider responses.
- Clearly distinguish local-only demo state, browser cache, server-persisted state, cross-device sync and offline-queued work.
- If a backend cannot confirm an action, say it is unconfirmed. If connectivity is lost, preserve data where safe and state whether it was saved locally or remotely.
- Do not invent service-level commitments, completion estimates, availability, customer outcomes, payment states, staff assignments or delivery confirmations.

## 6. Compact visual treatment

Operational visibility must follow the visual reference and remain concise.

- Use compact timelines, progress rows, status chips, event lists, activity summaries and inline feedback where they fit the task.
- Put the most useful current state and next action first; reveal detailed history progressively.
- Keep customer-facing copy reassuring and plain. Keep admin information denser and more actionable.
- Use the project's own visual identity, imagery, typography and spacing. Do not copy the reference business's branding.
- Avoid large dashboards, noisy activity feeds, redundant cards, full-screen loading overlays for minor work and repeated explanations.
- Keep loading and status components consistent across routes so users learn what states mean.

## 7. Required design and QA checklist

For each meaningful workflow, ask:

1. Can the user tell what the system is doing while they wait?
2. Are displayed steps and progress tied to real operations?
3. Can they tell whether the action succeeded, failed, is pending or needs them?
4. Is the next action clear, including a safe retry where appropriate?
5. Do customer and staff views reflect the same authoritative record?
6. Are timestamps, actor and history available for consequential changes?
7. Are privacy, authorization and local/offline boundaries respected?
8. Does the experience remain compact, accessible, responsive and consistent with the canonical visual reference?
9. Does the feature still work end to end without relying on decorative UI?
10. Have empty, slow, timeout, offline, retry and error paths been checked?

## 8. Reusable handoff evidence

Every client delivery should include a concise, evidence-based summary of:

- The business problem and user journey addressed.
- The working capabilities delivered and where to find them.
- The real operational workflows and status transitions.
- Infrastructure/integrations established, described in outcome language.
- Tests and QA actually completed, with device/deployment checks clearly separated.
- Known limitations, required owner actions and support coverage.

Progress summaries must come from actual project tasks/checkpoints. Do not invent percentages, completed milestones or dates. The purpose is to make real work legible—not to manufacture the appearance of work.

## Dira Creative live activity and Firebase telemetry

The admin dashboard records privacy-limited customer journey events in the customerJourneyEvents collection. Current events are public storefront visits, catalogue views, project enquiry flow opens, service/package selections, and submitted enquiries. Events are written through /api/analytics/journey after Firebase ID-token verification using the approved Dira Admin SDK project. Staff/admin accounts are excluded from customer activity.

Analytics payloads contain only the anonymous Firebase UID, event name, timestamp, and bounded catalogue item identifiers/names/types. They must never contain customer names, email addresses, phone numbers, project briefs, attachments, or payment information. Analytics failures must never block browsing or enquiry submission.

The dashboard's 25 GB reference meter is deliberately labelled as an estimated tracked event payload footprint. The server measures the UTF-8 JSON payload size of each analytics event before writing it. This is not a Firebase Console quota/billing meter and does not represent total Firestore storage, indexes, reads, writes, bandwidth, attachment storage, or infrastructure overhead. Never describe it as total Firebase usage. Actual project-wide usage must be checked in Firebase/Google Cloud usage and billing reports.

Required deployment configuration is the existing Dira server-side FIREBASE_PROJECT_ID and FIREBASE_ADMIN_KEY, with the approved project ID the-wall-ab746. Firestore rules must permit owner/staff reads of customerJourneyEvents; the current rules already do. Writes are performed server-side with Admin SDK, not directly by the browser. If configuration or Firestore access is unavailable, the admin shows an analytics availability message and customer journeys continue normally.
