# Landing Sections - Reference Components

> ⚠️ **Note**: These components were created as part of a section-based page builder approach.  
> We later decided to use **GrapesJS** for a more powerful page builder.  
> These files are kept as **design reference** for creating GrapesJS custom blocks.

## Files

| Component                 | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `HeroSection.tsx`         | Hero with headline, urgency badge, product image, CTA |
| `TrustSection.tsx`        | Trust badges (COD, Fast Delivery, Guarantee)          |
| `VideoSection.tsx`        | YouTube/Vimeo embed                                   |
| `GallerySection.tsx`      | Product image gallery grid                            |
| `BenefitsSection.tsx`     | Why buy section with icons                            |
| `ComparisonSection.tsx`   | Before/After comparison                               |
| `SocialProofSection.tsx`  | Order count display                                   |
| `TestimonialsSection.tsx` | Customer review screenshots                           |
| `FeaturesSection.tsx`     | Product features grid                                 |
| `DeliverySection.tsx`     | Dhaka/Outside delivery info                           |
| `FaqSection.tsx`          | FAQ accordion                                         |
| `GuaranteeSection.tsx`    | Guarantee text display                                |
| `WhyBuySection.tsx`       | Pain points vs Solution                               |
| `SectionRenderer.tsx`     | Dynamic section renderer based on sectionOrder        |
| `index.ts`                | Exports all components                                |
| `types.ts`                | TypeScript types                                      |

## Usage (For Reference)

```tsx
import { SectionRenderer } from "~/components/landing-sections";

<SectionRenderer
  config={landingConfig}
  product={product}
  storeName={storeName}
  currency="৳"
/>;
```

## Future Use

When implementing GrapesJS custom blocks, use these components as:

1. **Design reference** - Copy the styling/layout
2. **Content structure** - See what data each section needs
3. **Bangla text** - Reuse the Bengali labels and text

---

**Related**: See `docs/ADVANCED_PAGE_BUILDER_PLAN.md` for GrapesJS implementation plan.
