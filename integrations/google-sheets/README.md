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
