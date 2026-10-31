# Iteration 13 — Foundation blueprint

**Entry point for every implementation chat:** [START-HERE.md](./START-HERE.md). Follow its required reading order and verification steps. Then read [AGENTS.md](./AGENTS.md) for protected rules and [README.md](./README.md) for the customer/admin walkthrough. Read [CLONING.md](./CLONING.md) whenever cloning, resetting identity or adapting this foundation. Chat history is not a replacement for these files.

Read [GOLDEN-BASELINE.md](./GOLDEN-BASELINE.md) for the approved recovery point and the standards boundary. Iteration 13 is the engineering standards/reference repository, not the default clone source. The product owner chooses each new project's source; Africhiko (`gatshaayanda/africhiko`) is the default only when no source is named.

This file is the fast technical handoff for a new ChatGPT/Codex conversation. GitHub main is the source of truth; inspect the actual latest commit rather than trusting an old chat summary.
## What this repository is

Iteration 13 is a **candidate reusable, mobile-first PWA foundation** demonstrated through a local-only service-order studio. It is not yet a production business app, secure admin, cloud-backed CRM, or universal template. Its primary purpose is to prove the customer journey, admin feedback, installation and offline patterns before they are promoted into future apps.

## Start here (fast map)

| Area | Source of truth | What to preserve / know |
| --- | --- | --- |
| Rules and protected behavior | `AGENTS.md` | Read first. Explicitly protects install capture, prompt, embedded-browser handoff, iPhone guide and offline behavior. |
| Customer + local admin demo | `src/app/page.tsx` | Service cards, order request form, local account view, admin CRUD, announcements and status changes. Several views live in one client component intentionally for the prototype. |
| Demo data model | Same file; key `iteration13:service-demo:v1` | `services`, `orders`, `announcement`, `views` stored in this browser's localStorage. This is not cross-device or server persistence. |
| Global styling | `src/app/globals.css` | Large inherited stylesheet plus the Service Studio styles. Append focused changes; avoid replacing the file wholesale. |
| PWA boundary | `src/app/layout.tsx`, `src/app/pwa-register.tsx` | Early `beforeinstallprompt` capture, retained one-shot event, native prompt on user click, install help, embedded-browser gate, offline/reconnect banners and update action. Protected behavior. |
| Service worker | `public/sw.js` | Versioned `iteration13-shell-*` cache, app-shell precache, same-origin asset cache, offline navigation fallback, update message. Optional push imports must not block its offline handlers. |
| Manifest/identity | `src/app/manifest.ts`, `public/manifest.webmanifest`, `src/app/layout.tsx`, `public/iteration13-icon-*` | Two manifest representations exist. Inspect the manifest actually served by the build before changing icons or metadata. |
| iPhone installation | `src/app/iphone-install/page.tsx`, `public/iphone-install.svg` | Keep Safari → Share → Add to Home Screen guidance and the existing walkthrough link. |
| Offline guidance | `src/app/offline/page.tsx` | Explains local-only behavior; server-dependent/Firebase routes still need a connection. |
| PWA pattern lab | `src/app/patterns/page.tsx` | Interactive reference page for the installation entry point and PWA behavior. |
| Identity/build checks | `scripts/verify-identity.mjs`, `package.json` | Run `npm run verify:identity`, `npm run lint`, `npx tsc --noEmit`, `npm run build` where the environment permits. Build runs identity verification first. |

## Current demo contract

- Sample services: Website P100, App P200, Monthly support P50, Phaser games P500.
- Customer chooses a service, enters name/email, picks a requested date today or later, optionally adds a brief, then sees the request in My account.
- The requested date is not a confirmed delivery promise; no payment is taken.
- Admin demo supports service add/edit/hide/show/delete, announcement publish/clear, request-status changes, local stats and reset.
- The customer and admin views share the same browser profile's localStorage. Never claim the data is synced, shared, submitted to a real business or safe for real customer records.
- External media can fail offline; cards must retain a useful local visual fallback.
- `/request` is retained only as a compatibility redirect to the service-order journey; it is not the old Plug sourcing form.
- This prototype's service-order data flow intentionally does not use Firebase. Firebase config/rules/data were not changed in this improvement pass.

