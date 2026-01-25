/**
 * Demo Store Seeder
 * 
 * Seeds demo products to the Demo Store (store_id: 1) for showcase purposes.
 * Run: npx wrangler d1 execute DB --local --file=packages/database/src/seeds/seed-demo-store.sql
 * Or production: npx wrangler d1 execute DB --file=packages/database/src/seeds/seed-demo-store.sql
 */

// Demo Store ID
const DEMO_STORE_ID = 1;

// Demo Products data (from store-preview-data.ts)
export const DEMO_PRODUCTS_SQL = `
-- Clear existing demo products first
DELETE FROM products WHERE store_id = 1;

-- Electronics Category (8 products)
INSERT INTO products (store_id, title, slug, description, price, compare_at_price, image_url, category, inventory, status, created_at)
VALUES
(1, 'প্রিমিয়াম ওয়্যারলেস হেডফোন', 'premium-wireless-headphone', 'অসাধারণ সাউন্ড কোয়ালিটি এবং ৩০ ঘন্টা ব্যাটারি লাইফ সহ প্রিমিয়াম হেডফোন। নয়েজ ক্যান্সেলিং এবং ব্লুটুথ ৫.০ সাপোর্ট।', 4999, 5999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop', 'Electronics', 50, 'active', strftime('%s', 'now')),
(1, 'স্মার্ট ওয়াচ প্রো এডিশন', 'smart-watch-pro', 'হার্ট রেট মনিটর, স্টেপ কাউন্টার এবং স্লিপ ট্র্যাকিং সহ অ্যাডভান্সড স্মার্টওয়াচ। ওয়াটারপ্রুফ ডিজাইন।', 3499, 4499, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop', 'Electronics', 35, 'active', strftime('%s', 'now')),
(1, 'পোর্টেবল ব্লুটুথ স্পিকার', 'portable-bluetooth-speaker', 'কমপ্যাক্ট ডিজাইনে শক্তিশালী বেস। IPX7 ওয়াটারপ্রুফ এবং ১২ ঘন্টা প্লেটাইম।', 1999, 2499, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop', 'Electronics', 60, 'active', strftime('%s', 'now')),
(1, 'ট্রু ওয়্যারলেস ইয়ারবাডস', 'true-wireless-earbuds', 'একটিভ নয়েজ ক্যান্সেলেশন এবং ট্রান্সপারেন্সি মোড সহ প্রিমিয়াম ইয়ারবাডস।', 2499, 2999, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop', 'Electronics', 45, 'active', strftime('%s', 'now')),
(1, 'ফাস্ট চার্জিং পাওয়ার ব্যাংক', 'fast-charging-power-bank', '২০০০০mAh ক্যাপাসিটি, ২২.৫W ফাস্ট চার্জিং সাপোর্ট। একসাথে ৩টি ডিভাইস চার্জ করুন।', 1799, 2299, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop', 'Electronics', 80, 'active', strftime('%s', 'now')),
(1, 'মেকানিক্যাল গেমিং কীবোর্ড', 'mechanical-gaming-keyboard', 'RGB ব্যাকলিট, ব্লু সুইচ এবং এন্টি-ঘোস্টিং সহ প্রফেশনাল গেমিং কীবোর্ড।', 2999, 3799, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&h=800&fit=crop', 'Electronics', 25, 'active', strftime('%s', 'now')),
(1, 'ওয়্যারলেস চার্জিং প্যাড', 'wireless-charging-pad', '১৫W ফাস্ট ওয়্যারলেস চার্জিং। সব Qi-সাপোর্টেড ডিভাইসের জন্য কম্প্যাটিবল।', 899, 1199, 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=800&h=800&fit=crop', 'Electronics', 100, 'active', strftime('%s', 'now')),
(1, 'HD ওয়েবক্যাম', 'hd-webcam', '১০৮০p HD ভিডিও, অটো-ফোকাস এবং বিল্ট-ইন মাইক্রোফোন। ভিডিও কলিং এর জন্য পারফেক্ট।', 1599, 1999, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&h=800&fit=crop', 'Electronics', 40, 'active', strftime('%s', 'now'));
`;

console.log('Demo Store Seed SQL generated. Use the SQL file to seed.');
