# Visual Direction Standard — Mobile-First Business Experiences

**Purpose:** give future implementation chats a concrete visual target for craftsmanship. This is a quality and composition reference, not a universal theme, template, or instruction to copy another business's identity.

## Reference interpretation

The WashRide mobile-home screenshot supplied by the product owner is a useful example of a finished, app-like customer experience. Its transferable qualities are:

- **Immediate identity:** the brand is recognizable at the top without wasting the first screen on a generic header.
- **Purposeful hero:** a large, relevant visual communicates the service and emotional promise immediately.
- **Clear headline:** short, confident copy has strong hierarchy and remains readable over the image.
- **Dominant primary action:** one unmistakable booking action is visually stronger than every secondary action.
- **Organized secondary journeys:** supporting destinations appear as a consistent card grid with meaningful icons and concise labels.
- **Persistent navigation:** the bottom bar exposes a small number of important top-level destinations and makes the active location obvious.
- **Unified component language:** buttons, cards, iconography, borders, highlights and spacing feel designed as one system.
- **Premium finish:** deliberate lighting/imagery, contrast, depth and restrained accents make the interface feel like a real product rather than a wireframe.

The screenshot is a car-wash example. Do not reuse the WashRide name, logo, car/water artwork, exact blue palette, copy, layout proportions or business-specific labels unless explicitly requested. Do not reproduce it pixel-for-pixel. The transferable lesson is the quality, clarity and customer-flow composition. **Canonical image asset:** `docs/assets/washride-home-reference.jpeg` (WashRide mobile-home reference supplied by the product owner). Future chats must open and inspect this exact image before visual planning or visual QA; do not rely on a text-only recollection or ask the product owner to re-send it. If the asset is missing from a checkout, stop and restore it from the repository history before proceeding.

## The standard to aim for

Every project should feel like a carefully art-directed, installable mobile product, not a desktop website compressed onto a phone. **Compactness is a product-wide requirement, not a homepage-only treatment.** It applies to public home screens, booking/order flows, customer accounts, staff/admin workspaces, dashboards, content managers, settings, forms, lists, tables and detail views. The home screen may use a cinematic hero, but inner screens must not become oversized, spacious marketing pages by default.

### 1. Brand and first impression

- Establish the business identity in the first viewport with a deliberate logo/wordmark treatment and a clear visual personality.
- Use a strong, contextually relevant hero image, product image, illustration or composed visual. The asset must support the actual industry and message.
- Use a concise headline and supporting line; avoid generic filler such as "Welcome to our website".
- Ensure text over imagery remains legible with suitable overlays, gradients or separate text surfaces.
- Avoid oversized headers that push the actual customer action below the fold.

### 2. Action hierarchy

- Give each screen one primary action that is immediately obvious.
- Make the primary action visually distinct in size, contrast, placement and wording.
- Group secondary destinations into a consistent grid, list or compact navigation system.
- Use specific action labels ("Book a wash", "View services", "Track request") rather than vague labels ("Click here", "Explore").
- Never let decorative banners, games, promotions or animations compete with the main business journey.

### 3. Navigation and information architecture

- Use bottom navigation only when the product has a small set of genuinely top-level destinations that users need repeatedly.
- Keep labels visible where they improve recognition; clearly distinguish the active destination.
- Do not force a bottom bar onto every project. A salon, catalogue, medical service, admin dashboard and editorial landing page may need different navigation.
- Keep account/profile access findable without letting it overpower the main action.
- Do not duplicate destinations across hero, cards and navigation without a clear reason.

### 4. Compactness and information density — every screen

This is a mandatory cross-application rule. Do not make only the homepage compact while booking, customer and admin surfaces become tall, oversized or wasteful.

