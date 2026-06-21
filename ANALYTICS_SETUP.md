# Analytics & Secret Admin Panel

Your portfolio now tracks visitors two ways:

1. **Local view log** — works immediately, no setup. Counts views from *your own
   browser* (stored in `localStorage`). Great for testing the admin panel.
2. **Google Analytics 4** — real, worldwide visitor data: how many people visit,
   which pages they view, where they came from, what device they use. Needs a
   free 2-minute setup (below).

---

## Opening the secret admin panel

Two hidden triggers (either works, on any page):

- **Type the word `admin`** anywhere on the page, or
- **Triple-click the faint dot** in the bottom-left corner of the screen.

The panel asks for a password (default `dharik`), then shows your local view
stats plus a button to open the full Google Analytics dashboard.

> ⚠️ **Security note:** the password lives in `assets/js/animations.js`, so anyone
> who reads the page source can find it. It's a light deterrent, not real
> security. Don't put anything sensitive behind it.

To change the password or the secret word, edit the top of
`assets/js/animations.js`:

```js
var ADMIN_SECRET_WORD = 'admin';     // word you type to open the panel
var ADMIN_PASSWORD    = 'dharik';    // panel password ('' = no password)
```

---

## Connecting Google Analytics (for real visitor data)

1. Go to **https://analytics.google.com/** and sign in with your Google account.
2. Click **Admin** (gear, bottom-left) → **Create** → **Property**.
3. Name it (e.g. "Portfolio"), pick your timezone, click **Next** → **Create**.
4. Choose platform **Web**, enter your site URL (`https://dhankism.github.io`),
   and create the **data stream**.
5. Copy the **Measurement ID** — it looks like `G-ABCD1234XY`.
6. Open `assets/js/animations.js` and paste it in:

   ```js
   var GA_MEASUREMENT_ID = 'G-ABCD1234XY';   // <- replace the placeholder
   ```

7. Commit and push. Within a day GA will show live visitors, page views, and
   the "Pages and screens" report (which is *what everyone views*).

That's it — the admin panel's **"Open Google Analytics"** button takes you
straight to the dashboard.
