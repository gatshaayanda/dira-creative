# Dira Creative — Operating Model & Data Contract

This document describes the target business records and lifecycle. It is a design contract, not a claim that server persistence is connected.

## Ownership and tenancy
- Royalty Holdings (Pty) Ltd is the legal parent organisation.
- Dira Creative is the operating brand and initial workspace.
- Every business record belongs to an organisation/workspace.
- A client can only access records linked to their verified account and explicit project membership.
- Owner, team member and client permissions must be enforced server-side. A hidden route or browser-only password is not authorization.

## Core records
| Record | Purpose | Important relationships |
|---|---|---|
| Organisation | Legal entity, registration and operating settings | Parent organisation, brands, users |
| Brand | Public identity, contact details, logo, palette and typography | Organisation, assets, services |
| User | Authenticated owner, team member or client | Organisation memberships, project memberships |
| Client | Person or business buying services | Contacts, enquiries, quotes, projects |
| Service | CRUD-managed service, scope, price and visibility | Brand, packages, enquiries |
| Package | Named bundle, scope, price range or custom pricing | Services, quotes |
| Enquiry | Initial customer brief and requested timeline | Client, service/package |
| Quote | Versioned proposal, scope, price, expiry and approval | Enquiry, project, creator |
| Project | Accepted engagement and delivery lifecycle | Client, approved quote, tasks, assets |
| Task | Assigned work, due date, status and completion | Project, assignee |
| Deliverable | File/link, version, review and approval state | Project, client, asset |
| Message | Client/team conversation and attachments | Client, enquiry, project |
| Invoice | Amount due, due date, line items and status | Project, client |
| Payment | Verified amount, method, reference and received timestamp | Invoice, project |
| Expense | Business cost, category, supplier and proof | Organisation, project if applicable |
| Asset | Brand and project files, version and access scope | Organisation, brand, project |
| Document | Company policies, SOPs, proposals and templates | Organisation, access roles |
| Calendar event | Meeting, deadline, milestone or task due date | Client, project, user |
| Activity event | Auditable action and actor | Any business record |

## Client lifecycle
1. **Enquiry received** — record client contact, service/package, brief and requested date.
2. **Reviewing** — owner clarifies scope and feasibility.
3. **Quote drafted** — create a versioned proposal with scope, deliverables, price, assumptions and expiry.
4. **Quote sent** — customer can view, approve or decline; record actor and timestamp.
5. **Accepted** — approved quote becomes the project's agreed scope and amount.
6. **In progress** — tasks, milestones, conversations and files are tracked.
7. **Review / revisions** — customer reviews deliverables and requests revisions within the agreed scope.
8. **Completed** — deliverables accepted and project completion recorded.
9. **Invoiced / paid** — issue invoice and record verified payments separately.
10. **Ongoing support** — follow-up, maintenance and future opportunities.

A requested timeline is not a confirmed delivery commitment. A quote is not an invoice. A payment draft is not money received. A completed project is not automatically paid.

## Status vocabularies
- Enquiry: New, Reviewing, Awaiting client, Converted, Declined, Archived.
- Quote: Draft, Sent, Viewed, Approved, Declined, Expired, Superseded.
- Project: Planned, In progress, On hold, In review, Completed, Cancelled.
- Task: Todo, In progress, Blocked, Done.
- Deliverable: Draft, Shared, Changes requested, Approved, Superseded.
- Invoice: Draft, Issued, Partially paid, Paid, Overdue, Void.
- Payment: Pending verification, Verified, Reversed, Failed.

## Finance rules
- Only verified payments contribute to received revenue.
- Completed-job sales, approved project value, unpaid balances, quotes and projections must be shown separately.
- Expenses are not revenue. Profit is calculated only from correctly categorized, recorded income and costs.
- Partial payments must be allocated to a specific invoice and never exceed its outstanding amount.
- Currency defaults to BWP; store currency explicitly for future multi-currency work.
- Never mark a payment as verified from a customer-entered note or a local browser action.

## Security and integrations
- Use server-side authorization for all owner, staff and client operations.
- Keep private client briefs, quotes, invoices and attachments private by default.
- Store uploads through the approved UploadThing integration and persist metadata/ownership in the business database.
- Firebase/database/auth project IDs and credentials must be new and supplied/approved by the product owner; never inherit source project credentials.
- Do not add Firebase Storage. Use UploadThing for media.
- Record immutable activity events for quote approval, status transitions, payment verification, deliverable approvals and permission changes.

## Current prototype boundary
The current browser preview demonstrates public services, local enquiries, owner status changes, quote send/approve/decline, local project tasks, account messages/attachments, receipts, discounts and a requested-date calendar. Those records are browser-local and not shared or production-secure. The final database schema, auth provider, rules, indexes, storage metadata and live notifications remain pending the product owner's configuration details and end-to-end QA.
