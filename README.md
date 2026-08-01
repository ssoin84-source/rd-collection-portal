# RD Collection Management Portal

Full-stack app built from the requirements doc: Public Website + Admin Panel + Customer Portal,
Next.js (App Router) + PostgreSQL (Prisma) + Tailwind CSS.

Note on tech stack: the spec listed a separate Express.js backend. That was merged into Next.js
API routes instead, because Netlify hosts Next.js natively (frontend + API in one deploy) but does
not run a standalone Express server. The behavior is identical - only the file layout changed.

## What's included

- **Public site** — Home, About, Projects, Contact
- **Admin panel** — Dashboard, Customer Management (active/inactive/archive, bulk actions, profile
  panel, manual correction), Excel Import/Export, Lot Management (upload + delete-with-rollback),
  Customer Login Management (create/reset/enable-disable/link accounts), Reports, Settings
- **Customer portal** — read-only: accounts, details, transaction history, dues
- Auto-calculated Month Due / Pending Amount / Penalty / Total Due Amount
- Role-based access via signed session cookies + middleware route protection
- Hashed customer passwords (bcrypt); admin login via env vars (hardcoded, per spec)

## 1. Set up a database (5 min)

Netlify doesn't host Postgres directly, but it has a **built-in Neon Postgres integration**
("Netlify DB"), which is the easiest path:

1. In your Netlify site dashboard → **Extensions** → add **Neon** (or **Netlify DB**).
2. It provisions a Postgres database and adds a `DATABASE_URL` env var to your site automatically.

(Alternative: create a free DB directly at neon.com, supabase.com, or railway.app and paste its
connection string into `DATABASE_URL` yourself — works exactly the same way.)

## 2. Push this code to GitHub

```bash
cd rd-portal
git init
git add .
git commit -m "Initial commit: RD Collection Management Portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 3. Connect the repo to Netlify

1. Netlify dashboard → **Add new site → Import an existing project**.
2. Pick your GitHub repo. Netlify auto-detects Next.js (via `@netlify/plugin-nextjs`, already in
   `package.json` and `netlify.toml`) — build command and publish directory are pre-configured.
3. Before the first deploy, add these environment variables under
   **Site configuration → Environment variables**:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | (auto-filled if you used the Neon extension in step 1) |
   | `ADMIN_ID` | `Admin123` |
   | `ADMIN_PASSWORD` | `Admin@123` |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` |

4. Click **Deploy**.

## 4. Create the database tables (one-time)

After `DATABASE_URL` is set, run this **once** — either from your own machine (with the same
`DATABASE_URL` in a local `.env`) or via `netlify dev`/CLI:

```bash
npx prisma db push        # creates all tables from prisma/schema.prisma
npm run db:seed           # optional: adds one sample customer + login for testing
```

`db:push` is safe to re-run; it's non-destructive for existing data.

## 5. Log in

- **Admin**: `/admin/login` → Admin ID `Admin123`, Password `Admin@123` (or whatever you set in env vars)
- **Sample customer** (if you ran the seed): `/customer/login` → username `ramesh.kumar`, password `Customer@123`
- Real customer logins are created from **Admin → Customer Login Management** — there is no
  self-registration, exactly as specified.

## Local development

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL and AUTH_SECRET
npx prisma db push
npm run db:seed
npm run dev                # http://localhost:3000
```

## Notes on things that differ slightly from a bare Express+Multer setup

- **File uploads**: Excel import/export is handled entirely in-memory (parsed and streamed back),
  since Netlify Functions can't write to persistent disk. No files are stored — matches the spec's
  "preview before save" flow.
- **Penalty rate**: configurable from Admin → Settings (defaults to ₹10/overdue month) rather than
  a fixed hardcoded value, so you can tune it without redeploying.
