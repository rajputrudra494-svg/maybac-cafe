# Maybac — café & pâtisserie website

The website for **Maybac**, a luxury café and pâtisserie on the 3rd floor of
International Wealth Centre, VIP Road, Vesu, Surat. Pure vegetarian, open daily
11 AM – 1 AM.

A static, hand-built site — no framework, no bundler, no build step to install.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home — hero, the Sleeping Teddy signature, specials |
| `menu.html` | The full menu, searchable and filterable |
| `room.html` | The room — photography, details, celebrations |
| `visit.html` | Address, hours, and a booking form that opens WhatsApp |

## Running it

Any static file server will do:

```bash
python -m http.server 5375
```

Then open <http://127.0.0.1:5375/>.

## Editing

The four HTML files at the root are **generated** — don't edit them directly.
They are assembled from shared partials:

```
_src/
  partials/   head.html, chrome.html, footer.html   (shared by every page)
  pages/      the per-page body sections
  build.py    stitches them together
```

Change a file under `_src/`, then rebuild:

```bash
python _src/build.py
```

Everything else is edited in place: `css/style.css`, `js/*.js`, `assets/img/`.
The menu lives as data in `js/menu-data.js`.

## How it's put together

- Plain HTML, CSS and JS. GSAP + ScrollTrigger for motion, Lenis for smooth
  scrolling, three.js for the Sleeping Teddy scene — all from a CDN.
- Responsive from 320px up, verified at 320 / 360 / 390 / 414 / 768 / 1024 /
  1440 / 1920. The nav collapses to a drawer below ~960px.
- Respects `prefers-reduced-motion`, and the loader has a hard failsafe so the
  page always reveals itself even if animation frames never arrive.
- Images are WebP, served at two sizes with a `-sm` variant for small screens.
