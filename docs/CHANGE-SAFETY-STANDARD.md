# Change Safety & Regression Prevention Standard

**Status: mandatory across every project and every implementation chat.** This standard applies to bug fixes, feature work, visual changes, refactors, integrations, infrastructure and QA corrections. It is the operating discipline for protecting working software while changing only what the task requires.

## 1. The governing rule

**A request to change one thing is not permission to break, redesign, weaken or silently alter anything else.**

Treat the latest verified working behavior as protected by default. A user-reported success is valuable evidence. Preserve it unless the requested task explicitly changes it or a demonstrated dependency makes a narrow adjustment necessary. The product owner's task scope and explicit decisions outrank an agent's assumptions or preferred implementation.

## 2. Before editing: establish reality

1. Read the target repository's `AGENTS.md`, entry-point handoff and relevant project docs. For Iteration 13, follow [START-HERE.md](../START-HERE.md) and this documentation map.
2. Inspect the actual current branch, commit, recent relevant changes, working tree where available, and the deployed version/status when the issue concerns a live app.
3. Read the relevant source code, tests, configuration and existing implementation. Documentation and chat summaries are pointers, not proof that behavior exists in code.
4. Separate:
   - **Observed fact:** what the user actually saw or what a test/log proves.
   - **Hypothesis:** a possible explanation that still needs evidence.
   - **Required outcome:** what must change and what must remain unchanged.
5. Write down the task boundary: target behavior, directly related files/systems, and protected adjacent behavior. Do not expand scope to tidy or redesign unrelated code.

If a key fact cannot be established, inspect further or explain the limitation. Do not fill the gap with an invented root cause.

## 3. Diagnose the first proven cause

- Reproduce the issue where possible, using the actual route, device, browser, account role and sequence that matter.
- Trace the real event/data/state lifecycle through the implementation. Check collision geometry, state transitions, persistence, authorization, cache/deployment version or other relevant mechanics rather than guessing from a visual symptom.
- Identify the **first proven failure** and the smallest change that addresses it.
- Prefer correcting the faulty condition or boundary over adding a broad exception, global override, fallback, timeout, forced state, duplicated handler or approximate workaround.
- If evidence does not establish a code defect, do not change code speculatively. Report what is known and what evidence is still needed.

## 4. Implement narrowly; preserve neighboring behavior

- Change the smallest possible surface. Keep unrelated files, formulas, styles, routes, data models, controls, integrations and user journeys untouched.
- Do not replace a working subsystem to solve a local defect. Do not introduce a second mechanism where one authoritative mechanism already exists.
- Do not use approximate geometry, broad selectors, global state overrides, catch-all fallbacks or widened permissions when a precise boundary is required.
- Preserve existing contracts: APIs, data shapes, storage keys, event lifecycles, auth/ownership checks, offline semantics, visible collision boundaries, user controls and accessibility.
- If a change necessarily affects adjacent behavior, explain the dependency, make that effect explicit, and verify it. Ask the product owner before making a material scope or product decision.
- No unrelated refactoring, dependency upgrades, formatting churn or “while I'm here” improvements in a focused bug fix.

## 5. Regression review before release

Before committing or pushing, inspect the complete diff—not just the lines you intended to edit.

For every changed file, ask:
- Is this file required for the requested outcome?
- Did any protected or previously working behavior change?
- Did the patch broaden a condition, bypass a guard, change a default, add a second event/state path, or affect another route/device/role?
- Do visible affordances match actual behavior and boundaries?
- Are cache/version, identity, security, persistence and deployment changes justified?
- Have comments and docs been updated so they describe the actual code?

**Any unexplained out-of-scope change is a release blocker.** Remove it or establish evidence and obtain authorization before proceeding.

## 6. Verify both the fix and what must not break

Build a small regression matrix from the task boundary. Verify:
1. The reported failure is corrected.
2. The nearest adjacent working behavior still works.
3. The main end-to-end journey still works.
4. Relevant device sizes, roles, modes, lifecycle states and error/offline paths still behave correctly.
5. Existing tests/invariants still pass and have not been weakened to make the patch green.

Run focused tests first, then the relevant typecheck, lint, build and CI checks. Inspect actual output. If browser/device/gameplay testing is required but unavailable, say so plainly and give the exact remaining QA step. Do not describe code inspection as runtime QA.

Examples:
- Pit fix: verify pit entry/service/exit **and** ordinary circuit-wall collision; no invisible barrier, no fence phasing, no unrelated vehicle-physics change.
- Admin UI fix: verify the target screen **and** customer booking/account journey, role boundaries and phone layout.
- Install fix: verify native prompt lifecycle, iOS guidance, embedded-browser handling and offline/update behavior; do not add a substitute install UI.
- Upload fix: verify success, failure/retry, ownership/access, metadata visibility and offline limitations—not just the upload button.

## 7. Stop on unexpected results

When a fix causes a new regression, or QA differs from expectation:

1. Stop adding changes.
2. Capture the exact version/commit, steps and observed result.
3. Compare the current diff and deployed code with the last known-good behavior.
4. Find the first proven failure.
5. Revert only the faulty change or correct its precise cause; do not discard unrelated approved work.
6. Re-run the fix and regression checks before claiming completion.

Never stack speculative patches in the hope that one will work. Never make the product owner repeatedly rediscover regressions that could have been caught by a basic adjacent-behavior check.

## 8. Commit, deployment and QA are different claims

Report these independently and accurately:
- **Implementation:** what changed and what remained untouched.
- **Commit/push:** exact branch and commit SHA; whether push succeeded.
- **Checks:** exact tests, typecheck, lint, build and CI results actually observed.
- **Deployment:** exact deployment/production status and deployed commit, if verified.
- **Runtime QA:** browser, device, offline or gameplay paths actually exercised.
- **Remaining QA:** what the product owner still needs to test.

A successful API edit, commit, push, CI run or deployment build does not prove that the real customer journey or physical-device behavior works.

## 9. Product-owner authority and communication

- The user is product owner and final reviewer; the implementation agent is responsible for technical investigation, focused implementation and evidence-based reporting.
- Do not ask the user to repeat rules already recorded in the repository.
- Ask one concise question only when an essential product decision cannot be inferred safely.
- Be direct about mistakes. Own regressions without blaming the brief, user, environment or missing explanation.
- Do not say “fixed”, “tested” or “deployed” beyond the evidence available.
- Update the target project's `AGENTS.md` when a new project-specific invariant or recurring failure mode is discovered. Keep the shared standard here and project-specific facts in the target repo.

## 10. Final release gate

Do not push a focused change until all applicable statements are true:

- [ ] The actual current implementation and relevant baseline were inspected.
- [ ] Observations and hypotheses were kept separate.
- [ ] The first proven cause was identified.
- [ ] The change is the smallest one that addresses it.
- [ ] Unrelated and protected behavior remains unchanged.
- [ ] The full diff was reviewed; no unexplained scope expansion remains.
- [ ] The fix and adjacent regression cases were checked.
- [ ] Relevant automated checks were run and their actual results inspected.
- [ ] Any unavailable runtime/device QA is explicitly disclosed.
- [ ] Commit, deployment and QA claims are reported separately.
