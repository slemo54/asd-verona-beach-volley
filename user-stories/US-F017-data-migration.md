# US-F017: Data Migration from Excel

## Feature
F017 — Data Migration from Excel

## Priority
high

## User Story
As an admin, I want all existing data migrated from Excel so the platform has all current information.

## Optimal Path
1. Admin runs the migration script against the source Excel file (VRB/gruppi_beach_volley_completo_con_formule.xlsx)
2. Script reads the Gruppi_Atleti sheet (A1:R137) and creates 17 groups
3. Script imports ~136 athletes with their group assignments, certificate types, and fee data
4. Script reads certificate data and creates corresponding certificate records
5. Script reads payment data and creates payment records per athlete
6. Script completes and prints a summary: groups created, athletes imported, certificates imported, payments imported, any skipped/error rows
7. Admin verifies counts in the dashboard match the Excel source data

## Edge Cases

- **Duplicate athlete names:** Two athletes with the same full name in the Excel — script detects the collision, logs a warning, and imports both with a disambiguation note (e.g., appending group name); does not skip silently.
- **Missing data in Excel cells:** A cell expected to contain group name, fee, or certificate type is empty — script uses a safe default (null or a placeholder) and logs the row as incomplete; migration continues.
- **Athlete with no group:** An athlete row has no group assignment — script imports the athlete without a group assignment and flags the record for admin review.
- **Payment with zero fee:** A payment record has a fee of 0 EUR — script imports it as-is; zero-fee records are valid (e.g., sponsored athletes).
- **Certificate with past expiry:** An athlete's certificate expiry date is in the past — script imports the record with the original date and marks the certificate as expired; admin sees it flagged in the dashboard.

## Acceptance Criteria

- [ ] Migration script creates exactly 17 groups matching the Excel source
- [ ] Approximately 136 athletes are imported with correct group assignments
- [ ] Certificate data (type: agonistico / non agonistico / nessuno, expiry date) is imported for each athlete
- [ ] Payment data (fee amount, payment status) is imported per athlete
- [ ] Script is idempotent: running it a second time does not create duplicate records (upsert by athlete identity)
- [ ] Script prints a final summary report with counts and any error/skipped rows
- [ ] Imported data passes integrity checks: no orphaned athletes, no missing group references

## Test Notes
Source file: VRB/gruppi_beach_volley_completo_con_formule.xlsx. Sheets: Gruppi_Atleti (A1:R137), Presenze (A1:I1000), Disponibilita_Recuperi (A1:E20). Detailed column mapping is in IMPLEMENTATION_PLAN.md. Run the script with --dry-run first to validate without writing to the database. After a full run, verify counts in Supabase match: 17 groups, ~136 athletes. Test idempotency by running the script twice and confirming no duplicate records are created.
