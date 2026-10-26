# Nexora implementation plan

The official scope and rules are in [BRIEF.md](BRIEF.md). This file records the current implementation state. Statuses are based on source review and local checks, not a completed live demo.

## Current state (25 October 2026)

- Core setup, roles, employee records, attendance, leave, payroll, analytics, AI, notifications, announcements and audit all have persisted routes and UI entry points.
- First-use accounts are restricted by the API until password change. Admin can deactivate and reset accounts. HR staff profiles can be linked by Admin for HR personal attendance and leave.
- Employees see finalized payslips only; PDF links use each slip's run ID. Payroll uses working-day proration, employee dates and attendance ledger inputs.
- Dashboard cards read live API data. Attendance board derives absent, leave and missing-checkout states. Analytics accepts a date and department and returns basic attendance rates.
- `npm test`: 21 utility tests pass. `npm run lint`, `npm run build`, and `git diff --check` pass. Local frontend returned HTTP 200 and the pre-existing API process answered health with `ok`.
- Deployment packaging is now reproducible: server output is generated in ignored `dist/server`, `npm run build:server` prepares it, and `npm run start:server` starts the compiled API without rebuilding at runtime. The generated `tmp` directory is removed from the workspace.
- Role-first chooser is now wired before setup/login, non-Admin setup is blocked in the UI, login sends the selected role, and the API rejects mismatches without issuing a token. Shared password-field styling is prepared; password visibility still needs to be applied to every existing password form.
- Admin and HR can now create Employee accounts through the existing scoped employee endpoint; Admin-only user management remains protected. The login form uses the shared password field and the legacy login implementation is no longer used.
- Backend error normalization now returns structured 400 responses for malformed Mongo identifiers and 409 responses for duplicate-key conflicts. High-volume attendance and leave inbox queries have compound indexes. The tool dock now performs one initial auth check and responds to auth events instead of polling its own session state.
- Google Fonts are no longer fetched at build time; the app uses a system font stack. Responsive overrides now collapse workspace grids and keep tool panels within narrow viewports.
- Admin signup is now presented as the dedicated first-run workspace creation view, with Admin-only setup messaging and shared password visibility on setup, password change, employee creation, and Admin reset forms. The AI Assistant module now contains an authenticated embedded chat backed by `/api/ai/chat`. Opening a workspace tool collapses the dock list, and Escape closes active tool panels. Decorative signal/live dots are hidden while semantic badges remain available.
- Added authenticated self-profile loading and updates at `/api/auth/profile`, limited to name, phone, and address; added a Profile workspace module with account and linked employee facts. Authentication now includes visible access rules, viewport-fit responsive behavior, and reduced-motion-safe entrance/panel animations.
- No live Admin -> HR -> Employee browser journey, dedicated test database run, live Gemini call, mobile-width visual check, or deployment verification was completed in this update. npm test (24 tests), npm run lint, npm run build:server, and npm run build pass.

## Official checklist status

| # | Requirement | Current status |
|---|---|---|
| 01 | One-time company/Admin setup | Built; concurrent setup integration test needed |
| 02 | Login/logout/password change/RBAC | Role-first chooser and server-side selected-role rejection built; browser journey and token-revocation integration tests remain |
| 03 | Hours, grace, weekends, coordinates/radius | API and Admin settings form built; live persistence check needed |
| 04 | Departments, designations, leave types/quotas, holidays | Department/designation lists, annual/sick/casual quotas and holidays built; custom leave types and live persistence check remain |
| 05 | HR creation, deactivate, reset | Built; live verification needed |
| 06 | HR employee registration and scoped edits | Admin/HR creation and scoped edits built; transaction and live role verification needed |
| 07 | Search/paging/Employee 360 | Search/paging and profile editor built; complete 360 view remains |
| 08 | CSV dry run/import/export | Not built; brief wording is ambiguous about optional status |
| 09 | HR/Employee check-in/out | Built for linked profiles; live verification needed |
| 10 | Attendance board/calendar | Board date selection and personal monthly calendar built; live consistency check remains |
| 11 | Corrections and HR decisions | Built; live verification and complete audit snapshots needed |
| 12 | HR/Employee leave and balances | Calendar-year quota tracking built; cross-year requests must be split; concurrent reservations need work |
| 13 | HR decisions/comments | Built; concurrent approval protection and live verification needed |
| 14 | Salary structure | Basic salary editing and required calculations built; role journey needs verification |
| 15 | Monthly payroll draft | Built; transactional creation and reconciliation need work |
| 16 | Admin finalize/lock | Built; finalization concurrency and notification failure handling need work |
| 17 | Own-only PDF payslip | Built with finalized-only employee access; download journey needs verification |
| 18 | Role dashboards, KPIs, filters, trends | Existing live cards are role-aware for Admin/HR/Employee; trends and full formulas remain |
| 19 | Seven-tool AI chat | Built; live provider and tool-to-REST consistency checks remain |
| 20 | Admin/HR AI summary | Built; strict 3-5 grounded bullet validation remains |
| 21 | Smart leave draft and confirmation | Draft populates normal leave form; live provider journey remains |
| 22 | Policy Q&A | Prompt guidance exists; strict policy-only behavior remains |
| 23 | Announcements | Admin/HR post and all roles read on dashboard; live verification needed |
| 24 | Own notifications | Leave, correction and finalized payslip events built; live verification needed |
| 25 | Immutable Admin audit | Read-only Admin feed and some before/after snapshots built; remaining mutations need complete audit coverage |

## Next work in priority order

1. Run isolated browser journeys for first setup and Admin -> HR -> Employee at desktop and 375px, including the password controls and embedded AI chat.
2. Make setup, leave approvals, payroll draft/finalize and their audit/notification writes transaction-safe; add integration tests for races and failures.
3. Finish organization master data, Employee 360, attendance calendar, CSV if required, and all brief analytics formulas and trends.
4. Verify Gemini live, add structured-output retry and strict policy Q&A, and reconcile AI tool results with REST/dashboard facts.
5. Rehearse the five-minute demo from a fresh dedicated installation; verify README setup under ten minutes. Host only on a destination authorized by the participant, then verify both submitted links.

The brief did not specify a submission cutoff or timezone. Do not infer either. Keep the sample MongoDB database separate from the dedicated Nexora application database.
