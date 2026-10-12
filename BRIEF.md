# Brief: Hebrew 3D-print store site, v1 (static)

## Owner
Matias, Ra'anana, Israel. Two Bambu Lab P2S printers with AMS Pro 2 (multicolor, up to 4+ colors per print). Prints PLA and PETG. Designs custom functional parts himself (parametric CAD). F1 fan (papaya orange), tinkers with electronics/Arduino. Business plan note: "start with ready-made products, add custom orders later"; WhatsApp-first contact; Instagram/TikTok for traffic. No prices exist in his notes -> NEVER invent prices; use "החל מ-₪__" placeholders.

## Store name (FINAL, chosen by Matias)
Brand: **Papaya Prints** — always written in Latin letters as the wordmark/logo (a nod to F1 papaya orange). In Hebrew running copy, "פפאיה פרינטס" may be used where a Hebrew rendering reads better (e.g. page <title> can be "Papaya Prints | הדפסות תלת-ממד בהתאמה אישית ברעננה"). Tagline: "הדפסות תלת-ממד בהתאמה אישית · רעננה". No alternative names anywhere. Note: Latin text inside RTL paragraphs must render correctly (wrap in <span dir="ltr"> / <bdi> where needed).

## Hard requirements
- Static: plain HTML/CSS/JS, no build step, no backend. Deployable as-is from `site/` to Vercel/Netlify/GitHub Pages. All paths relative.
- `<html lang="he" dir="rtl">`. Use CSS logical properties (margin-inline-start, inset-inline-end, text-align:start etc.), no left/right hacks. Icons with direction (arrows) must point correctly in RTL.
- Fonts via Google Fonts CDN with preconnect + `display=swap`: Hebrew-capable. Suggested: "Rubik" (display, 600-800) + "Assistant" or "Heebo" (body); a mono for spec labels (e.g. "JetBrains Mono" for latin/numbers only). Sensible system fallbacks.
- Mobile-first, responsive (390px phone up to 1440px desktop). No horizontal overflow at any width. Tap targets >= 44px.
- Accessible: semantic landmarks, alt text in Hebrew, visible focus states, AA contrast, prefers-reduced-motion respected. SEO meta (title, description, og tags placeholders), favicon (inline SVG ok).