## Protected invariants — do not casually rewrite

1. Do not remove or change the early install capture in `layout.tsx`, the `iteration13-open-install` event, retained one-shot event, or the explicit click that calls the native browser prompt in `pwa-register.tsx`.
2. The native browser prompt is authoritative. On desktop/Android, show the branded install CTA only while the retained `beforeinstallprompt` event is available; never substitute a custom modal/menu explainer or leave a dead button. Manual Share → Add to Home Screen guidance is for iOS Safari only.
3. Do not fake an install prompt or turn the branded install CTA into a no-op. Keep the embedded-browser blocking handoff and iPhone Safari guide.
4. Do not change manifest/icon paths without checking both manifest sources and the final served manifest/assets.
5. Keep service-worker cache names scoped to Iteration 13. Bump the shell cache version for a shell/routing policy change; keep offline fallback, update detection and refresh action.
6. Remote Firebase Messaging is optional to the demo's shell. Its import failure must not prevent service-worker offline handlers from registering. Do not change Firebase project settings/rules/data as part of a UI task.
7. Do not claim local writes reached a server. A local change should only be shown as saved if localStorage accepted the write.
8. Keep mobile-first layout, visible focus, readable touch targets, status announcements and reduced-motion support.

## How to extend it safely

### New client project — standards apply; source is selected separately

- First decide whether this is a new app or work on an existing app. Existing projects are improved in place; never reclone to replace a working implementation.
- Use the exact source repository named by the product owner. If none is named, use `gatshaayanda/africhiko` by default for new customer-facing PWAs/Admin Hub apps. If asked to recommend, compare relevant portfolio repositories and explain material risks before cloning.
- Iteration 13 supplies engineering standards and reusable safeguards; it is not the default cloning source. Do not assume its demo architecture, data model, routes or features belong in the target app.
- Read `docs/ADMIN-HUB-APP-FACTORY-SOP.md` and `docs/CLONE-RESET-CHECKLIST.md` before cloning/adaptation.
- Create an identity reset checklist: app name, visible copy, domain/base URL, metadata/Open Graph, manifest, PNG/SVG icons, Apple metadata, cache namespaces, routes, media, install guide and identity-verification checks.
- Replace demo services, prices, copy and media with project-specific requirements. Do not ship sample prices or local-only account semantics as real functionality.
- Decide the persistence boundary before building: local prototype, Firebase-backed records, or another backend. If server-backed, implement ownership/authorization at the rules/server boundary; never just make a database public.
- Keep the proven install flow separate from icon artwork or brand changes.
- Verify customer journey first, then staff/admin workflows, mobile widths, keyboard/accessibility, empty/error/success states, offline state and install behavior.

### Improve this foundation

- Make focused changes and preserve the last known-good `main` commit. Do not replace all of `globals.css` or rewrite the install system for a toast, icon, or copy change.
- Run source-level checks, then the configured identity/lint/type/build commands if possible. State exactly what ran.
- Separate GitHub push, CI/build status, Vercel deployment status and real device/offline testing. A push alone proves none of the latter.
- For offline QA: load online first, let the service worker install/update, reload once, then enable airplane mode and test customer request → My account → admin status change → account reflects status → refresh. Verify a new visit and a refresh separately. Confirm external media fallback.
- For installation QA, test Android Chrome's actual native prompt when available and physical iPhone Safari's Share → Add to Home Screen flow. Never treat an emulator or code inspection as device proof.

## Legacy boundaries to review deliberately

