## Database documentation — for interns

This document explains, in plain terms, how this project's database is organized, where the schema/types/validation live, and exactly what to change when you add a column to a table so you don't break the app.

Keep this open when you make schema changes.

### Quick map: where things live (important files)

- `src/db/schema.ts` — table definitions using Drizzle ORM. This is the canonical schema in code.
- `src/db/types.ts` — TypeScript types that model rows and DTOs (sometimes derived from the schema or hand-written).
- `src/db/validation.ts` — Zod schemas used to validate server action inputs and API requests.
- `src/db/queries.ts` — helper query functions (CRUD) used by server actions.
- `src/actions/*.ts` — Server Actions (create/update) that accept validated inputs and call `queries`.
- `src/components/*` and `src/views/*` — UI forms that send data to server actions (update these when form fields change).

### Goal / contract when adding a field

When you add a column to a table the change should produce these outcomes:

- Database schema updated and migrated.
- Server-side validation accepts (or rejects) the new field correctly.
- TypeScript types reflect the new field so the codebase typechecks.
- Queries and server actions persist/read the new field.
- UI forms (client) show and send the new field where relevant.

Success criteria: app builds cleanly (tsc), unit tests pass (if present), and migrations apply without data loss.

### Step-by-step: safely add a column (recommended, zero-downtime-friendly)

Use this sequence. Treat each bullet as a small PR/commit.

1. Add the column to `src/db/schema.ts`.

   - Pick the right Drizzle type: `text()`, `integer()`, `boolean()`, `timestamp()`, etc.
   - Follow project conventions: money = integer cents, timestamps use `timestamp()` with defaults.
   - Example (conceptual):
     - Before: `name: text()`
     - Add: `phone: text().nullable()` if you want to avoid immediate backfill.

2. Update `src/db/validation.ts` (Zod schema).

   - Add the field to the input schema that the server action uses.
   - Decide validations: required vs optional, format rules (phone/email regex), min/max lengths.
   - Keep server validation authoritative — client-side validation helps UX but is not sufficient.

3. Update `src/db/types.ts`.

   - If types are hand-written: add the new property (with `?` if nullable).
   - If types are generated from schema, run the generator or follow the repo's generator command.

4. Update `src/db/queries.ts`.

   - Adjust insert/update shapes to include the new field where appropriate.
   - If you use `.returning()` ensure the new column is returned where callers expect it.

5. Update server actions in `src/actions/*.ts`.

   - Update input types, mapping from action input to DB payload, and any permission checks.
   - Ensure the action uses the updated Zod schema for parsing.

6. Update UI (forms/components/views).

   - Add the input field to the form component, wire it to the server action or fetch endpoint.
   - Map server-action error fields into the UI (the backend returns field-level errors).

7. Create and run a migration.
   - Use the project's Drizzle scripts. Common commands (from this repo's docs):

```bash
# generate migration files from schema changes
npm run db-generate

# apply migrations
npm run db-migrate
```

- Alternatively, if you need a manual SQL migration, add it to the `drizzle/` migrations folder and describe the change.

8. Backfill data if needed.

   - If the new column is NOT NULL, prefer doing it in two steps: add nullable column, deploy code that writes it, backfill existing rows, then add NOT NULL constraint in a later migration.

9. Test locally and deploy.
   - Run TypeScript build: `npm run build` (or `npm run dev` for quick smoke tests).
   - Run unit tests (if in repo): `npm test` or `npm run test`.
   - Verify server actions and UI flows that create/update rows.

### Example: add `phone` to `hospitals` (conceptual)

1. In `src/db/schema.ts` add `phone: text().nullable()` to `hospitals` table definition.
2. In `src/db/validation.ts` add `.optional()` or `.nullable()` to the Zod schema used by `createHospital`.
3. In `src/db/types.ts` add `phone?: string` to the `Hospital` type.
4. In `src/db/queries.ts` add `phone` to `insert` and `update` shapes.
5. In `src/actions/hospitals.ts` update the server action input type, and ensure `createHospitalAction` reads `input.phone`.
6. In the UI (`src/components` / `src/views/Auth` if relevant) add an input named `phone` and show validation errors.
7. Generate and apply migration, backfill if needed.

### Common gotchas / edge cases

- Forgetting to update validation: server actions will reject requests with unexpected shapes.
- Making a column NOT NULL without backfilling: migrations will fail on production data.
- Not updating `.returning()` or select lists: newly inserted rows may not include the new field when returned by queries.
- UI and API mismatch: client sends a field name that the server doesn't accept (typos) — server will ignore or reject depending on parsing.
- Indexing and performance: adding large text columns to frequently scanned indexes can slow queries — add indexes thoughtfully.

### Data modeling tips (short)

- Money: store currency amounts as integer cents (this repo follows that). Never use floats for money.
- Dates: store UTC timestamps and format at the UI layer.
- Foreign keys: keep ownership columns (e.g., `admin_id`) indexed.
- Booleans: explicit `is_active` flags are better than deleting rows.

### Validation & Types — how they fit together

- Validation (`src/db/validation.ts`) = runtime safety. It parses external input (forms, fetch) and returns field-level errors.
- Types (`src/db/types.ts`) = developer-time safety. They let TypeScript catch mistakes and help editors/autocomplete.
- Schema (`src/db/schema.ts`) = DB structure. Drizzle turns this into SQL (via migrations) and helps you write type-safe queries.

Workflow: request -> validation (Zod) -> actions (server) -> queries (Drizzle, types) -> DB

### Minimal checklist before merging a schema change

- [ ] Schema updated in `src/db/schema.ts` (and migration created)
- [ ] Zod schemas in `src/db/validation.ts` updated
- [ ] TypeScript types updated in `src/db/types.ts` (or regenerated)
- [ ] Queries updated in `src/db/queries.ts`
- [ ] Server actions updated in `src/actions/*` and use the new validation
- [ ] UI forms updated to send the new field(s)
- [ ] Migration applied locally and backfill completed (if required)
- [ ] Build, lint, and tests pass locally
- [ ] Short PR description explaining data migration/backfill plan

### Commands you'll likely use

Run these locally while developing:

```bash
npm run db-generate   # create migration from schema.ts changes
npm run db-migrate    # run migrations against local DB
npm run dev           # start the Next.js app in dev
npm run build         # TypeScript build check
npm test              # run unit tests (if available)
```

### If something breaks: quick debugging checklist

- Read the server logs where the failure happened.
- Check validation errors — Zod will usually show the failing field.
- Ensure migration actually ran and the new column exists in the DB (use Drizzle Studio or psql).
- Check TypeScript errors — they usually point to missing properties in types.
- Step through server action that writes/reads the field and add console logs.

---

Requirements coverage

- Explain schema, validation, types, and where to change when adding a field: Done.
- Provide safe step-by-step process for adding a column and migrations: Done.
- Include commands and checklist for verification: Done.

If you want, I can now:

- open `src/db/schema.ts` and show a live example adding a `phone` column, or
- create a PR-style patch that adds a sample migration and updates one action and validation so you can see a real change.

Pick one and I’ll do it next.