- Design around the user's task and the amount of information they need at once. Prefer a compact, purposeful app interface over excessive vertical padding, oversized headings, tall cards and decorative gaps.
- Keep page headers concise. Use a small title, brief context and only the actions needed on that screen; avoid repeating the business logo, large hero, welcome copy or promotional banners on every inner route.
- Use compact cards and rows with aligned labels, values, statuses and actions. Keep related information together; avoid one fact per oversized card.
- Forms should use clear labels, sensible field heights, concise helper text and logical grouping. Avoid giant input fields, excessive vertical gaps and multi-screen scrolling for a handful of fields. Preserve readable touch targets and error messaging.
- Booking/order steps should keep the current step, selected service/item, date/time and next action visible with minimal repeated explanation. Use progressive disclosure for optional details, not for essential price, date, availability, consent or confirmation information.
- Customer pages should prioritize the customer's records, current status, next action and relevant history. Use compact lists, tabs or grouped sections; do not bury the useful information beneath oversized welcome panels or decorative content.
- Admin pages should prioritize operational density: filters, search, status, key record details and actions should be scannable together. Use compact tables or responsive list rows, restrained toolbars, concise metrics and well-organized detail panels. Avoid oversized dashboard tiles, huge empty cards and excessive whitespace that forces unnecessary scrolling.
- On narrow screens, stack only when needed; keep related controls together and make important actions reachable. On larger screens, use available width intelligently instead of stretching every card or field across the page.
- Compact does not mean cramped: maintain readable type, sufficient contrast, clear grouping, comfortable touch targets, visible focus and spacing that distinguishes sections.
- Do not reduce font sizes, tap targets or line spacing below accessible/readable levels to achieve density. Remove redundant decoration and padding before shrinking content.
- Use a full-height hero or cinematic image only where it serves the landing-page purpose. Inner booking, account and admin routes should generally open directly onto the task, not repeat the homepage experience.

### 5. Components and visual system

Define a coherent system for:
- Typography scale, line-height, weight and truncation.
- Brand, surface, text, border, focus, success, warning and error colours.
- Spacing, content width, card radius, elevation and dividers.
- Primary, secondary, tertiary, destructive and disabled buttons.
- Form fields, validation, status indicators, icons, modals, sheets and navigation.
- Image aspect ratios, crop behavior, loading states and fallbacks.

Use consistent icons from one coherent family. Avoid emoji as a substitute for designed interface icons. Use gradients, glow, shadows, blur and motion with restraint; effects must not reduce legibility or performance.

### 6. Real content and imagery

- Prefer the business's own high-quality photographs, products, staff, premises, work and videos when available.
- Choose imagery that explains the category or service, not merely attractive but unrelated stock.
- Use deliberate crop/aspect-ratio rules so image collections align.
- Do not leave large blank media areas, broken-image icons or arbitrary placeholder blocks in finished work.
- If suitable assets are not available, use a deliberate branded fallback and identify the exact assets needed from the product owner.
- Never invent customer reviews, business locations, prices, awards, partners or service claims.

### 7. Mobile behavior and accessibility

- Design at narrow phone widths first, then adapt to larger screens.
- Keep primary actions reachable and touch targets comfortable; target 44px where practical and meet WCAG 2.2 AA minimum target-size requirements and exceptions.
- Maintain readable contrast over images and surfaces, visible keyboard focus, semantic labels and logical reading order.
- Respect safe areas and fixed navigation so content and buttons are never obscured.
- Support reduced motion and avoid animation that blocks or delays task completion.
- Check real device behavior when available; a desktop responsive preview is not proof of physical-device QA.

### 8. Progressive disclosure

Show the essential decision first. Put supporting detail in well-designed modals, bottom sheets, accordions, tabs or dedicated views when that reduces clutter. Use truncation for previews, but provide a clear way to read the complete content. Never truncate critical prices, dates, safety information, eligibility or confirmation details.

### 9. Functional finish

Visual polish includes behavior, not decoration. Every visible control must work. Provide appropriate loading, empty, validation, error, pending, success and offline states. Keep forms short and purposeful. Make booking, ordering, enquiry, account and admin actions coherent end to end. Never show fake progress, fake availability, fake payment confirmation or pretend CRUD.

### 10. Operational transparency — make real work visible

Visual polish must help people understand that the application is doing useful work. Apply [OPERATIONAL-TRANSPARENCY-STANDARD.md](./OPERATIONAL-TRANSPARENCY-STANDARD.md) alongside this visual reference. Across relevant customer and staff/admin screens, make genuine search, checking, saving, uploading, review, assignment, processing and completion visible in concise, context-appropriate language. Show the current state, meaningful update and next action; use measurable progress only when the underlying operation provides it. Do not add fake loading stages, artificial delay, animated percentages, decorative activity feeds or oversized status cards. The customer should see their own progress and next step; staff should see the actionable work behind it. Keep both views compact, accessible, brand-appropriate and consistent with the quality/composition of `washride-home-reference.jpeg`.


## Iteration 13 Business OS composition

Iteration 13's own visual direction is specifically a compact **Store → Briefcase → Login** product. The public Store is a real storefront demo, not a generic 13Studio brochure. The first viewport should communicate: a business-branded digital Store, the private owner Briefcase, low-friction one-word Login, and the practical benefit of remaining organised while the owner steps away.

