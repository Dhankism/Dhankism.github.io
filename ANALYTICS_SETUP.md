# Analytics & Secret Admin Panel

The site tracks visitors two ways:

1. **Local view log** — works immediately, no setup. Counts views from *your own
   browser* (localStorage). Good for testing the admin panel.
2. **Google Analytics 4** — real, worldwide visitor data (who visits, which pages,
   referrers, devices). Needs a free 2-minute setup (below).

---

## Opening the secret admin panel

Two hidden triggers, on any page:

- **Type the word `admin`** anywhere on the page, or
- **Triple-click the faint dot** in the bottom-left corner.

It asks for a password (default `dharik`), then shows local view stats plus a
button to open the full Google Analytics dashboard.

> ⚠️ The password lives in `assets/js/site.js`, so anyone reading the page source
> can find it. It's a light deterrent, not real security.

Change the password or secret word at the top of `assets/js/site.js`:

```js
var ADMIN_SECRET_WORD = 'admin';     // word you type to open the panel
var ADMIN_PASSWORD    = 'dharik';    // panel password ('' = no password)
```

---

## Connecting Google Analytics

1. Go to **https://analytics.google.com/** and sign in.
2. **Admin** (gear) → **Create** → **Property**. Name it, set timezone, **Create**.
3. Platform **Web**, enter `https://dhankism.github.io`, create the **data stream**.
4. Copy the **Measurement ID** (looks like `G-ABCD1234XY`).
5. In `assets/js/site.js`, replace the placeholder:

   ```js
   var GA_MEASUREMENT_ID = 'G-ABCD1234XY';
   ```

6. Commit and push. Within a day GA shows live visitors and the
   "Pages and screens" report (what everyone views).
