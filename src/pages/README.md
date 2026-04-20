# Pages Structure Convention

## Domain Folders
- `admin/`: admin, dashboard, and management pages.
- `custom-bag/`: user bag customization flow pages.
- `order/`: order success and lookup pages.
- `media/`: audio and media playback pages.
- `map/`: map experience pages.
- `shared/`: shared page-level UI states (loading, empty states, etc.).

## Barrel Exports
Each domain folder should have an `index.js` file that exports page components.
Use these barrels in route modules to keep imports concise and maintainable.

## Naming Rule (from now on)
- New page components: `FeatureNamePage.jsx`
- New page styles: `FeatureNamePage.css`
- Keep one page component per file.

## Practical Rule
- Prefer moving files into the right domain folder instead of creating a flat `pages/` list.
- If a page is reused in multiple route branches, place it under `shared/`.
