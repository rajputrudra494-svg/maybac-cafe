"""Assembles the static pages from shared partials.  Run:  python _src/build.py"""
import pathlib, re

SRC = pathlib.Path(__file__).parent
ROOT = SRC.parent
P = lambda n: (SRC / "partials" / n).read_text(encoding="utf-8")
G = lambda n: (SRC / "pages" / n).read_text(encoding="utf-8")

HEAD, CHROME, FOOT = P("head.html"), P("chrome.html"), P("footer.html")

IMPORTMAP = """  <script type="importmap">
  { "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/" } }
  </script>
  <link rel="preload" as="image" href="assets/img/teddy-pour-sm.webp">"""

PAGES = {
    "index.html": dict(
        page="home",
        title="Maybac — Luxury Café &amp; Pâtisserie · Vesu, Surat",
        desc="A luxury café &amp; pâtisserie on the 3rd floor of International Wealth Centre, VIP Road, Vesu, Surat. Home of the Sleeping Teddy. Open daily, 11 AM – 1 AM.",
        extra_head=IMPORTMAP,
        parts=["home_hero.html", "home_intro.html", "home_teddy.html", "home_specials.html", "home_end.html"],
        scripts='<script src="js/teddy.js"></script>',
    ),
    "menu.html": dict(
        page="menu",
        title="Menu — Maybac, Surat",
        desc="The full Maybac menu with prices: kitchen, pâtisserie, coffee &amp; bar. Pure vegetarian, Jain options marked.",
        extra_head="",
        parts=["menu_page.html"],
        scripts='<script src="js/menu-data.js"></script>\n<script src="js/menu.js"></script>',
    ),
    "room.html": dict(
        page="room",
        title="The Room — Maybac, Surat",
        desc="Rose arches, globe lights, wine leather and walnut. See inside Maybac at IWC, Vesu, and plan a celebration with us.",
        extra_head="",
        parts=["room_hero.html", "room_story.html", "room_rest.html"],
        scripts="",
    ),
    "visit.html": dict(
        page="visit",
        title="Visit &amp; Book — Maybac, Surat",
        desc="316, 3rd Floor, International Wealth Centre, VIP Road, Vesu, Surat. Open daily 11 AM – 1 AM. Book a table on WhatsApp or call +91 81406 08376.",
        extra_head="",
        parts=["visit_page.html"],
        scripts="",
    ),
}

for out, cfg in PAGES.items():
    body = "".join(G(p) for p in cfg["parts"])
    chrome = CHROME
    # mark the current page in the nav
    chrome = re.sub(r'data-nav="%s"' % cfg["page"], 'data-nav="%s" aria-current="page"' % cfg["page"], chrome)
    html = (
        HEAD.replace("{{title}}", cfg["title"]).replace("{{desc}}", cfg["desc"])
        .replace("{{extra_head}}", cfg["extra_head"]).replace("{{page}}", cfg["page"])
        .replace("{{body_class}}", "page-" + cfg["page"])
        + chrome
        + '\n<main id="main">\n' + body + "\n</main>\n"
        + FOOT.replace("{{scripts}}", cfg["scripts"])
    )
    (ROOT / out).write_text(html, encoding="utf-8")
    print("built", out, len(html), "bytes")
