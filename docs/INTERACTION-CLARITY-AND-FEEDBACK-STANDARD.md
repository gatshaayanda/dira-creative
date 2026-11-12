# Interaction Clarity & Feedback Standard

**Status: mandatory across all portfolio projects.** Apply this standard to customer, staff, admin, account, booking, ordering, messaging, settings and utility interfaces. It complements the Visual Direction, Operational Transparency, Change Safety and Accessibility requirements; it does not replace them.

## 1. Core acceptance rule

A control is not well designed merely because it works when clicked. A first-time user must be able to recognise what is interactive, understand what it will do, perceive its current state, and know what happened after using it—without guessing, hovering, remembering a transient message or repeatedly checking.

Design for recognition rather than recall. Make the next useful action visible at the point it is needed.

## 2. Affordances and signifiers

- Navigation uses links; in-place actions use buttons. Do not use clickable generic containers when semantic controls are available.
- Make the full intended hit area interactive. A tiny arrow, icon or text fragment must not be the only active region of a card or tile.
- Before hover, interactive elements must look interactive: clear button treatment, bordered/raised tile, filled surface, tab shape, underlined link or another recognisable convention. Do not make actions look like static body copy.
- Pair ambiguous icons with concise labels. Use directional/action cues such as “View”, “Open”, “Continue”, “Edit” or “Track” where the result is not self-evident.
- Show consistent hover, pressed, keyboard-focus, selected, loading and disabled states. Hover is supplementary; it cannot be the only signifier.
- Make the outcome predictable. “Delete”, “Send”, “Pay”, “Book” and “Confirm” must describe the actual operation—not an intended future step.
- Avoid dead-end controls, decorative arrows that imply navigation without a destination, and clickable-looking elements with no action.

## 3. Visual hierarchy, contrast and touch

- Establish one clear primary action per screen or decision area; secondary actions should remain visibly secondary.
- Keep related information grouped, but give distinct tasks and sections enough separation to scan. Avoid both cramped clusters and excessive empty space.
- Use readable text sizes, line lengths and spacing. Avoid low-contrast placeholder text, tiny metadata carrying essential meaning, and text placed over busy imagery without a sufficient overlay.
- Meet WCAG 2.2 AA contrast: at least 4.5:1 for normal text and 3:1 for large text; meaningful non-text controls and states need at least 3:1 against adjacent colours. Check actual foreground/background pairs rather than assuming a brand colour is accessible.
- Never communicate status, selection, errors or availability through colour alone. Pair colour with text, icon, shape, border or position.
- Make touch targets at least 24×24 CSS px under WCAG 2.2 AA (with spacing as required); prefer approximately 44–48 CSS px for primary touch controls where practical. Avoid tightly packed adjacent actions.
- Preserve visible focus, logical keyboard order, semantic headings/labels, accessible names, reduced-motion preferences and screen-reader status announcements.
- Check layouts at narrow mobile widths first, then larger mobile/tablet and desktop. Desktop hover must not be required to discover mobile actions.

## 3A. Text readability is non-negotiable

- Normal customer-facing text and control labels must be at least 14 CSS px. Supporting metadata may be 12 CSS px only when genuinely secondary; essential prices, instructions, dates, statuses and actions must never be tiny metadata.
- Full service/product descriptions must remain visible in customer cards. Do not apply CSS line clamping, fixed-height clipping, ellipsis or overflow hiding to essential catalogue content. Let cards expand naturally.
- The customer catalogue must show the complete price (or an honest "From" / "Price on request" label) before the customer opens a request form.
- Use WCAG 2.2 AA contrast: 4.5:1 for normal text, 3:1 for qualifying large text, and 3:1 for meaningful non-text controls. Verify real colour pairs, including placeholders, focus, selected, disabled, error, success and hover states.
- Brand colour customisation must preserve readable foreground/surface contrast. Never allow a customer-selected accent to make body copy, prices, navigation or button labels disappear.
- Do not solve crowding by shrinking type or clipping copy. Remove redundant content, reduce decoration, reorganise layout or allow vertical scrolling.

## 4. Feedback is part of the operation

Every meaningful action needs an observable, truthful response.

| User action/state | Required feedback |
| --- | --- |
| Navigation | Destination loads; current section/page is identifiable |
| Selection/filter | Selected state is visible and results update |
| Form validation | Error appears beside the relevant field; summary where useful; entered data remains |
| Submission/save | In-place progress/disabled duplicate-submit state, then durable confirmation or actionable error |
| Upload | File name/type/size, progress, completion and failure/retry state; never imply upload before server confirmation |
| Payment/booking | Explicit pending vs succeeded vs failed state; receipt/reference only after verified success |
| Long-running task | Persistent progress or activity record with a real state source; no invented percentage |
| Message/reply | Clear sending/sent/failed state and durable thread history |
| Background work | Visible activity and final outcome; explain when the user must act |
| Disabled action | Visible disabled state and a concise reason where the reason is not obvious |
| Empty account/list | Explain why it is empty and show the next useful action |
| Connectivity failure | State what did and did not save; provide safe retry/recovery |

- Prefer inline status, contextual banners, durable confirmation panels, updated records, activity timelines and notification centres.
- Preserve a successful submission reference and next step on screen; do not make the user depend on remembering a toast.
- Never report success before the data operation has succeeded. Distinguish local draft, queued, submitted, received, reviewed, quoted, confirmed and completed states accurately.
- Errors must explain the problem in user language and offer a recovery action where possible. Do not clear form data after a failure.
- Avoid duplicate submission and ambiguous retry behavior. Idempotency and server-side state matter for high-impact actions.
- Announce dynamic status updates accessibly (for example, appropriate status/alert semantics) without moving focus unexpectedly.

