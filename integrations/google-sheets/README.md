# Join form → Google Sheets

The Join page (`/join`) sends each application to a small Google Apps Script,
which adds it as a row in a Google Sheet. The sheet itself can stay private.

## Set it up (once)

1. Create a Google Sheet with the account that should own the applications.
2. In the sheet, open **Extensions → Apps Script**. Replace everything in
   `Code.gs` with the contents of [Code.gs](Code.gs) and save.
3. Choose **Deploy → New deployment**, then the gear icon → **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Press **Deploy**, allow access when Google asks, and copy the **Web app URL**
   (it ends in `/exec`).
5. Give the website that URL:
   - On your computer: copy `.env.example` to `.env.local`, paste the URL, and
     restart `npm run dev`.
   - On Vercel: **Project → Settings → Environment Variables**, add
     `VITE_JOIN_SHEET_URL`, then redeploy.
6. Send a test application. An **Applications** tab with the headings appears
   on the first one.

## Changing it later

After editing the script, use **Deploy → Manage deployments → Edit → Version:
New version → Deploy**. This keeps the same URL; a new deployment would not.

The year and department choices are in both `Code.gs` and
`src/features/join/fields.js`; change them together.

# Event registrations → Google Sheets

Event pages (`/events/<slug>`) that take registrations send each one to a
second Apps Script, [Registrations.gs](Registrations.gs). Each event gets its
own tab, named after its slug, and every question becomes a column. Only
events with `registration: true` in `src/features/events/data/events.js` (and
no `registerUrl` pointing to an outside form) send anything here.

## Set it up (once)

1. Create a **separate** Google Sheet for registrations (a script can only
   have one `doPost`, so it can't share the Join sheet's script).
2. **Extensions → Apps Script**, replace `Code.gs` with the contents of
   [Registrations.gs](Registrations.gs), and save.
3. **Deploy → New deployment → Web app**, Execute as **Me**, access
   **Anyone**. Copy the Web app URL.
4. Set `VITE_EVENTS_SHEET_URL` to that URL in `.env.local` (restart
   `npm run dev`) and in Vercel's Environment Variables (then redeploy).
5. Send a test registration. A tab named after the event appears with it.

## Adding an event or changing its questions

Only the website changes: edit `src/features/events/data/events.js` (and
`forms.js` for new kinds of forms). New questions become new columns in that
event's tab automatically. Every form needs at least one email question (or
an email in the members list), which is used to limit repeat sign-ups.

To stop an event accepting registrations even from an old copy of the site,
add its slug to `CLOSED` in the script and deploy a new version.
