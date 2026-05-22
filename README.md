# JAYKAVI — Website (Stage 1)

A cinematic Next.js website for **Jayesh Prajapati "JAYKAVI"** — homepage,
about, journey timeline, searchable song archive, per-song pages with lyrics
and streaming links, a lyrics library, and a contact form. Dark/light theme,
smooth motion. All content reads from one file: `data/songwriter_data.json`.

This is **Stage 1**: no database, nothing to run on your PC. Vercel builds and
hosts it for you. Stage 2 (later) swaps the JSON for the **Sanity** CMS so your
dad can edit songs in a dashboard.

---

## Get it live (about 10 minutes, all in the browser)

### Step 1 — Put the code on GitHub
1. Go to **github.com → New repository**. Name it `jaykavi-site`, keep it
   **Private**, click **Create repository**.
2. On the new repo page, click **uploading an existing file**.
3. Drag in **everything inside this folder** (the `app`, `components`, `lib`,
   `data`, `public` folders and all the loose files like `package.json`).
   - Tip: do NOT upload `node_modules` or `.next` if they exist — they're not
     needed and are huge. (This zip already excludes them.)
4. Click **Commit changes**.

### Step 2 — Deploy on Vercel
1. Go to **vercel.com → Add New… → Project**.
2. **Import** your `jaykavi-site` repo (authorise GitHub if asked).
3. Vercel auto-detects Next.js. You don't need to change any settings.
4. Click **Deploy**. Wait ~1–2 minutes.
5. You'll get a live URL like `jaykavi-site.vercel.app`. That's your site. 🎉

Every time you change a file on GitHub, Vercel rebuilds automatically.

---

## How to add / edit songs (Stage 1)
Open `data/songwriter_data.json` on GitHub (click the file → pencil icon to
edit in the browser) and add entries to the `songs` array. Minimum useful
fields per song:

```json
{
  "id": "song-unique-id",
  "slug": "url-friendly-name",
  "title": "Song Title",
  "performingSingers": ["Geeta Rabari"],
  "language": "Gujarati",
  "genre": ["Lok Geet"],
  "lyrics": "Full lyrics here…",
  "platformLinks": [{ "platform": "youtube", "url": "https://…" }],
  "artworkUrl": "",
  "viewCount": 0,
  "isTrending": false
}
```

Commit, and Vercel redeploys with the new song. (Or fill the spreadsheet and
we convert it to this JSON for you.)

For a YouTube embed on the song page, set
`"embed": { "youtubeId": "VIDEO_ID" }` (the part after `watch?v=`).

---

## Turn on the contact form (optional, free)
1. Sign up at **formspree.io** (free), create a form, copy its endpoint ID.
2. Edit `app/contact/page.tsx`, replace `YOUR_FORM_ID` in `FORM_ENDPOINT`.
3. Commit. The form now emails you submissions, with built-in spam honeypot.

---

## What's here
```
app/            the pages (home, about, journey, songs, lyrics, contact)
components/     reusable UI (hero, song cards, nav, theme toggle, etc.)
lib/            data.ts — the single data source (swap to Sanity in Stage 2)
data/           songwriter_data.json — all your content
```

## Run locally (only if you want to — not required)
Needs Node.js 18+:
```
npm install
npm run dev      # opens http://localhost:3000
```

---

## Stage 2 preview (later)
- Connect **Sanity** CMS: your dad logs in, edits songs/lyrics/journey in a
  friendly dashboard. We change only `lib/data.ts` to read from Sanity.
- Wire the **song harvester** (separate folder) to push new YouTube finds
  straight into Sanity/JSON daily.
- Add Three.js ambient hero background and GSAP scroll storytelling.

Nothing built in Stage 1 is wasted — Stage 2 builds on top of it.
