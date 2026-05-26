# kiranbabuthatha.github.io

Personal portfolio for **Kiran Babu Thatha** — Senior Product Analyst,
SEO &amp; Data Strategy. Berlin.

## Site map

```
/                                                — Home portfolio
/seo/                                            — Freelance services landing
/seo/automation-services-python/                 — Python automation deep-dive
```

## Stack

Plain static HTML + CSS. No build step. Fonts via Google Fonts
(Fraunces + Geist + Geist Mono).

## Editing

- All shared styles live in `styles.css` at the repo root.
- Each page is a self-contained HTML file that references `styles.css`
  with a relative path (`styles.css`, `../styles.css`,
  `../../styles.css` from the three depths).
- Color tokens are defined in `:root` at the top of `styles.css`.
  Edit them in one place to retheme the whole site.

## Deploying

This repo is served by GitHub Pages from the `main` branch. Push and it
goes live.