- Keep public navigation to short, recognisable words such as **Store**, **Account** and **Login**. The logo is the discreet owner-workspace affordance where the product design calls for it; never expose an "Admin" destination to customers.
- The owner Briefcase should have compact navigation and operational sections: Today, Customers, Jobs, Receipts/Records, Calendar, Insights, Store design, Announcements, Settings and My Notes.
- Store editing is part of the OS: service/product CRUD, pricing, media, visibility, announcements and theme changes should preview in the public Store. A save must update the same source used by the customer view.
- Theme means a business-selected colour system, not only light/dark mode. Offer a curated palette and custom colour picker, apply the accent consistently, derive readable foregrounds and verify contrast. Keep the business's theme with its identity and preview before publishing.
- The 25 GB / high-volume customer-day story should be a concise capacity proof point, not a giant marketing section. Use the BoardSignal benchmark supplied by the product owner as the evidence reference; show the allowance, customer-call/interactions example, day-off outcome and cost-versus-marketing-budget rationale compactly. Do not imply that 25 GB is unlimited or that bandwidth, file storage, database operations, API calls, messaging and AI usage are interchangeable. Actual live usage must come from provider telemetry.
- Keep customer share/onboarding as a short action from the customer record: add one or multiple WhatsApp contacts, create scoped invitations and let customers open their account on the actual business domain. Never claim Chrome can be forced open by a universal web link.
- Use compact status rows for receipt readiness, job completion, projected sales and priority jobs. Clearly distinguish actual sales/confirmed receipts from quotations, unpaid amounts and projected work. Custom priorities must follow owner preferences and real job state.

The reference demo may use clearly labelled illustrative capacity scenarios and local-only data. It must never imply Gmail authentication, server persistence, cross-device sync, real WhatsApp delivery, live 25 GB metering, BUR compliance or production-grade customer isolation until those paths are implemented and verified.

## Adapt the direction to the industry

The same craftsmanship should produce different outcomes:

| Industry / product | Appropriate visual direction | Primary journey examples |
|---|---|---|
| Car wash / automotive | High-energy photography, confident service identity, strong booking action | Book, walk in, prices, locations |
| Salon / stylist | Editorial photography, service imagery, premium typography, personal portfolio | Explore styles, choose service, request appointment |
| Medical practice | Calm, reassuring, highly readable, low visual noise | Find care, understand services, request appointment |
| Retail / ecommerce | Product-first discovery, category hierarchy, search and clear purchase path | Browse, filter, save, request/order |
| Consultancy / professional services | Trustworthy typography, clear expertise and outcomes, restrained imagery | Understand offering, submit enquiry, access account |
| Esports / gaming | Immersive game artwork, strong event hierarchy, readable status and competition detail | Discover tournament, inspect rules, register where supported |

These are starting points, not rigid recipes. Research the actual business and audience before deciding.

## Visual QA review

Before calling a screen finished, ask:

1. Can a first-time visitor identify the business and its purpose within seconds?
2. Is the most important action unmistakable?
3. Does the first viewport contain a meaningful visual and useful content rather than empty decoration?
4. Are secondary actions organized and consistently presented?
5. Are typography, icons, spacing, imagery and surfaces part of one intentional system?
6. Is every label readable at actual phone size and over its background?
7. Does navigation reflect the real information architecture rather than a copied reference?
8. Are modals, truncation and progressive disclosure used to reduce clutter without hiding important information?
9. Do all visible controls work and provide truthful feedback?
10. Does the design still feel appropriate to this specific industry and brand?
11. Are booking, customer and admin screens as deliberately compact and scannable as the homepage is visually polished?
12. Can a user complete the main task without unnecessary scrolling, repeated headers, oversized cards or decorative filler?
13. When work takes time, can the user see what is genuinely happening and what has actually completed?
14. Are displayed stages, percentages, statuses, timestamps and outcomes grounded in real operations rather than staged theatre?
15. Can the customer and authorized staff understand the same record's current state and next action without exposing private information?

If the result looks like a generic template, a desktop page squeezed into a phone, or a collection of unrelated cards, it is not ready.

## How future chats must use this document

Read this file and open `docs/assets/washride-home-reference.jpeg` when planning or reviewing visual work. The image is the canonical visual reference and must be inspected—not merely inferred from this document. For meaningful workflows, also apply `docs/OPERATIONAL-TRANSPARENCY-STANDARD.md`: the visual reference governs how the product feels; the operational standard governs how it communicates genuine work and outcomes. Use it as a reference for mobile composition and finish only where useful. Combine it with the project's own brand, assets, audience, route structure and customer journey. Do not redesign a protected/golden screen or expand the task scope merely because this standard exists. For visual-only tasks, preserve working data flows, authentication, PWA installation, chatbot behavior and other protected functionality.
