# US-[feature_id]: [Title]

<!--
  Create one file per feature using this template.
  Naming convention: US-{feature_id}-{short-name}.md
  Example filename:  US-F001-auth.md

  Generate stories automatically using the prompt in templates/user-story-template.md,
  or fill in this template manually for each feature in docs/features.json.
-->

## Feature
[Feature ID from features.json] — [Feature name]

<!-- Example: F002 — Create Invoice via Slash Command -->

## Priority
[critical | high | medium | low]

## User Story
As a [role], I want to [action], so that [benefit].

<!-- Example: As a freelancer, I want to create invoices by typing a Slack command, so that I don't have to open a separate invoicing tool. -->

## Optimal Path

1. [What the user does first]
2. [What the system responds with]
3. [Next user action]
4. [Final system response / outcome]

<!--
  Example:
  1. User types `/invoice Acme Corp $5000 due Jan 30` in Slack
  2. Bot validates the input and creates an invoice record
  3. Bot responds with "Invoice #INV-042 created for Acme Corp — $5,000 due Jan 30"
  4. Invoice appears in the dashboard with status "draft"
-->

## Edge Cases

- **[Edge case name]:** [What happens and what the expected behavior is]
- **[Edge case name]:** [What happens and what the expected behavior is]
- **[Edge case name]:** [What happens and what the expected behavior is]

<!--
  Example:
  - **Missing amount:** User types `/invoice Acme Corp` without an amount — bot responds with "Please include an amount, e.g., /invoice Acme Corp $500 due Jan 30"
  - **Negative amount:** User enters a negative number — bot rejects with "Amount must be positive"
  - **Past due date:** User sets a due date in the past — bot warns but allows it (some invoices are backdated)
-->

## Acceptance Criteria

- [ ] [Specific, testable criterion]
- [ ] [Another criterion]
- [ ] [Another criterion]

<!--
  Example:
  - [ ] /invoice command creates an invoice record in the database
  - [ ] Bot responds with confirmation including the invoice ID
  - [ ] Invalid input returns a specific, helpful error message
  - [ ] Invoice status defaults to "draft"
-->

## Test Notes

[Any specific testing instructions — environment setup, test data, tools to use]

<!--
  Example:
  - Mock the Slack API in tests — don't post to real channels
  - Test with amounts of $0, $0.01, $999,999.99, and negative values
  - Verify date parsing handles multiple formats (Jan 30, 2025-01-30, 1/30/25)
-->
