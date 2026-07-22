# Brand asset provenance

No source photograph is published from this directory.

## Storefront sign study

- **Implementation:** `src/lib/components/BrandMark.svelte`
- **Evidence:** user-supplied storefront sign photo
  `CleanShot 2026-07-22 at 14.24.37@2x.png`
- **Method:** responsive SVG geometry and live text; no raster pixels are embedded
- **Status:** provisional portfolio study pending owner approval or original logo files
- **Accessible name:** supplied from the canonical business name in structured content
- **Do not:** call this the official logo, export it for production signage, or remove
  the provisional provenance without owner confirmation

## Display font

- **Family:** Anton
- **Package:** `@fontsource/anton` 5.3.0
- **License:** SIL Open Font License 1.1 (`OFL-1.1`)
- **Use:** approximate the condensed storefront lettering; not claimed as the original
  typeface
- **Delivery:** one self-hosted Latin WOFF2 through the application bundle;
  `font-display: swap`

## Sampled palette

| Role     | Value     | Source                                                      | Status                          |
| -------- | --------- | ----------------------------------------------------------- | ------------------------------- |
| Sign ink | `#17141C` | dominant dark histogram cluster in the supplied sign photo  | Provisional photographic sample |
| Sign tan | `#A6855F` | dominant field histogram cluster in the supplied sign photo | Provisional photographic sample |

The pair measures 5.33:1 WCAG contrast. Photography, lighting, and display processing
can shift color; replace these values if the owner supplies original specifications.
