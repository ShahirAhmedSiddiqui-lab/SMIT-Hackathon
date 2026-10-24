# HCM Lite implementation plan

## Current state

- Brief review complete: all seven physical PDF pages extracted and visually inspected; requirements/permissions/formulas/rubric in `docs/BRIEF.md`.
- Asset review and the design system are complete and captured in `docs/DESIGN.md`; implementation is active across the setup, auth, employee, and attendance slices.
- Existing starter preserved; no app dependency changes. Temporary PDF inspection tools were removed after review.
- Prior successful database connectivity is evidence from earlier session/participant terminal, not a new check. Dedicated empty HCM database, AI credentials, and hosting remain unverified.
- Deadline time/timezone not supplied in PDF. Remaining time unknown; do not invent a deadline or absolute milestone schedule.

## Scope and sequencing

Target all mandatory web checklist items; prioritize a narrow working demo through all core modules before secondary lists and bonuses. CSV remains tracked due to ambiguous optional wording. Required: real tool-calling AI, not canned answers. Useful implementation support: common date/rule services, reliable validation/error contracts, deterministic calculations and role tests. Deferred: native mobile, camera/face matching/liveness, risk/anomaly predictions, extra penalties, Roman Urdu, PWA/dark-mode bonus work.

| Milestone | Work and dependencies | Acceptance/evidence | State |
|---|---|---|---|
| 0 Scope and decisions | Deadline, company timezone, H identity/self-approval, CSV interpretation; verify dedicated DB and AI provider access without exposing secrets | Decisions recorded; integration unknowns explicit | Brief/design review complete; event decisions pending |
| 1 First complete flow | First-run company/Admin, login + validated JWT/session, role/scope middleware, settings; then A creates H, H creates E, first password change | One bootstrap only incl concurrent requests; refresh persistence; H cannot create A; E cannot read another E; bcrypt hashes only | In progress — setup, auth, settings, HR creation, employee registration, directory, and password-change slices built; full role verification pending |
| 2 Attendance and leave | Organization calendars/quotas, staff identity, attendance uniqueness/timestamps/statuses, corrections, leave balance/approval/cancellation | Duplicate check-in 409; under-5h boundary; weekends/holidays excluded; overlap/balance 422; approval audited/notified | In progress — attendance and employee/HR leave flows built; deterministic tests, corrections, holidays, and notifications pending |
| 3 Payroll | Salary settings, working-day ledger, join/exit dates, monthly draft, illustrative tax, A finalize, PDF payslip | Table-driven tax/proration/deduction tests; finalized snapshot locked for every role; own-only PDF download | Not started |
| 4 Analytics and AI | Reuse authorized attendance/leave/payroll aggregates; role dashboards/filtering; seven LLM tools, summary, smart leave, policy | Live facts agree across dashboard/chat; E salary refusal; correct relative dates; 15s failure fallback, validated JSON retry once, rate limit and AI logs | Not started |
| 5 Remaining checklist | Employee 360/search/paging, CSV dry-run/import/export, announcements, notifications, A audit feed, full settings administration | Matrix #01-25 checked individually; unsupported items disclosed | Not started |
| 6 Integration and packaging | Narrow deterministic tests, lint/typechecks/build, real browser at 375px and desktop; setup/reset isolation; README and five-minute rehearsal | No-data + populated journeys, console/network review, role bypass tests; judge can run in <10min; prepare repository/live destination | Not started |
| 7 Authorized release | Push/host only to participant-authorized destinations; fresh empty judging state; verify live flows | Accessible repository/live links, no actual secrets; each student submits both links on LMS | Not started |

After deadline is known, use an adjustable budget of about 10% scope/setup, 55% complete flows, 20% validation/fixes, 15% packaging/rehearsal. These are planning heuristics, not event rules. Account for elapsed time and avoid spending the final window on bonuses.

## Risks / unresolved decisions

- No exact cutoff: cannot calculate remaining time or safely commit to bonus work.
- H self-service requires linked staff identity; H self-approval not defined. Clarify workflow before that branch.
- CSV prose/checklist conflict: retain task, ask organizer if necessary.
- Payroll/date semantics and historical setting snapshots need documented choices/tests; see BRIEF assumptions.
- AI requires live provider tool calling, credentials and connectivity; unavailable provider must show explicit fallback and remain marked incomplete.
- Existing Atlas sample database is unrelated. Validate selected DB name only, never print connection URI; select a dedicated empty HCM DB without modifying/deleting sample collections.
- Hosted judging requires fresh setup; rehearsal data must not contaminate judged target. No automatic destructive resets.
- Many functions depend on shared rules and authorization; build services once so AI, dashboards and payroll cannot diverge.

## Next action

Continue milestone 2 with deterministic attendance/leave tests, attendance corrections, holidays, and notifications. Keep all existing unrelated user changes.

## Completion snapshot

- ✅ Foundation/design phase: brief reviewed, asset direction documented, project setup and database configuration ready.
- 🟡 Milestone 1: core implementation is built, but the complete Admin → HR → Employee browser journey and deterministic authorization tests still need verification.
- 🟡 Milestone 2: attendance and employee/HR leave flows are built; deterministic tests, corrections, holidays, and notifications remain.
- ⬜ Milestones 3–7: payroll, analytics/AI, remaining checklist, packaging, and authorized release remain.

## Phase count

- Completed: foundation/design phase.
- In progress: milestones 1 and 2.
- Remaining untouched milestones: 5 — payroll, analytics/AI, remaining checklist, integration/packaging, and authorized release.
- Overall: 5 full milestones remain, plus unfinished acceptance work in milestones 1 and 2.
