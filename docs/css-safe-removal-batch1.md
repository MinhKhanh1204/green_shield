# CSS Safe Removal Batch 1

Date: 2026-04-19

## Scope
- Source scan for selector references only in code files: js, jsx, ts, tsx, html.
- Excluded from deletion: Ant Design runtime classes, Leaflet runtime classes, unknown runtime/generated classes.

## Removed Selectors (High Confidence)

Removed from src/index.css:

1. mission-wrap
2. section--impact
3. impact-wrap
4. impact-title
5. impact-grid
6. impact-tile
7. impact-inner (only in impact-tile scope)
8. impact-kicker
9. impact-value
10. impact-suffix
11. impact-label
12. impact-desc
13. impact-media
14. impact-lime
15. impact-soft
16. impact-dark
17. impact-cta
18. impact-mascot
19. btn-transparent

Reason: no string references found in code files and selectors are internal project selectors (not library/runtime selectors).

## Language Toggle Fix Included In Same Batch

1. Added explicit styles for lang-toggle-btn, lang-option, lang-label, lang-code, lang-caret.
2. Added dropdown styling under lang-dropdown.
3. Bound Ant Dropdown overlayClassName to lang-dropdown in LanguageToggle component.

## Notes

- Existing editor warnings for Tailwind/custom at-rules in src/index.css are unchanged and pre-existing.