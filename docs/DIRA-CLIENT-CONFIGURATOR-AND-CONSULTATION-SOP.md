# Dira client configurator and consultation SOP

## Customer journey
1. A customer chooses a package or service on the public Dira storefront.
2. The selected catalogue ID is carried into /account; the customer does not leave the account to configure the offer.
3. The account presents the selected package as the starting point. The customer can switch packages, include/exclude listed package components, add catalogue services, or choose a service-only custom proposal.
4. A compact live receipt shows the published package price plus selected add-ons. Package exclusions are recorded for Dira's review; they do not create an automatic discount. Custom proposals are indicative and subject to feasibility review.
5. The customer submits a project brief. Dira receives the final proposed selection, price reference, excluded inclusions and timestamped configuration history.
6. Dira reviews feasibility and scope, prepares a formal quote, and the customer continues in the same account for approval, payment records, delivery, tasks, messages and notifications.
7. The same account will host consultation scheduling after the scheduling integration is configured.

## Pricing integrity
- Catalogue IDs, names, kinds and prices are validated server-side against the published catalogue.
- Client-side totals are display estimates only; the server validates the proposed total against selected published catalogue prices.
- Package prices remain published reference prices when inclusions are removed. Dira must review and explicitly agree any adjusted scope and final price before quote approval.
- A custom service-only proposal is not an accepted contract, confirmed deliverable list or final quote.
- No payment is taken by configuration submission.

## Owner review
The owner enquiry view displays:
- The selected package or custom-services route.
- Indicative proposed total.
- Package inclusions excluded by the customer.
- Timestamped package changes and service additions/removals.
- The customer's final brief and selected catalogue items.

## Consultation scheduling acceptance criteria
- Admin can configure meeting types (in person, remote video, phone), durations, operating hours, working days, blocked periods and slot capacity.
- Customer receives two date recommendations computed from actual configured availability. A third option opens a calendar for a customer-chosen date.
- The calendar checks availability before showing selectable times; no invented slots.
- Weather is shown only for in-person dates and only from a real forecast provider, with date-range uncertainty disclosed.
- Customer chooses in-person, video link or phone call and submits a request.
- Requests remain pending until an authorised Dira team member confirms them.
- Admin can confirm, suggest another time, reschedule or cancel; customer receives an in-account notification.
- Google Calendar FreeBusy availability and Events creation run server-side with least-privilege OAuth permissions. Refresh tokens must be stored securely, not in client code or plaintext Firestore documents.
- A confirmed event must be reconciled with the Dira calendar; duplicate submissions must be idempotent.
- When Google Calendar credentials or authorisation are missing, the interface must explain that live availability is not yet connected and must not pretend to book.

## External configuration still required
Google Calendar integration requires a Dira-owned Google Cloud OAuth client, authorised redirect URI, calendar access consent and secure server-side refresh-token storage. The Dira calendar owner must authorise the connection. Weather forecast provider and API policy must be selected before weather recommendations are enabled.

## Visual standard
Keep the configurator inside the same compact account workspace. Use concise package comparison, readable component toggles, a clear live receipt and a visible next action. Preserve the Iteration 13 mobile-first density and Dira brand palette. No oversized marketing panels or separate wizard pages.
