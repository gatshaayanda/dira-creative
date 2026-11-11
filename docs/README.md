# Documentation map — start here

This folder and the repository root are the maintained knowledge base for Iteration 13. **Do not read every document indiscriminately.** Start with the short entry sequence, then open the one authoritative guide for the task. This keeps future chats efficient while preventing important safeguards from being missed.

## 1. Mandatory entry sequence

For every new implementation or QA chat:

1. [START-HERE.md](../START-HERE.md) — mandatory handoff, reading order and workflow.
2. [AGENTS.md](../AGENTS.md) — repository rules, protected behavior and authority.
3. [GOLDEN-BASELINE.md](../GOLDEN-BASELINE.md) — what is protected and how to recover safely.
4. [Change Safety & Regression Prevention](./CHANGE-SAFETY-STANDARD.md) — mandatory method for diagnosing, changing and verifying without breaking working behavior.
5. [FOUNDATION-BLUEPRINT.md](../FOUNDATION-BLUEPRINT.md) — architecture, route/file map, data model and known limitations.
6. [README.md](../README.md) — current demo walkthrough and truthful behavior boundaries.

Then open only the relevant task-specific documents below. Read the actual code and current GitHub state before editing; docs and old chat summaries are not proof of current runtime behavior.

## 2. Portfolio-wide adoption guide

- [Iteration 13 Portfolio Handoff](./ITERATION13-PORTFOLIO-HANDOFF.md) — canonical guidance for using this repository as the shared reference when creating new projects or improving existing portfolio apps. It defines source selection, visual adaptation, protected behavior and release expectations.

## 3. Task-specific source of truth

| If the task involves… | Read this authoritative document |
| --- | --- |
| Visual design, responsive layout or visual QA | [Visual Direction Standard](./VISUAL-DIRECTION-STANDARD.md), then open the canonical [WashRide reference image](./assets/washride-home-reference.jpeg) |
| Meaningful loading, search, booking, status, upload, payment, messaging, admin operations or handoff | [Operational Transparency Standard](./OPERATIONAL-TRANSPARENCY-STANDARD.md) |
| Interaction affordances, contrast, touch targets, account UX, success/error feedback or notifications | [Interaction Clarity & Feedback Standard](./INTERACTION-CLARITY-AND-FEEDBACK-STANDARD.md) |
| PWA install behavior, install regression or install-related identity work | [PWA Installation Lock](./PWA-INSTALLATION-LOCK.md) |
| New app selection, cloning, adaptation or infrastructure reset | [Cloning guide](../CLONING.md), [App Factory SOP](./ADMIN-HUB-APP-FACTORY-SOP.md), [Clone/reset checklist](./CLONE-RESET-CHECKLIST.md), and [Golden Baseline](../GOLDEN-BASELINE.md) |
| Chat widget / guided assistant | [Chat Widget Research](../CHAT-WIDGET-RESEARCH.md), then inspect the current component and handlers |
| Customer account workspace | [Account adaptation contract](../AGENTS.md#customer-account-workspace-adaptation-contract), plus the account/data sections in [Foundation Blueprint](../FOUNDATION-BLUEPRINT.md) and [Cloning guide](../CLONING.md) |
| Build, identity or release verification | [START-HERE](../START-HERE.md), [AGENTS](../AGENTS.md), `package.json`, verifier, CI workflow and actual check output |

## 4. What each root document owns

- **START-HERE.md** — one entry point; reading order, stop/go gates and workflow. It should stay concise and link to detailed standards rather than duplicate them.
- **AGENTS.md** — binding repository instructions and protected implementation contracts. It describes what future agents must obey.
- **GOLDEN-BASELINE.md** — approved recovery point, protected product behavior and recovery/promotion policy.
- **FOUNDATION-BLUEPRINT.md** — technical map: routes, components, data, integrations, offline boundaries and known limitations.
- **README.md** — human walkthrough of the current customer/admin demo, setup, checks and limitations.
- **CLONING.md** — source selection and safe reuse/adaptation across portfolio projects.
- **CHAT-WIDGET-RESEARCH.md** — focused research record for the guided assistant; not a general operating policy.

## 5. Standards and execution references in this folder

- **CHANGE-SAFETY-STANDARD.md** — cross-project regression-prevention method. Mandatory for every task.
- **VISUAL-DIRECTION-STANDARD.md** — visual craft, composition and responsive compactness; the JPEG asset is the visual source, not the prose alone.
- **OPERATIONAL-TRANSPARENCY-STANDARD.md** — truthful activity, status and outcomes across real workflows.
- **INTERACTION-CLARITY-AND-FEEDBACK-STANDARD.md** — clear affordances, accessible interaction, customer accounts and persistent/contextual feedback; toasts are supplementary only.
- **PWA-INSTALLATION-LOCK.md** — protected installation state machine and recovery rules.
- **ADMIN-HUB-APP-FACTORY-SOP.md** — end-to-end new-project operating procedure.
- **CLONE-RESET-CHECKLIST.md** — actionable checklist for new-project reset and handoff.

## 6. Authority when documents overlap

Use this order; do not resolve conflicts by guessing:

1. The product owner's latest explicit instruction for the current task.
2. The target repository's actual current code, tests, configuration and verified runtime behavior.
3. The target repository's `AGENTS.md` and project-specific protected contracts.
4. The relevant focused standard/SOP linked above.
5. The architecture and walkthrough docs.
6. Historical chat summaries or assumptions.

The standards complement one another. For example, a visual redesign must preserve the protected install behavior; a booking-flow change must preserve authentication/data boundaries and show truthful operational outcomes. The Change Safety Standard governs *how* every change is diagnosed, scoped, reviewed and verified.

## 7. Documentation maintenance rules

- Keep one canonical document per policy. Other files should link to it rather than maintain competing copies.
- Keep task-specific detail in the relevant guide; keep `START-HERE.md` as the shortest useful handoff.
- Update `FOUNDATION-BLUEPRINT.md` when architecture, routes, data flows or known limitations change.
- Update `AGENTS.md` when a rule, protected feature or recurring failure mode becomes binding.
- Update `GOLDEN-BASELINE.md` only when the product owner approves a baseline/recovery change.
- Update `README.md` when the demo walkthrough, setup, visible behavior or limitations change.
- Update `CLONING.md` and the checklist when cross-project source/adaptation policy changes.
- Record research findings in the relevant research/standard doc, not as duplicate policy paragraphs across several root files.
- Remove stale or contradictory instructions when changing a rule. Never leave two competing versions of the same contract.
- Preserve working links and referenced assets. Do not rename/move existing docs or assets without updating every reference.
- Do not record secrets, personal customer data or unverified claims in documentation.


For staff/admin login changes, the authoritative contract is the **One-word staff/admin access** section in [ADMIN-HUB-APP-FACTORY-SOP.md](./ADMIN-HUB-APP-FACTORY-SOP.md).