The repo contains inherited Firebase/PWA integration code beyond the local-only service demo, including background messaging and pending-notification retry hooks. They were not removed here because the product owner asked to leave Firebase alone and protect installation. Before using this repo for a real project, explicitly decide whether to retain, reconfigure or remove those integrations; do not silently inherit The Plug's project-specific notification behavior.

## Chat widget direction

The current Iteration 13 service demo does not include a chat widget. The Sparkle Legacy reference and UX findings are documented in [CHAT-WIDGET-RESEARCH.md](./CHAT-WIDGET-RESEARCH.md). Treat that file as a design brief, not a mandate to copy the insurance widget unchanged.


## Deterministic Service Guide — current reusable pattern

- Implementation: \`src/app/ServiceGuide.tsx\`; styles are appended to \`src/app/globals.css\`; mounted by \`src/app/page.tsx\`.
- The guide is a local scripted router, **not an AI model, human operator, support inbox, or backend integration**. It never sends a message to a server.
- It is intentionally connected through typed props/callbacks to the current page state. Customer actions select an existing service and then call the existing order form; account actions use the existing local account view. Admin actions open the real service CRUD, announcement or request-status area and scroll to the selected section.
- The teaser is delayed, compact, dismissible and session-scoped. The mobile guide is a contextual bottom sheet—not a full-screen takeover—and keeps part of the storefront visible. Service shortcuts show the catalogue's media, price and concise description. Preserve dynamic viewport/safe-area handling, the pinned composer, keyboard dismissal/focus handling and reduced-motion styling.
- Conversation history is limited to the current tab session and the last 20 messages. If session storage is unavailable, the guide still functions; history is optional.
- When adapting to a new project, replace service labels and deterministic matching with that app's real categories and supported actions. Connect to existing handlers rather than duplicating forms or inventing a second data model. Admin routes must respect the target app's actual authorization boundary; this prototype's admin is intentionally not secure.
- Keep the guide optional. The primary CTA and customer journey must remain understandable with the widget closed, disabled or unavailable.
- Do not copy prices, routes, WhatsApp endpoints, insurance language or Sparkle Legacy's local keys into another project. Never present scripted routing as AI. For external handoff, use only verified project-owned destinations and state clearly when connectivity is required.
- Before promoting this to the universal foundation, QA both customer and admin flows on a phone, keyboard-only, reduced motion, after dismissing the teaser, in offline mode, and with session storage blocked. Verify that each shortcut reaches the real action and does not merely close the panel or show a toast.


## Customer account workspace

The reusable account workspace lives in `src/app/AccountWorkspace.tsx`; the prototype admin's per-request conversation UI is in `src/app/page.tsx`. It is intended as a starting point for customer history, status clarity, customer/admin messages, attachment sharing and optional project-specific extras—not as a fixed design to clone unchanged.

Adapt its vocabulary, journal, requests, offers, preferences and next steps to the target product. Before choosing theme-specific interactions or account extras, research the actual target product/category online and use credible UX guidance; the reference spa garden is not a default pattern. Keep every account section visually consistent in surface, spacing, heading hierarchy, labels, borders and responsive behavior. Prefer a product-native, useful planning/support tool over decorative gamification; omit extras that do not fit. See [Baymard's dashboard consistency research](https://baymard.com/research-articles/cards-dashboard-layout) and [account dashboard examples](https://baymard.com/ecommerce-design-examples/58-account-dashboard). Keep customer and staff views connected to the same request record. The Iteration 13 demo uses browser-localStorage, so messaging and status changes are visible only in the same browser profile; there is no real inbox, email delivery or cross-device sync. The UploadThing route accepts images (4 MB), PDFs (4 MB) and videos (16 MB) and requires a network connection. Offline text/local-state behavior must never be described as a completed remote send or queued upload.

A production project must implement authenticated storage, customer record ownership, staff/admin authorization, upload privacy and any real message/notification delivery. Reuse the UI pattern only after verifying the target project's real data model and security boundary.