## Sections (in order)
1. Header: logo/wordmark, anchor nav (collapses on mobile), WhatsApp CTA.
2. Hero: clear value prop — custom 3D prints designed and printed in Ra'anana; functional fixes, holders, gifts. Primary CTA "שלחו תמונה ומידות בוואטסאפ", secondary "לגלריה". Small spec chips (e.g. "PLA · PETG", "עד 4 צבעים בהדפסה אחת", "תכנון בהתאמה אישית", "איסוף ברעננה").
3. Featured products / gallery grid (cards: image, Hebrew name, one-line description, material tag, "החל מ-₪__", "להזמנה בוואטסאפ" link pre-filled with product name). Products:
   - מזין בדיל לפרק כף היד (wearable solder feeder; ring button at fingertip, wrist unit pushes solder). REAL renders: assets/img/solder-feeder-closeup.png, assets/img/solder-feeder-hand.png
   - מאריך ידית בלם לאופני ילדים (one-piece lever extender, zip-tie mount, 70×40×14 mm, ~17g, for a 6-year-old's 20" bike). REAL CAD drawing: assets/img/brake-lever-extender-drawing.png (a blue technical top-view plot, white bg; present it as a "שרטוט תכנון" in a blueprint-style frame, object-fit: contain)
   - מתקן סקאדיס (IKEA SKÅDIS) למברגה + מעמד ביטים — placeholder
   - מעמד לסניץ' הזהב — placeholder
   - סירת בנצ'י בצבעי פפאיה ושחור (F1-inspired; DO NOT write McLaren or use any team logo) — placeholder
   - תיקונים לבית ולמכשירי חשמל (e.g. widened light-switch lever base, replacement clips) — placeholder
   - מתאם לזרוע עוזרת + זכוכית מגדלת — placeholder
   - פריטים לילדים (names, hooks, toys) — placeholder
   Placeholders: tasteful CSS/SVG (e.g. blueprint grid + layer lines + simple isometric outline + small label "תמונה תתווסף בקרוב" and a `data-placeholder="replace-with-photo"` attribute + HTML comment `<!-- PLACEHOLDER: replace with real photo -->`). They must look intentional, not broken.
4. Custom-order flow: "שולחים תמונה + מידות, מקבלים תכנון" — what to send (photo with a ruler/caliper, measurements, material/color preference, quantity), what you get (design preview/render for approval before printing). CTA to WhatsApp.
5. How it works: 3 steps (שולחים → מתכננים ומאשרים → מדפיסים ואוספים/משלוח).
6. Materials & colors: PLA vs PETG comparison (PLA: indoor, wide color range, crisp detail; PETG: tougher, more heat/UV/moisture resistant, good for outdoor, bike and appliance parts), multicolor AMS (up to 4 colors in one print with one AMS; say "רב-צבעוני"). Color swatches row (generic filament colors, labeled "צבעים לדוגמה – המלאי משתנה").
7. FAQ (accessible <details>/<summary>, 6-8 Qs): how long, pricing (depends on size/time/material — quote on WhatsApp), shipping vs pickup in Ra'anana (marked TBD), can you copy a broken part, strength/heat, files (STL) I already have, payment (Bit/PayBox/etc. — mark "יעודכן"), commercial quantities.
8. Contact: big WhatsApp button + Instagram placeholder.
9. Footer: name, Ra'anana, © year, links, small "מודפס על Bambu Lab P2S" note.

## Placeholders (must be centralized and obvious)
- WhatsApp number: `972500000000` — FAKE placeholder. Put it ONLY in one JS config object at top of `site/assets/js/main.js` (e.g. `const CONFIG = { whatsapp: '972500000000' /* PLACEHOLDER – replace */, instagram: 'https://instagram.com/PLACEHOLDER' }`) and build all wa.me links from it (with pre-filled Hebrew text, URL-encoded). HTML hrefs should still have a sensible fallback. Never use any real number.
- Instagram: `https://instagram.com/PLACEHOLDER`.
- Prices: "החל מ-₪__".
- Add `PLACEHOLDERS.md` listing every placeholder and where it lives.

## Visual direction (from Matias's own dashboard "Matias HQ")
His taste: a calm "workshop/engineering notebook" look. Tokens he chose for himself:
- light: bg #EDF1EE with a faint grid (rgba(47,122,91,.07)), surface #FFFFFF, label #FBFBF6, ink #16201C, muted #5A6A63, line #D2DBD6, accent green #2C7656 (soft #DDEEE5), warm #A55A12 (soft #F7E8D6)
- dark mode variant: bg #0E1412, surface #161F1B, ink #E5EDE9, accent #5BC495
- condensed display type, mono labels for specs/tags, radius ~10px, thin 1px lines, restrained shadows.
Adapt it for the "Papaya Prints" brand: papaya orange **#FF8000 is THE primary accent** (CTAs, wordmark highlight, key details). Keep his faint grid/blueprint + mono spec-label vibe, his ink/neutral tokens, and use his deep green #2C7656 only as a quiet secondary (e.g. success/info tags), or drop it if it fights the orange. #FF8000 has poor contrast with white text: use dark ink (#16201C) text on orange buttons, and a darker orange (e.g. ~#B35400 or darker, verify AA) when orange is used as text on light backgrounds. Orange also matches the orange PETG in his real renders. Should feel like a maker's precise studio, premium and human, not a generic template. Layer-line motif (thin horizontal lines like 3D-print layers) is welcome as a subtle decoration. Support prefers-color-scheme dark if cheap, but light is the primary look.

## Skills to follow (read these SKILL.md files first, in ~/.claude/skills/)
- frontend-design/SKILL.md — aesthetic direction & typography decisions.
- design-taste-frontend/SKILL.md — anti-slop rules and the pre-flight check (it is long; read the relevant landing-page parts).
- high-end-visual-design/SKILL.md — spacing, card structure, shadows.
- emil-design-eng/SKILL.md — polish details and restrained motion (hover/press states, subtle reveal on scroll, nothing gimmicky).
- web-design-guidelines/SKILL.md — use for a self-review at the end.
Skip anything that requires React/Tailwind/GSAP builds; this is vanilla.

## Files
site/index.html, site/assets/css/style.css, site/assets/js/main.js, site/assets/img/*, site/favicon.svg, README.md (how to run/deploy, name options), PLACEHOLDERS.md, .gitignore.
Images already copied into site/assets/img/ — optimize if huge (e.g. convert to webp with python PIL is fine; keep originals out of site/ or delete copies) and use width/height + loading="lazy".