## 5. Toast policy

**Toasts are not the default feedback pattern and must never be the sole channel for important information.**

Transient messages disappear, can be missed, may interrupt screen-reader users and are poor places for references, validation, booking/payment outcomes or required next steps.

Use a toast only for a low-consequence, supplementary acknowledgement when all of the following hold:
1. Missing the message causes no loss, risk or uncertainty.
2. The same state is available persistently in the interface or activity history.
3. It does not contain the only copy of a reference, error, required action or irreversible outcome.
4. It is announced accessibly and does not steal focus.

Prefer inline confirmation or error states for forms; persistent banners for important system conditions; request/order timelines for workflow updates; and a notification centre for messages and asynchronous events.

## 6. Customer-account application

A customer account is a useful workspace, not just a sign-in screen or a list of submitted forms. Adapt it to the real product and its data/security model. Where supported, help customers:
- See their own profile and contact details, and understand how to update them.
- Find their complete request/order/booking history with useful filters and search.
- Understand each item's current status, last update, what it means and the next expected action.
- Open a detail view with the original brief, dates, scope, quote, receipt or documents appropriate to the product.
- Communicate with the responsible team in the context of a specific request, with durable message history and clear sent/failed state.
- Share or retrieve relevant files where a secure, supported upload path exists.
- Manage notification preferences and return to the next useful action.

Do not copy Iteration 13's demo-specific garden, game, journal or sample content into another business. Select only extras that solve a genuine customer need. Keep authentication proportionate, scope every record to the authenticated customer, and enforce ownership at the backend/security-rule boundary. Never imply cross-device sync, live messaging, email delivery, offline upload or account recovery unless implemented and verified.

## 7. Operational transparency and psychology

Use the following principles as design checks, not as excuses to manipulate customers:
- **Recognition over recall:** show available actions, status meanings and next steps in context.
- **Visibility of system status:** acknowledge meaningful actions and expose genuine progress/outcomes.
- **Match with the real world:** use the customer's language and explain internal workflow terms.
- **Error prevention and recovery:** validate early, preserve entered data and make safe recovery obvious.
- **Consistency and standards:** reuse established control patterns and status language across the product.
- **Information scent:** labels and cues should let users predict where a control leads.
- **Progressive disclosure:** reveal detail when needed without hiding essential status, price, risk or next action.
- **Cognitive load:** group related fields, remove redundant copy and avoid asking customers for information already held.
- **Trust through truthful status:** distinguish enquiry from booking, quote from payment, upload selection from completed upload, and message draft from delivered message.
- **User control:** allow safe back/cancel/edit actions and explain irreversible actions before they occur.

Do not use urgency tricks, false scarcity, fake activity, manipulative defaults or gamification that obscures the real service outcome.

## 8. Mandatory QA checklist

Before accepting any major customer or staff screen, inspect the real running interface at mobile and desktop sizes and verify:

- [ ] Can a first-time user identify every actionable element before hovering?
- [ ] Are navigation links and action buttons semantically correct?
- [ ] Is the whole intended card/tile target interactive and keyboard reachable?
- [ ] Are primary and secondary actions visually distinct?
- [ ] Are normal text, large text and control boundaries contrast-checked?
- [ ] Are touch targets comfortably sized and separated?
- [ ] Are focus, hover, pressed, selected, disabled and loading states visible?
- [ ] Does each meaningful action show a truthful, contextual and persistent outcome?
- [ ] Are errors recoverable without losing entered information?
- [ ] Is any toast supplementary rather than the sole record of an important event?
- [ ] Are empty, loading, offline, success and failure states designed?
- [ ] Can the customer understand the status and next step without contacting support?
- [ ] Are customer records, messages and files correctly scoped and protected?
- [ ] Have the end-to-end customer and staff journeys been checked, not just isolated components?
- [ ] Have screenshots been inspected at mobile-first and desktop widths?

A code review, successful build or green CI does not replace visual or end-to-end QA. Report untested items honestly.

## 9. Research and reference sources

Use current primary guidance when applying or updating this standard. The following references informed this edition:

- Nielsen Norman Group, [Signifiers: Design Elements That Make Affordances Clear](https://www.nngroup.com/articles/signifiers/): distinguish an available action from the visual cue that communicates it.
- Nielsen Norman Group, [Recognition Rather Than Recall](https://www.nngroup.com/articles/recognition-and-recall/): reduce memory burden by keeping options and context visible.
- W3C, [WCAG 2.2](https://www.w3.org/TR/WCAG22/): measurable contrast, target size, focus visibility, error identification and accessible status messages.
- Google, [Material Design — Accessibility](https://m3.material.io/foundations/accessible-design/overview): accessible components, hierarchy, contrast and interaction.
- GitHub Primer, [Toast component guidance](https://primer.style/product/components/toasts/): use persistent/contextual feedback instead of relying on transient notifications.
- UK Government, [Notification banner](https://design-system.service.gov.uk/components/notification-banner/): persistent, contextual notification pattern for important messages.

When a cited page changes or is unavailable, re-check the current guidance rather than treating this source list as immutable. This document is the canonical portfolio policy; project-specific AGENTS files should link to it and record only their local implementation decisions.
