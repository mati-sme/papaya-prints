# Papaya Prints: Hebrew RTL store site (v1)

A static, build-free landing and catalog site for a custom 3D-printing studio in Ra'anana. Plain HTML, CSS and JS. No backend, no dependencies.

```
site/
  index.html
  favicon.svg
  assets/css/style.css
  assets/js/main.js        <- CONFIG (WhatsApp number, Instagram) lives at the top
  assets/img/*.webp
```

Before launch, read [PLACEHOLDERS.md](PLACEHOLDERS.md). The WhatsApp number in the repo is fake.

## Run locally

Open `site/index.html` in a browser, or serve the folder with any static server, for example:

```sh
python3 -m http.server --directory site 8000
```

All paths are relative, so the site also works from a sub-path.

## Deploy

Publish the `site/` folder as-is. There is no build step.

- **Vercel**: import the repo, set *Root Directory* to `site`, framework preset *Other*.
- **Netlify**: publish directory `site`, no build command.
- **GitHub Pages**: publish from a branch and serve the `site/` contents (for example via an Actions workflow or by copying `site/` to the publish branch).

## Editing

- **Contact details**: edit `CONFIG` at the top of `site/assets/js/main.js`. Every WhatsApp link is built from it with a URL-encoded Hebrew message; product buttons add the product name.
- **Add a product**: copy a `<article class="card">` in the products grid, change the text, and set `data-wa-product` on its button. Keep the grid cell count even with the layout (the first card spans 4 of 6 columns on desktop, the rest span 2).
- **Replace a placeholder image**: swap the `.ph` div for an `<img>` with `width`/`height`, `loading="lazy"` and Hebrew `alt`.
- **Images**: export as WebP, around 1200 px wide.

## Design notes

- Palette: Matias HQ neutrals (`#EDF1EE` with a faint grid, `#16201C` ink) with papaya `#FF8000` as the single accent. Dark ink text sits on orange fills; `#A34700` is used when orange is text on light backgrounds (AA). Deep green appears only on the PLA card edge. Dark mode follows `prefers-color-scheme`.
- Type: Rubik (display), Heebo (body), JetBrains Mono for spec labels and numbers, all through Google Fonts with `preconnect` and `display=swap`.
- RTL: `<html lang="he" dir="rtl">`, logical CSS properties throughout, Latin strings wrapped in `dir="ltr"` / `<bdi>`.
- Motion: one restrained reveal on cards, steps and material cards, plus press feedback on buttons. Everything is disabled under `prefers-reduced-motion`.

## Name

The brand is **Papaya Prints** (Latin wordmark, a nod to F1 papaya orange). The Hebrew page title reads "Papaya Prints | הדפסות תלת-ממד בהתאמה אישית ברעננה". The name is final, so there are no alternatives to choose from.
