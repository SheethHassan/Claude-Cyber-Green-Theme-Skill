---
name: cyber-green-theme
description: A Matrix-style "Cyber Green" dark theme for any web UI - green code rain on a canvas behind the app, phosphor glow, monospace type, scanlines and vignette, dense dark panels, with a measured-contrast token set and a status palette that keeps success from clashing with the brand green. Use when the user asks for a cyber green, Matrix, hacker-terminal or neon-green theme, or to add this theme to a project.
---

# Cyber Green (the Matrix theme)

A complete dark theme: near-black stage, neon green `#39FF88` as the brand, falling half-width katakana and digits behind the whole app, a green glow on what matters, scanlines and a vignette over the window. It was designed and shipped in TMS (a tender-management web app, React + Tailwind + shadcn, Arabic and English) on 2026-11-02, and every value below was measured there. Take the values as they are; change them only for a reason you can measure.

Files in this skill:

- `references/theme.css` - the tokens as CSS variables and the whole look (glow, type, scanlines). Framework-neutral; map the selectors to the project's own classes.
- `references/rain.js` - the code rain as a dependency-free canvas module (start, stop, still frame, resize, reduced motion).
- `references/contrast.py` - the contrast check to run on any change to a colour or to the rain's opacity.

## What breaks the usual rules, and nothing else

The theme is allowed to have things a calm UI would not. Keep it to these:

1. **Gradients** - only the scanlines and the vignette (`::after` on the root element). Nowhere else; fills, buttons and charts stay solid.
2. **Glow** - a green `text-shadow` or `box-shadow` on headings, big numbers, the primary button and the current page/nav item. Never on red, amber or gold things (failure, urgency, favourites), or they stop meaning anything.
3. **Code rain instead of blurred blobs** - a canvas behind the app, dim, never behind bare text at full strength (see Contrast).

If the project has a "no gradients" test or lint rule, exempt the one stylesheet that holds the scanlines and say why in a comment.

## Tokens

| Role | Value |
| --- | --- |
| Stage (background) | `#020805` |
| Text / muted text | `#E8FFF2` / `#B5D1C2` |
| Panel (dense, 84% opaque) | `rgba(3,18,8,.84)` |
| Popover / dropdown | `#06180E` |
| Primary (button, ring) | `#39FF88`, label `#03120A` |
| Link / chart highlight | `#7DFFB3` |
| Muted fill / accent fill | `rgba(57,255,136,.07)` / `rgba(57,255,136,.14)` |
| Edge / border | `rgba(57,255,136,.38)` / `rgba(57,255,136,.22)` |
| Sidebar | `rgba(2,8,5,.86)`, text `#B5D1C2` |
| Rain head / trail | `#CFFFE0` / `#39FF88`, layer opacity **0.28** |
| Glow | `rgba(57,255,136,.55)` |
| Radius | 4 px (sharp) |
| Warning / error text | `#FCD083` / `#FCA5A5` (dots `#F59E0B` / `#EF4444`) |
| **Success** | text `#A5F3FC`, dot `#22D3EE`, tint `rgba(34,211,238,.16)` (ice cyan, not green) |
| Favourite star (if any) | `#FACC15` |

### Why success is cyan

Green normally means success. In a neon-green theme the brand and "passed" would be the same colour, so a Strong or Done badge would look like decoration. Success becomes ice cyan here. This means **status colours must be per-theme tokens**, not shared constants. If the project hard-codes `#22C55E` as success, move it into the theme first.

## Type

- Latin letters and digits: **Share Tech Mono** (Google Fonts, or the `@fontsource/share-tech-mono` npm package). It has one weight only, so set `font-synthesis-weight: none` or the browser draws a smeared fake bold.
- Other scripts: put the script's own font after it in the stack. For Arabic use `'Noto Sans Arabic'`: the mono face has no Arabic, so the browser falls through letter by letter. Same idea for any non-Latin text.
- Stack: `'Share Tech Mono', '<script font>', ui-monospace, Consolas, monospace`.
- If the project's CSS framework sets fonts with utility classes (Tailwind's `font-sans`), the theme rule must be unlayered CSS so it wins; set it on `body *:not(svg, svg *)`.

## The rain

`references/rain.js` is the whole thing. The rules that matter:

