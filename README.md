# mcclements02.github.io

Portfolio site for Matthew Clements: Principal Solution Architect and product engineer.

Live at **https://mcclements02.github.io**. Local edits appear only in the preview until published.

A static portfolio with no framework, build step, or trackers. The look is galactic anime: deep-space background, gold energy accents, and an opening power-up sequence on the home page.

## Pages

- `index.html`: the five main projects in first person (what each does, the hard parts, what went wrong), side projects, about, and contact.
- `assets/intro.js`, `assets/intro.css`, `assets/intro/`: the opening sequence. It plays once per browser session, can be skipped with a click or Esc, is replayable from the hero button or `?intro`, and never plays for visitors who prefer reduced motion. The page works without it and without JavaScript.
- `projects/index.html`: Sango Sports Lab, Socks. | Sockster, offEarth, and cAIrn, with category and technology search.
- `projects/{sango,socks,offearth,cairn}/index.html`: concise product overviews, role summaries, screenshots or brand artwork, and underlying technology families.
- `projects/scks/index.html`: compatibility redirect to the renamed Socks. | Sockster page.
- `assets/site.css`, `assets/site.js`, and `assets/cases.css`: shared appearance, interaction, and product-overview layout.
- `assets/cairn-logo.svg`: original scalable cAIrn mark built from four stacked stones.
- `assets/social-preview.html`: editable source for the 1200 × 630 social-preview artwork.
- `assets/og-portfolio-2026.jpg`: the published Open Graph and Twitter preview image. `assets/og.png` is its compatibility copy for older image links.

Sango and Socks. | Sockster visuals use the existing product screenshots. offEarth uses its existing app brand mark. cAIrn uses an original blue-and-violet vector identity. Product screenshots link to their full-size originals.

## Public content boundary

Keep public content focused on the product experience, general responsibilities, and underlying technology names. Proprietary algorithms, scoring rules, thresholds, detailed system diagrams, security or payment workflows, source excerpts, internal measurements, and repository statistics do not belong in these pages or their metadata. Do not put removed implementation material in hidden HTML, comments, or expandable sections.

cAIrn is an open-source project and links to its existing public repository. The portfolio describes its purpose and technology at a high level.

All product content and links work without JavaScript. JavaScript adds persistent light/dark mode and shareable filters. Both themes respect system preferences, and motion respects reduced-motion preferences. Content is never hidden while waiting for JavaScript or animation.

## Edit and preview

```bash
python3 -m http.server 4321 --bind 127.0.0.1 --directory .
```

Open http://localhost:4321. You can also open `index.html` directly; internal page links explicitly name their HTML files so local navigation works without folder listings. Pushing to `main` redeploys through GitHub Pages.
