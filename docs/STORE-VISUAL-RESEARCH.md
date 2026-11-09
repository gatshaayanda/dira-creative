# Storefront visual cues — research and implementation

## Product decision

The customer Store and the owner Briefcase's live showcase must communicate the same visible catalogue, announcement treatment and brand accent. Each service/product card uses its CRUD-managed media as its primary visual, plus one familiar category emoji as a quick visual cue. The owner preview mirrors those same assets and cues rather than showing a text-only approximation. Emoji supplement the service name, description and price; they do not replace labels or images.

The announcement remains a compact, high-contrast storefront banner. Its optional uploaded/linked thumbnail is shown in both the customer Store and the owner preview, with the same message and accent treatment.

## Evidence applied

- Baymard's large-scale product-list research explains that clear representative thumbnails help users scan and evaluate catalogue options. The 2026 homepage/category navigation findings also recommend easily interpreted thumbnails as visual labels rather than ambiguous decoration.
- Baymard's product-image research reports that 56% of tested users first explored product images on product pages, supporting the use of real CRUD-managed media as the primary card visual.
- Goetz & Neider (2024), *Keep it real, keep it simple*, found that concrete, simple icons support visual search while increasing visual complexity slows identification. This supports one familiar emoji cue per card, not a pile of decorative symbols.
- Deng & Liu (2025), *The effects of layout types, visual features and text labels on icon visual search performance*, examined layout, visual features and labels using eye tracking. The implementation keeps a clear name and price adjacent to each emoji/image so the visual cue is reinforced by text.
- Icon meaning varies by familiarity and audience. Emoji are therefore secondary cues, not the only way to identify a service; accessible text remains authoritative.

## Implementation rules

1. Prefer the service's CRUD-managed image/video; use a designed brand-colour fallback when no media exists.
2. Add one stable, familiar emoji mapping based on the service name.
3. Keep the same mapping, image, title, description and price in customer cards and admin preview cards.
4. Reuse the same announcement banner and optional thumbnail in both views.
5. Preserve compact card dimensions, responsive two-column phone layout, contrast and descriptive alt text.
6. Do not change install mechanics, service-worker behavior, persistence, upload endpoints or business rules for this visual-only task.

## Sources

- Baymard Institute, [Product Lists UX](https://baymard.com/research/ecommerce-product-lists)
- Baymard Institute, [Homepage & Category Navigation UX 2026](https://baymard.com/research-articles/ecommerce-navigation-best-practice)
- Baymard Institute, [Product Page UX: Include Descriptive Text or Graphics for Some Product Images](https://baymard.com/research-articles/product-images-descriptive-text)
- Goetz, J. N. & Neider, M. (2024), [Keep it real, keep it simple: the effects of icon characteristics on visual search](https://doi.org/10.1080/0144929X.2023.2286527)
- Deng, L. & Liu, R. (2025), [The effects of layout types, visual features and text labels on icon visual search performance](https://doi.org/10.1080/00140139.2024.2440767)
- Huang, S.-C., Bias, R. G. & Schnyer, D. (2015), [How are icons processed by the brain?](https://doi.org/10.1002/asi.23210)
