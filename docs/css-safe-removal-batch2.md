# CSS Safe Removal Batch 2

Date: 2026-04-19

## Scope
- Focus: internal unused selectors in `index.css` for legacy stack/marquee paths.
- Safety rule: remove only selectors with zero references in code files (`js/jsx/ts/tsx/html`) and not tied to runtime library classes.

## Removed (from `src/index.css`)

1. Legacy stack gallery block:
- `stack-gallery`
- `stack-card`
- `stack-card__label`
- `stack-card__overlay`
- `stack-gallery.steps`
- `steps-badge`
- related hover/touch/responsive variants for those selectors

2. Stale mobile-only ticker rule:
- `about-ticker__strip`

3. Mobile breakpoint legacy dependency on removed stack selectors:
- `@media (max-width: 1099px)` block styling for `.stack-gallery`

## Notes
- Current Products section uses `process-section.css` (`.process-*`) and does not depend on removed stack selectors.
- Ant/Leaflet/runtime selectors were excluded from deletion.