- A fixed canvas behind everything (`position: fixed; inset: 0; z-index: -10; pointer-events: none; aria-hidden`), opacity set from one variable (`--rain-opacity: .28`).
- One column per 16 px, each with a head that falls at 0.55 to 1.03 rows a frame (speed varies by column index so it is not a wall). A frame every 55 ms (about 18 a second); each frame paints the stage colour at 6% over the last, which is the trail.
- **Write a glyph once per row**, not every frame: heads move in fractions of a row, and redrawing at fractional positions smears overlapping glyphs into a blur.
- Pre-roll about `(height / 16 + 40) / 0.55` frames before the first paint so the screen opens already full of rain.
- Run only while the page is visible and focused. Hold one still frame (the pre-rolled one) for `prefers-reduced-motion`, and where the browser draws without a graphics card (headless Chromium, remote desktops, VMs), where full-screen canvas animation costs frames.
- Pause while the app is busy with something heavy (a long load or a background job), if the app has such a state.

## Contrast: the rule that decides the opacity

Panels are dense (84% dark), so text inside them is far above AA. Text **straight on the rain** (page titles, subtitles, a filter bar with no panel) is the risk: it sits on the brightest glyph at the rain's opacity. Measure, do not guess:

- Colour behind text = `rain head colour at layer opacity` over the stage.
- Every text colour you use must be >= 4.5:1 against that. At opacity 0.30 the red error text fell to 4.40:1 and failed; at **0.28** it is 4.74:1. Body 8.6, muted 5.5, link 7.2, success 7.2, warning 6.2.
- Run `references/contrast.py` after changing any colour or the opacity.
- A dark text halo (`text-shadow: 0 0 3px <stage>, 0 0 8px <stage>`) on bare subtitles stops glyphs running through the letters. It helps readability but does not replace the measurement.
- Best practice that kept the app readable: every dense block of text sits on a panel; only short headings and one-line subtitles are bare.

If you also want a still, no-animation fallback for people who set `prefers-reduced-transparency`, the panels are already opaque enough; keep the one pre-rolled rain frame.

## How to apply in a new project

1. **Tokens first.** Add the theme as one more named theme beside the existing ones (a `data-theme="cyber-green"` attribute on `<html>`, and a stored choice if the app has a theme picker). Copy `references/theme.css`, map the variable names to the project's (shadcn uses `--background`, `--primary`, and so on, as in the file).
2. **Per-theme status colours.** Make success/warning/error tokens belong to the theme, with the cyan success above.
3. **Backdrop.** In place of the existing blurred blobs, mount the canvas with `rain.js` while the theme is active (React: a component with a ref and an effect that calls `startMatrixRain` and returns its `stop`). Also on the sign-in page.
4. **Type and glow** from `theme.css`; map `.bg-primary` and the active-nav selector to the project's primary button and current-item selectors.
5. **Fonts.** Install Share Tech Mono; keep the project's non-Latin font after it.
6. **Theme card / preview.** A theme picker's small picture should show a few columns of rain instead of blobs (seven dashes of different heights in the primary green at the rain opacity is enough).
7. **Check in a real browser** in every language the project ships, with a graphics card on (`--use-angle=d3d11 --enable-gpu` in headless Chromium on Windows) and off. A software-rendered headless run shows only the still frame, so it will not prove the rain falls.
8. **Tests worth keeping:** the contrast of every text colour over the brightest glyph; every selector in the theme stylesheet is scoped to the theme (so no other theme can pick one up); a gradient appears only in that stylesheet; the rain canvas is `aria-hidden` with `pointer-events: none`; the rain steps (heads move, restart after the bottom, write once per row) as pure functions.

## Pitfalls seen while building it

- **Do not put the scanline overlay on `body::after`** if the page background is set on `html`; use `html[data-theme]::after` with `position: fixed`, so it covers dialogs and portals too. It takes no clicks.
- **A dev server restarts when `.env.local` changes** (Vite). If you park that file to turn a sign-in off for a screenshot, keep it parked until the screenshots are done, then restore it.
- **jsdom cannot hold `opacity: var(--x)`** (it reads back `NaN`). Test that value from the source file, not from the DOM.
- **Several shell heredocs in one command can fail on quotes.** Write multi-file edits as a script file and run it.
- A "worst case" contrast test is cheapest if the rain's two glyph colours and its opacity are the theme's `blob` tokens (the same ones a blurred-blob theme uses): the project's existing "text over the brightest blob" tests then measure the rain for free.
