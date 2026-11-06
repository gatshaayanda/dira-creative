# START HERE — Iteration 13

**This is the mandatory entry point for every new ChatGPT/Codex implementation chat.** Do not ask the product owner which documents to inspect. GitHub `main` is the source of truth; chat history is supporting context only.

## Required reading order — before editing

**Golden baseline:** read [GOLDEN-BASELINE.md](./GOLDEN-BASELINE.md) alongside these instructions. It defines the recovery point, protected behavior and mandatory adaptation checks.

1. `AGENTS.md` — project rules, protected behavior, source-of-truth and safety boundaries.
2. `FOUNDATION-BLUEPRINT.md` — repository map, architecture, data model, protected install/offline invariants, verification and known limitations.
3. `README.md` — how the customer and admin demo currently works and what is already implemented.
4. `CLONING.md` — required when selecting a source, cloning/adapting any portfolio project, resetting identity/PWA assets, or reusing patterns in another project. Iteration 13 is the standards/reference repository, not the default clone source; Africhiko is the default when the product owner has not selected another source.
5. `docs/VISUAL-DIRECTION-STANDARD.md` — required when planning or reviewing visual changes; use it as a craftsmanship and mobile-composition reference, not a universal theme. Open and inspect `docs/assets/washride-home-reference.jpeg` itself.
6. `docs/OPERATIONAL-TRANSPARENCY-STANDARD.md` — required when implementing or reviewing meaningful user-facing or staff-facing operations, loading/progress, search, status, uploads, payments, messaging, integrations or delivery handoff.
7. Read the relevant route/component docs and code referenced by those files, then inspect the actual latest commit, package scripts and CI/deployment state.

Do not stop after reading only one file. These documents have different purposes and are designed to be used together.

## Mandatory evidence-led diagnosis and release gate

Use this gate for every project and every implementation chat; do not assume an earlier chat summary or a user's suspected cause is the current repository truth.

1. **Separate observation from explanation.** Capture the reported behavior and any known device/browser, deployed URL/version, route, and reproduction steps. Treat verified real-device success as behavior to preserve. Do not turn a symptom or a hypothesis into an assumed root cause.
2. **Diagnose before editing.** Inspect the actual deployed commit/status, current source, recent commits, relevant tests and browser behavior. Reproduce where possible. Identify the first proven failure and the smallest scope that can explain it. If no defect is evidenced, explain the findings rather than changing unrelated code.
3. **Mark protected and out-of-scope surfaces.** Use `AGENTS.md`, the installation lock and the task brief to identify protected behavior. Do not touch unrelated installation, authentication, service-worker/offline, persistence, upload or navigation behavior without a demonstrated dependency or explicit authorization.
4. **Review the diff before release.** Compare every changed file with the requested scope and approved baseline. Investigate every unexpected protected-file change. Stop the release until it is removed or supported by clear evidence and authorization.
5. **Verify, then report each result separately.** Run relevant checks and inspect their real output; inspect CI and deployment state when available. Distinguish code/commit, push/merge, tests/builds, production deployment, and physical-browser/device/offline QA. Never infer one from another.
6. **Unexpected behavior means stop and diagnose.** Fix the first proven failure; do not pile on speculative changes. Keep related work in one reviewed commit where practical, and never force-push or rewrite history without authorization.

Continue with the task only after these gates are satisfied. The installation mechanism remains protected by the dedicated PWA installation lock.

## Required workflow

### Existing Iteration 13 project
1. Establish current branch, latest commit, working-tree state, recent changes and failing checks.
2. Read the four documents above in the relevant scope; inspect only the implementation related to the task.
3. **Installation is a locked foundation capability.** Before editing anything that could affect it, read [docs/PWA-INSTALLATION-LOCK.md](./docs/PWA-INSTALLATION-LOCK.md). Preserve the current approved runtime and all install invariants. If installation is reported broken, follow the lock's recovery sequence; never add a replacement modal, duplicate event listener, generic browser-menu fallback, or speculative prompt fix.
4. Preserve the customer journey, service-worker/cache namespace, local demo data shape and UploadThing configuration unless the brief explicitly calls for changing them.
5. Implement the requested end-to-end behavior, including its customer and admin sides, validation, empty/error/success states, mobile layout and truthful offline behavior. Apply the operational-transparency standard to meaningful activity and lifecycle states; apply the WashRide image reference and visual standard to visual work.
6. Run `npm ci`, `npm run verify:identity`, `npm run lint` and `npm run build` where an execution environment is available. If a check cannot be run, say so and use an available CI/deployment signal; never infer a passing build from a successful GitHub edit.
7. If a build fails, get the actual error log, fix the first failure, rerun checks, and repeat until green. Do not guess fixes or ask the product owner to debug logs that the agent can access.
8. Push to `main` when implementation/pushing is authorized. Confirm the exact commit on `main`, check the resulting production deployment status, and distinguish code pushed, build passed and deployment verified.
9. Hand off a concise QA checklist only after a successful build/deployment; include any unverified device/offline steps.

### New project cloned/adapted from a foundation
For a new app, use the exact source repository selected by the product owner. If none is named, use `gatshaayanda/africhiko` by default. If asked to recommend a source, compare relevant portfolio apps and explain material trade-offs before cloning. Iteration 13 is the engineering standards/reference repository, not the default clone source. Read `CLONING.md`, `docs/ADMIN-HUB-APP-FACTORY-SOP.md` and `docs/CLONE-RESET-CHECKLIST.md`; inspect source and target before cloning. For an existing app, inspect and improve its current repository in place; never reclone it just to start work.

## Account workspace reuse
Before building/adapting any customer account, read the **Customer account workspace adaptation contract** in `AGENTS.md`, the matching section in `CLONING.md`, and the account/data boundaries in `FOUNDATION-BLUEPRINT.md`. Search online for the target product context and relevant account/dashboard UX research before choosing account extras or visual motifs. Keep all sections visually consistent; never carry a theme-specific gimmick (such as a spa garden) into an unrelated product by default. Preserve the useful capability set but fit it to the target project. Verify customer → admin → customer communication, attachment handling, data ownership, offline boundaries and account-specific copy. The current Iteration 13 account is browser-local demo functionality, not a secure cloud account or remote inbox.

## Known boundaries
- Firebase has intentionally been left alone for this prototype.
- Requests, status, announcements, customer/admin messages, garden progress, journal and preferences are browser-local demo data.
- Customer/admin replies are visible only in the same browser profile; no real remote inbox, email delivery or cross-device sync is configured.
- UploadThing uploads require internet and are not queued offline. Current limits: images 4 MB, PDFs 4 MB, videos 16 MB.
- The product owner handles Vercel deployments unless explicitly delegated, but the implementation agent must still inspect deployment/build status when it is available.
