# Quick Builder Testing Checklist

## SEO Features

- [ ] **SEO Panel in Editor**

  - Go to `/landing-live-editor`
  - Open "SEO সেটিংস" accordion
  - Add Meta Title, Description, OG Image
  - Publish and verify in browser dev tools

- [ ] **Meta Tags Rendering**

  - View your landing page source (Ctrl+U)
  - Verify `<title>`, `<meta name="description">`, `og:image`, `twitter:card` tags

- [ ] **Sitemap**
  - Visit `/sitemap.xml` on your store domain
  - Verify products and offers are listed

---

## Version History

- [ ] **Save on Publish**

  - Make changes in editor
  - Click "পাবলিশ করুন"
  - Open "ভার্সন হিস্ট্রি" accordion
  - Verify version appears with timestamp

- [ ] **Restore Version**
  - Click restore on an older version
  - Verify draft is updated
  - Page should reload with restored content

---

## Template Analytics

- [ ] **Order Tracking**
  - Create a test order
  - Check database: `SELECT * FROM template_analytics`
  - Verify `orders_generated` and `revenue_generated` columns

---

## JSON-LD Schema

- [ ] **Product Schema**
  - Go to `/offers/{productId}`
  - View page source
  - Search for `application/ld+json`
  - Verify Product schema is present
