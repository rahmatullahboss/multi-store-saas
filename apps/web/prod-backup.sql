PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  plan_type TEXT DEFAULT 'free',
  logo TEXT,
  theme TEXT DEFAULT 'default',
  currency TEXT DEFAULT 'USD',
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
, mode TEXT DEFAULT 'store', featured_product_id INTEGER REFERENCES products(id), landing_config TEXT, theme_config TEXT, `default_language` text DEFAULT 'en', `notification_email` text, `email_notifications_enabled` integer DEFAULT true, `low_stock_threshold` integer DEFAULT 10, `favicon` text, `social_links` text, `font_family` text DEFAULT 'inter', `footer_config` text, `custom_domain_request` text, `custom_domain_status` text DEFAULT 'none', `custom_domain_requested_at` integer, `subscription_status` text DEFAULT 'active', `usage_limits` text, business_info TEXT, `cloudflare_hostname_id` text, `ssl_status` text DEFAULT 'pending', `dns_verified` integer DEFAULT false, onboarding_status TEXT DEFAULT 'pending_plan', setup_step INTEGER DEFAULT 0, `custom_privacy_policy` text, `custom_terms_of_service` text, `custom_refund_policy` text, courier_settings text, payment_transaction_id TEXT, payment_status TEXT DEFAULT 'none', payment_submitted_at INTEGER, payment_amount REAL, payment_phone TEXT, is_customer_ai_enabled INTEGER DEFAULT 0, ai_bot_persona TEXT, `subscription_payment_method` text, `subscription_start_date` integer, `subscription_end_date` integer, `admin_note` text, `shipping_config` text, `facebook_pixel_id` text, `deleted_at` integer, `google_analytics_id` text, `facebook_access_token` text, monthly_visitor_count INTEGER DEFAULT 0, visitor_count_reset_at INTEGER, manual_payment_config TEXT, ai_agent_request_status TEXT DEFAULT 'none', ai_agent_requested_at INTEGER);
INSERT INTO "stores" VALUES(1,'Demo Store','demo',NULL,'pro',NULL,'default','USD',1,1767543335,1767543335,'store',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(2,'Fashion Hub','fashion',NULL,'starter',NULL,'default','USD',1,1767543335,1767543335,'store',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(3,'Tech Shop','tech','techshop.example.com','enterprise',NULL,'default','USD',1,1767543335,1767543335,'store',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(4,'Test Store 123','teststore123',NULL,'starter',NULL,'default','BDT',1,1767609120,1767626374,'landing',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(5,'DC Store','dc-store',NULL,'starter',NULL,'default','BDT',1,1767609662,1767920704,'landing',16,'{"templateId":"flash-sale","headline":"বাসমতি চাল ","subheadline":"সেরা মানের বাসমতি চাল ","ctaText":"Buy Now","ctaSubtext":"Best product guarantee","urgencyText":"Limited time offer","videoUrl":"","sectionOrder":["hero","features","video","testimonials","faq","cta"],"hiddenSections":[],"whatsappEnabled":false,"whatsappNumber":"","whatsappMessage":"","guaranteeText":"১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।","testimonials":[],"faq":[],"features":[{"icon":"✅","title":"প্রিমিয়াম কোয়ালিটি","description":"সেরা মানের উপাদান দিয়ে তৈরি"},{"icon":"🚚","title":"দ্রুত ডেলিভারি","description":"২-৩ কার্যদিবসের মধ্যে ডেলিভারি"},{"icon":"💯","title":"সন্তুষ্টির গ্যারান্টি","description":"পছন্দ না হলে সম্পূর্ণ টাকা ফেরত"},{"icon":"🔒","title":"নিরাপদ পেমেন্ট","description":"আপনার পেমেন্ট ১০০% নিরাপদ"}],"countdownEnabled":false,"countdownEndTime":"","showStockCounter":false,"lowStockThreshold":10,"showSocialProof":false,"socialProofInterval":15}','{"primaryColor":"#6366f1","accentColor":"#f59e0b","storeTemplateId":"modern-premium"}','en',NULL,1,10,NULL,'{"facebook":"","instagram":"","whatsapp":""}','inter',NULL,NULL,'none',NULL,'active',NULL,'{"phone":"","email":"","address":""}',NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(6,'Black Pearl','blackpearl',NULL,'free',NULL,'default','BDT',1,1767624212,1767624212,'landing',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(7,'IT STORE SCH','itstoresch',NULL,'free',NULL,'default','BDT',1,1767655069,1767655069,'landing',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(8,'iu','iu',NULL,'free',NULL,'default','BDT',1,1767679970,1767679970,'landing',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(9,'AI Test Store','ai-test-store',NULL,'free',NULL,'default','BDT',1,1767682537,1767682537,'landing',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(10,'My Store','ami-basmoti-chal-bik-store',NULL,'premium',NULL,'default','BDT',1,1767701123,1767870735,'landing',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'pending_info',1,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(11,'Basmoti chal bikri Store','basmoti-chal-bikri-k-store',NULL,'premium',NULL,'default','BDT',1,1767701768,1767701769,'landing',NULL,'{"templateId":"modern-dark","headline":"Basmoti chal bikri kori","subheadline":"বাংলাদেশে সেরা কোয়ালিটি ও দ্রুত ডেলিভারি","ctaText":"এখনই অর্ডার করুন","ctaSubtext":"ক্যাশ অন ডেলিভারি","features":[{"icon":"✅","title":"প্রিমিয়াম কোয়ালিটি","description":"সেরা মানের পণ্য"},{"icon":"🚚","title":"দ্রুত ডেলিভারি","description":"২-৩ দিনে ডেলিভারি"},{"icon":"💳","title":"ক্যাশ অন ডেলিভারি","description":"পণ্য হাতে পেয়ে টাকা দিন"}],"testimonials":[{"name":"সন্তুষ্ট ক্রেতা","text":"অনেক ভালো প্রোডাক্ট, দ্রুত ডেলিভারি!"}],"urgencyText":"সীমিত সময়ের অফার!","guaranteeText":"১০০% সন্তুষ্টির গ্যারান্টি"}',NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',4,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(12,'Premium Basmati Store','basmati',NULL,'premium',NULL,'default','BDT',1,1767703106,1767756506,'landing',NULL,'{"templateId":"luxury","headline":"Premium Basmati rice","subheadline":"বাংলাদেশে সেরা কোয়ালিটি ও দ্রুত ডেলিভারি","ctaText":"এখনই অর্ডার করুন","ctaSubtext":"ক্যাশ অন ডেলিভারি","features":[{"icon":"✅","title":"প্রিমিয়াম কোয়ালিটি","description":"সেরা মানের পণ্য"},{"icon":"🚚","title":"দ্রুত ডেলিভারি","description":"২-৩ দিনে ডেলিভারি"},{"icon":"💳","title":"ক্যাশ অন ডেলিভারি","description":"পণ্য হাতে পেয়ে টাকা দিন"}],"testimonials":[{"name":"jin","text":" cxcvvd","imageUrl":"https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/testimonials/1767729363072-koc96i.webp"}],"urgencyText":"সীমিত সময়ের অফার!","guaranteeText":"১০০% সন্তুষ্টির গ্যারান্টি","videoUrl":"","whatsappEnabled":true,"whatsappNumber":"8801739416661","countdownEnabled":false,"countdownText":"🔥 অফার শেষ হতে বাকি","showStockCounter":false,"showSocialProof":false,"socialProofInterval":15,"faq":[{"question":"ki","answer":"naker ghi"}]}','{"primaryColor":"#6366f1","accentColor":"#f59e0b","storeTemplateId":"artisan-market"}','en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',4,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(13,'vasmati','vasmati',NULL,'free',NULL,'default','BDT',1,1767947341,1767947341,'landing',NULL,NULL,NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'pending_plan',0,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
INSERT INTO "stores" VALUES(14,'vasmati','vasmati01',NULL,'free',NULL,'default','BDT',1,1767947500,1767947501,'landing',NULL,'{"templateId":"modern-dark","headline":"সুস্বাদু খাবার ও স্ন্যাক্স","subheadline":"ফ্রেশ ও হাইজিনিক","ctaText":"এখনই অর্ডার করুন","ctaSubtext":"ক্যাশ অন ডেলিভারি","features":[{"icon":"🍽️","title":"ফ্রেশ প্রোডাক্ট","description":"প্রতিদিন তৈরি"},{"icon":"🚴","title":"হট ডেলিভারি","description":"গরম গরম পৌঁছে যাবে"},{"icon":"😋","title":"টেস্ট গ্যারান্টি","description":"মুখে লেগে যাবে"}],"testimonials":[{"name":"সন্তুষ্ট ক্রেতা","text":"অনেক ভালো প্রোডাক্ট, দ্রুত ডেলিভারি!"}],"urgencyText":"🔥 সীমিত সময়ের অফার!","guaranteeText":"১০০% সন্তুষ্টির গ্যারান্টি"}',NULL,'en',NULL,1,10,NULL,NULL,'inter',NULL,NULL,'none',NULL,'active',NULL,NULL,NULL,'pending',0,'completed',4,NULL,NULL,NULL,NULL,NULL,'none',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'none',NULL);
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  compare_at_price REAL,
  inventory INTEGER DEFAULT 0,
  sku TEXT,
  image_url TEXT,
  images TEXT,
  category TEXT,
  tags TEXT,
  is_published INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
, seo_title TEXT, seo_description TEXT, seo_keywords TEXT);
INSERT INTO "products" VALUES(1,1,'Classic White T-Shirt','Premium cotton t-shirt for everyday wear',29.99,39.99,100,NULL,NULL,NULL,'Clothing',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(2,1,'Wireless Bluetooth Headphones','High-quality audio with noise cancellation',149.99,NULL,50,NULL,NULL,NULL,'Electronics',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(3,1,'Leather Wallet','Genuine leather bifold wallet',49.99,59.99,75,NULL,NULL,NULL,'Accessories',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(4,1,'Running Shoes','Lightweight and comfortable running shoes',89.99,119.99,30,NULL,NULL,NULL,'Footwear',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(5,1,'Smartwatch','Track your fitness and stay connected',199.99,NULL,25,NULL,NULL,NULL,'Electronics',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(6,2,'Summer Dress','Light and breezy summer dress',79.99,NULL,40,NULL,NULL,NULL,'Dresses',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(7,2,'Denim Jacket','Classic denim jacket for all seasons',99.99,NULL,35,NULL,NULL,NULL,'Outerwear',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(8,2,'Designer Sunglasses','UV protection with style',159.99,NULL,20,NULL,NULL,NULL,'Accessories',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(9,3,'Mechanical Keyboard','RGB backlit mechanical keyboard',129.99,NULL,45,NULL,NULL,NULL,'Peripherals',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(10,3,'Gaming Mouse','High-precision gaming mouse',79.99,NULL,60,NULL,NULL,NULL,'Peripherals',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(11,3,'4K Monitor','27-inch 4K UHD monitor',399.99,NULL,15,NULL,NULL,NULL,'Displays',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(12,3,'USB-C Hub','Multi-port USB-C hub',59.99,NULL,80,NULL,NULL,NULL,'Accessories',NULL,1,1767543335,1767543335,NULL,NULL,NULL);
INSERT INTO "products" VALUES(13,6,'Mystry Gift','Gift your beloved.Every box have different type gift.',1499,NULL,52,NULL,'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/products/1767729141747-s08uuq.webp',NULL,'Other',NULL,1,1767624428,1767729145,NULL,NULL,NULL);
INSERT INTO "products" VALUES(14,11,'Delicious Food Item','Basmoti chal bikri kori',350,NULL,0,NULL,NULL,NULL,NULL,NULL,1,1767701769,1767701769,NULL,NULL,NULL);
INSERT INTO "products" VALUES(15,12,'Basmati Rice','Premium basmati rice',250,NULL,30,NULL,'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/products/1767729079992-pylcx3.webp',NULL,'Food & Beverages',NULL,1,1767703107,1767729083,NULL,NULL,NULL);
INSERT INTO "products" VALUES(16,5,'Test Product',NULL,250,NULL,30,NULL,'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/products/1767787093361-n5kpk9.webp',NULL,'Food & Beverages',NULL,1,1767778291,1767787117,NULL,NULL,NULL);
INSERT INTO "products" VALUES(17,5,'Test Product',NULL,100,NULL,10,NULL,NULL,NULL,NULL,NULL,1,1767872419,1767872419,NULL,NULL,NULL);
INSERT INTO "products" VALUES(18,14,'Delicious Food Item','সুস্বাদু খাবার',350,NULL,0,NULL,NULL,NULL,NULL,NULL,1,1767947501,1767947501,NULL,NULL,NULL);
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
, risk_score INTEGER, risk_checked_at INTEGER);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id),
  order_number TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  shipping_address TEXT,
  billing_address TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  subtotal REAL NOT NULL,
  tax REAL DEFAULT 0,
  shipping REAL DEFAULT 0,
  total REAL NOT NULL,
  notes TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
, customer_phone TEXT, courier_provider text, courier_consignment_id text, courier_status text, payment_method TEXT DEFAULT 'cod', transaction_id TEXT, manual_payment_details TEXT);
INSERT INTO "orders" VALUES(1,6,NULL,'ORD-MK24AH1Y-W2T','','Zisan','jyfjyf jyfjfhgfhgftrs5 4w y3wyrwy45',NULL,'cancelled','pending',1499,0,0,1499,NULL,1767675396,1767688232,'01739416661',NULL,NULL,NULL,'cod',NULL,NULL);
INSERT INTO "orders" VALUES(2,6,NULL,'ORD-MK24LH41-SUZ','','Zisan','yfjyfjyt 6ru65r uderawawe hgfjjk',NULL,'confirmed','pending',1499,0,0,1499,NULL,1767675909,1767688224,'01739416661',NULL,NULL,NULL,'cod',NULL,NULL);
INSERT INTO "orders" VALUES(3,6,NULL,'ORD-MK24Q4WD-RJU','','Test Customer','Test Address, Dhaka, Bangladesh',NULL,'processing','pending',1499,0,0,1499,NULL,1767676127,1767688199,'01712345678',NULL,NULL,NULL,'cod',NULL,NULL);
INSERT INTO "orders" VALUES(4,12,NULL,'ORD-MK2PGU4Z-FFF','','Rahmatullah Zisan',replace('Sabiha Manjil D.K.P Road\nBabe jannat madrasa','\n',char(10)),NULL,'delivered','pending',250,0,120,370,NULL,1767710965,1767720016,'01739416661',NULL,NULL,NULL,'cod',NULL,NULL);
INSERT INTO "orders" VALUES(5,12,NULL,'ORD-MK2UVNKT-K8S','','Rahmatullah Zisan',replace('Sabiha Manjil D.K.P Road\nBabe jannat madrasa','\n',char(10)),NULL,'delivered','pending',250,0,120,370,NULL,1767720054,1767720153,'01739416661',NULL,NULL,NULL,'cod',NULL,NULL);
INSERT INTO "orders" VALUES(6,5,NULL,'ORD-MK3UEYDD-CK7','','zisab','kuygkuyguy uygkuygkuyg',NULL,'pending','pending',100,0,60,160,NULL,1767779741,1767779741,'01739416661',NULL,NULL,NULL,'cod',NULL,NULL);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  title TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  total REAL NOT NULL
, variant_id INTEGER, variant_title TEXT);
INSERT INTO "order_items" VALUES(1,2,13,'Mystry Gift',1,1499,1499,NULL,NULL);
INSERT INTO "order_items" VALUES(2,3,13,'Mystry Gift',1,1499,1499,NULL,NULL);
INSERT INTO "order_items" VALUES(3,4,15,'Basmati Rice',1,250,250,NULL,NULL);
INSERT INTO "order_items" VALUES(4,5,15,'Basmati Rice',1,250,250,NULL,NULL);
INSERT INTO "order_items" VALUES(5,6,16,'Test Product',1,100,100,NULL,NULL);
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0001_initial_schema.sql','2026-01-04 16:52:24');
INSERT INTO "d1_migrations" VALUES(2,'0000_clever_spencer_smythe.sql','2026-01-05 08:42:37');
INSERT INTO "d1_migrations" VALUES(3,'0001_strong_thunderbolts.sql','2026-01-05 08:42:46');
INSERT INTO "d1_migrations" VALUES(4,'0002_true_james_howlett.sql','2026-01-05 08:42:47');
INSERT INTO "d1_migrations" VALUES(5,'0003_famous_nightshade.sql','2026-01-05 08:42:48');
INSERT INTO "d1_migrations" VALUES(6,'0004_email_campaigns.sql','2026-01-05 08:42:49');
INSERT INTO "d1_migrations" VALUES(7,'0004_silly_ser_duncan.sql','2026-01-05 08:42:51');
INSERT INTO "d1_migrations" VALUES(8,'0005_phase3_theme_customization.sql','2026-01-05 08:42:52');
INSERT INTO "d1_migrations" VALUES(9,'0005_theme_customization.sql','2026-01-05 08:42:53');
INSERT INTO "d1_migrations" VALUES(10,'0006_subscription_tiers.sql','2026-01-05 08:42:54');
INSERT INTO "d1_migrations" VALUES(11,'0006_certain_patriot.sql','2026-01-05 10:03:44');
INSERT INTO "d1_migrations" VALUES(12,'0007_cheerful_star_brand.sql','2026-01-05 14:27:32');
INSERT INTO "d1_migrations" VALUES(13,'0008_volatile_cyclops.sql','2026-01-06 08:01:08');
INSERT INTO "d1_migrations" VALUES(14,'0009_curvy_roxanne_simpson.sql','2026-01-06 08:01:33');
INSERT INTO "d1_migrations" VALUES(15,'0010_shiny_madame_hydra.sql','2026-01-06 09:15:51');
INSERT INTO "d1_migrations" VALUES(16,'0011_optimal_harrier.sql','2026-01-06 09:15:51');
INSERT INTO "d1_migrations" VALUES(17,'0012_ai_chatbot.sql','2026-01-07 01:31:53');
INSERT INTO "d1_migrations" VALUES(18,'0012_flowery_wendell_vaughn.sql','2026-01-07 09:47:24');
INSERT INTO "d1_migrations" VALUES(19,'0013_legal_onslaught.sql','2026-01-07 09:47:24');
INSERT INTO "d1_migrations" VALUES(20,'0014_customer_risk_score.sql','2026-01-07 09:47:25');
INSERT INTO "d1_migrations" VALUES(21,'0014_lovely_ender_wiggin.sql','2026-01-07 09:49:01');
INSERT INTO "d1_migrations" VALUES(22,'0015_yellow_black_crow.sql','2026-01-07 09:50:12');
INSERT INTO "d1_migrations" VALUES(23,'0015_fix_missing_columns.sql','2026-01-07 09:50:12');
INSERT INTO "d1_migrations" VALUES(24,'0016_add_all_missing_columns.sql','2026-01-07 09:50:13');
INSERT INTO "d1_migrations" VALUES(25,'0017_payment_tracking.sql','2026-01-07 09:50:13');
INSERT INTO "d1_migrations" VALUES(26,'0018_subscription_billing.sql','2026-01-07 09:50:13');
INSERT INTO "d1_migrations" VALUES(27,'0016_overjoyed_cammi.sql','2026-01-07 15:05:46');
INSERT INTO "d1_migrations" VALUES(28,'0017_add_google_analytics_id.sql','2026-01-07 15:05:46');
INSERT INTO "d1_migrations" VALUES(29,'0020_milky_reavers.sql','2026-01-08 14:57:50');
INSERT INTO "d1_migrations" VALUES(30,'0021_page_views.sql','2026-01-08 16:43:26');
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'merchant',
  created_at INTEGER DEFAULT (unixepoch())
, phone TEXT);
INSERT INTO "users" VALUES(1,'rahmatullahzisan@gmail.com','auPpcPabJxvn96HYGni+T6KuY/zoUGbqth8z3JrXUWRSpv7oGDgUTP4RDv0SLkVT','Rahmatullah Zisan',5,'super_admin',1767609662,NULL);
INSERT INTO "users" VALUES(2,'binudini2@gmail.com','xKe+y1lzzE1WZP//nVBAFPWRqNwNzZu8T65BP92vv0+CKzguXwcIqq+xS6qeIhXg','Abida',6,'merchant',1767624213,NULL);
INSERT INTO "users" VALUES(3,'shawonahammed2011@gmail.com','a8ehNrokFo8B8xdbvJNdas9ImpScz2IsP5tb5ibBQz+7uaEnHBZD+lcGTRpOycnQ','SHAWON AHAMMED',7,'merchant',1767655072,NULL);
INSERT INTO "users" VALUES(4,'nazmulcomputer30@gmail.com','EXsTOGRLkyZETM/2N36qRZQyxb7AjfrOhFb1z1dUX49id9gKwrfMS2RQ3qr7FC6M','Nazmul Hasan',8,'merchant',1767679971,NULL);
INSERT INTO "users" VALUES(5,'testuserai5936@example.com','ZDzIUY95xI+YGJoQi2wWc4CwIvesaYl07Zsj9WbOmbHAjPVVUr1D2uaVV/4KddJi','Test User',9,'merchant',1767682537,NULL);
INSERT INTO "users" VALUES(6,'rahmatullahzisan02@gmail.com','Kz0ulclIFSDdzCYZ7gFzIKySvGZk8BiLgu6/gmG4jKFLbt7bEohZCje3SnkoFSz2','Premium Store',10,'merchant',1767701123,NULL);
INSERT INTO "users" VALUES(7,'test@gmail.com','efWbgo615sdzc4PiObZ1yQwQUvJ3BoGUPpZoG+cofyhdDdAzu+/0m8uzHs1vLD47','test',11,'merchant',1767701768,NULL);
INSERT INTO "users" VALUES(8,'test2@gmail.com','xfnE+PI3ldIk2SNFAgT4e9Iyqrn2SrctZtJcBY8t/R1Nq3n07ICzjNqLs3evxCG1','Zisan',12,'merchant',1767703107,NULL);
INSERT INTO "users" VALUES(9,'rahmatullahzisan01@gmail.com','H+YXp85rFcFcAkfj4YSn6d0wlSZCWuCzBu73I4yIlbhUdEVtIrFygVX1TboE3ykb','Rahmatullah Zisan',14,'merchant',1767947500,'01739416661');
CREATE TABLE shipping_zones (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, name text NOT NULL, regions text, rate real DEFAULT 0 NOT NULL, free_above real, estimated_days text, is_active integer DEFAULT true, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE discounts (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, code text NOT NULL, type text DEFAULT 'percentage', value real NOT NULL, min_order_amount real, max_discount_amount real, max_uses integer, used_count integer DEFAULT 0, per_customer_limit integer DEFAULT 1, starts_at integer, expires_at integer, is_active integer DEFAULT true, created_at integer, updated_at integer, `is_flash_sale` integer DEFAULT false, `flash_sale_end_time` integer, `show_on_homepage` integer DEFAULT false, `flash_sale_title` text, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE shipments (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, order_id integer NOT NULL, courier text, tracking_number text, status text DEFAULT 'pending', courier_data text, shipped_at integer, delivered_at integer, created_at integer, updated_at integer, FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE staff_invites (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, email text NOT NULL, role text DEFAULT 'staff', token text NOT NULL UNIQUE, invited_by integer, expires_at integer, accepted_at integer, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (invited_by) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
CREATE TABLE activity_logs (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, user_id integer, action text NOT NULL, entity_type text, entity_id integer, details text, ip_address text, created_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade, FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
INSERT INTO "activity_logs" VALUES(1,12,1,'store_suspended','store',12,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":true,"newStatus":false}',NULL,1767754224);
INSERT INTO "activity_logs" VALUES(2,12,1,'store_unsuspended','store',12,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":false,"newStatus":true}',NULL,1767754228);
INSERT INTO "activity_logs" VALUES(3,12,1,'store_suspended','store',12,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":true,"newStatus":false}',NULL,1767755823);
INSERT INTO "activity_logs" VALUES(4,12,1,'store_unsuspended','store',12,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":false,"newStatus":true}',NULL,1767755825);
INSERT INTO "activity_logs" VALUES(5,12,1,'store_suspended','store',12,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":true,"newStatus":false}',NULL,1767756502);
INSERT INTO "activity_logs" VALUES(6,12,1,'store_unsuspended','store',12,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":false,"newStatus":true}',NULL,1767756503);
INSERT INTO "activity_logs" VALUES(7,12,1,'store_suspended','store',12,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":true,"newStatus":false}',NULL,1767756504);
INSERT INTO "activity_logs" VALUES(8,12,1,'store_unsuspended','store',12,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":false,"newStatus":true}',NULL,1767756506);
INSERT INTO "activity_logs" VALUES(9,5,1,'stock_change','product',16,'{"productTitle":"Test Product","before":10,"after":30,"change":20}',NULL,1767787117);
INSERT INTO "activity_logs" VALUES(10,10,1,'store_suspended','store',10,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":true,"newStatus":false}',NULL,1767870732);
INSERT INTO "activity_logs" VALUES(11,10,1,'store_unsuspended','store',10,'{"adminEmail":"rahmatullahzisan@gmail.com","previousStatus":false,"newStatus":true}',NULL,1767870735);
CREATE TABLE payouts (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, store_id integer NOT NULL, period_start integer NOT NULL, period_end integer NOT NULL, gross_amount real NOT NULL, platform_fee real DEFAULT 0, net_amount real NOT NULL, status text DEFAULT 'pending', paid_at integer, payment_method text, payment_reference text, notes text, created_at integer, updated_at integer, FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE no action ON DELETE cascade);
CREATE TABLE `abandoned_carts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`session_id` text NOT NULL,
	`customer_email` text,
	`customer_phone` text,
	`customer_name` text,
	`cart_items` text NOT NULL,
	`total_amount` real NOT NULL,
	`currency` text DEFAULT 'BDT',
	`abandoned_at` integer,
	`recovered_at` integer,
	`recovery_email_sent` integer DEFAULT false,
	`recovery_email_sent_at` integer,
	`status` text DEFAULT 'abandoned',
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
INSERT INTO "abandoned_carts" VALUES(1,5,'sess_1767804863285_baf2i63qb',NULL,'01739416661','Zisan','[{"productId":16,"title":"Test Product","quantity":1,"price":250,"image":null}]',250,'BDT',1767832791,NULL,0,NULL,'abandoned');
CREATE TABLE `email_campaigns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`preview_text` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'draft',
	`scheduled_at` integer,
	`sent_at` integer,
	`recipient_count` integer DEFAULT 0,
	`sent_count` integer DEFAULT 0,
	`open_count` integer DEFAULT 0,
	`click_count` integer DEFAULT 0,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `email_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`status` text DEFAULT 'subscribed',
	`source` text,
	`tags` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option1_name TEXT,
  option1_value TEXT,
  option2_name TEXT,
  option2_value TEXT,
  option3_name TEXT,
  option3_value TEXT,
  price REAL,
  compare_at_price REAL,
  sku TEXT,
  inventory INTEGER DEFAULT 0,
  image_url TEXT,
  is_available INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);
INSERT INTO "product_variants" VALUES(5,16,'Weight','1 kg','Flavor',NULL,NULL,NULL,250,NULL,NULL,0,NULL,1,1767787117);
INSERT INTO "product_variants" VALUES(6,16,'Weight','3 kg','Flavor',NULL,NULL,NULL,700,NULL,NULL,0,NULL,1,1767787117);
CREATE TABLE `saved_landing_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer,
	`name` text NOT NULL,
	`landing_config` text NOT NULL,
	`offer_slug` text,
	`is_homepage_backup` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  status TEXT DEFAULT 'pending',
  created_at INTEGER
);
CREATE TABLE system_notifications (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, message text NOT NULL, type text DEFAULT 'info', is_active integer DEFAULT true, created_by integer, created_at integer, FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE no action ON DELETE no action);
CREATE TABLE saas_coupons (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, code TEXT NOT NULL UNIQUE, discount_type TEXT NOT NULL, discount_amount REAL NOT NULL, max_uses INTEGER, used_count INTEGER DEFAULT 0, expires_at INTEGER, is_active INTEGER DEFAULT 1, created_at INTEGER);
CREATE TABLE `ab_test_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_id` integer NOT NULL,
	`variant_id` integer NOT NULL,
	`visitor_id` text NOT NULL,
	`assigned_at` integer,
	`converted_at` integer,
	`order_amount` real,
	FOREIGN KEY (`test_id`) REFERENCES `ab_tests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `ab_test_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `ab_test_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_id` integer NOT NULL,
	`name` text NOT NULL,
	`landing_config` text,
	`traffic_weight` integer DEFAULT 50,
	`visitors` integer DEFAULT 0,
	`conversions` integer DEFAULT 0,
	`revenue` real DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`test_id`) REFERENCES `ab_tests`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `ab_tests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer,
	`name` text NOT NULL,
	`status` text DEFAULT 'draft',
	`winning_variant_id` integer,
	`started_at` integer,
	`ended_at` integer,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `email_automation_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`automation_id` integer NOT NULL,
	`delay_minutes` integer DEFAULT 0,
	`subject` text NOT NULL,
	`preview_text` text,
	`content` text NOT NULL,
	`step_order` integer DEFAULT 0,
	`sent_count` integer DEFAULT 0,
	`open_count` integer DEFAULT 0,
	`click_count` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`automation_id`) REFERENCES `email_automations`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `email_automations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`trigger` text NOT NULL,
	`is_active` integer DEFAULT true,
	`total_sent` integer DEFAULT 0,
	`total_opened` integer DEFAULT 0,
	`total_clicked` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `email_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`step_id` integer,
	`recipient_email` text NOT NULL,
	`recipient_name` text,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`sent_at` integer,
	`status` text DEFAULT 'pending',
	`error_message` text,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`step_id`) REFERENCES `email_automation_steps`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `order_bumps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`bump_product_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`discount` real DEFAULT 0,
	`is_active` integer DEFAULT true,
	`display_order` integer DEFAULT 0,
	`views` integer DEFAULT 0,
	`conversions` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bump_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `upsell_offers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`offer_product_id` integer NOT NULL,
	`type` text DEFAULT 'upsell',
	`headline` text NOT NULL,
	`subheadline` text,
	`description` text,
	`discount` real DEFAULT 0,
	`display_order` integer DEFAULT 0,
	`next_offer_id` integer,
	`is_active` integer DEFAULT true,
	`views` integer DEFAULT 0,
	`conversions` integer DEFAULT 0,
	`revenue` real DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`offer_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `upsell_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`token` text NOT NULL,
	`offer_id` integer,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`offer_id`) REFERENCES `upsell_offers`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE admin_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  target_name TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE admin_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE store_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch())
);
CREATE TABLE `marketing_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`source` text DEFAULT 'homepage',
	`ip_address` text,
	`user_agent` text,
	`created_at` integer
);
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'BDT',
	`status` text DEFAULT 'pending',
	`method` text DEFAULT 'manual',
	`transaction_id` text,
	`plan_type` text,
	`period_start` integer,
	`period_end` integer,
	`admin_note` text,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`name` text NOT NULL,
	`key_prefix` text NOT NULL,
	`key_hash` text NOT NULL,
	`scopes` text DEFAULT '["read_orders","write_orders"]',
	`last_used_at` integer,
	`created_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE TABLE `system_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`stack` text,
	`context` text,
	`created_at` integer
);
CREATE TABLE `webhooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`url` text NOT NULL,
	`topics` text NOT NULL,
	`secret` text NOT NULL,
	`is_active` integer DEFAULT true,
	`failure_count` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('stores',14);
INSERT INTO "sqlite_sequence" VALUES('products',18);
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',30);
INSERT INTO "sqlite_sequence" VALUES('users',9);
INSERT INTO "sqlite_sequence" VALUES('orders',6);
INSERT INTO "sqlite_sequence" VALUES('order_items',5);
INSERT INTO "sqlite_sequence" VALUES('activity_logs',11);
INSERT INTO "sqlite_sequence" VALUES('product_variants',6);
INSERT INTO "sqlite_sequence" VALUES('abandoned_carts',1);
INSERT INTO "sqlite_sequence" VALUES('payments',0);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_store_category ON products(store_id, category);
CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_store_email ON customers(store_id, email);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_status ON orders(store_id, status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_stores_mode ON stores(mode);
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_store_id_idx ON users(store_id);
CREATE INDEX `abandoned_carts_store_id_idx` ON `abandoned_carts` (`store_id`);
CREATE INDEX `abandoned_carts_session_idx` ON `abandoned_carts` (`session_id`);
CREATE INDEX `abandoned_carts_status_idx` ON `abandoned_carts` (`store_id`, `status`);
CREATE INDEX `email_campaigns_store_id_idx` ON `email_campaigns` (`store_id`);
CREATE INDEX `email_campaigns_status_idx` ON `email_campaigns` (`store_id`,`status`);
CREATE INDEX `email_subscribers_store_id_idx` ON `email_subscribers` (`store_id`);
CREATE INDEX `email_subscribers_email_idx` ON `email_subscribers` (`store_id`,`email`);
CREATE INDEX `saved_landing_configs_store_id_idx` ON `saved_landing_configs` (`store_id`);
CREATE INDEX reviews_store_product_idx ON reviews(store_id, product_id);
CREATE INDEX reviews_status_idx ON reviews(store_id, status);
CREATE INDEX saas_coupons_code_idx ON saas_coupons (code);
CREATE UNIQUE INDEX `saas_coupons_code_unique` ON `saas_coupons` (`code`);
CREATE INDEX `ab_test_assignments_visitor_idx` ON `ab_test_assignments` (`test_id`,`visitor_id`);
CREATE INDEX `ab_test_variants_test_idx` ON `ab_test_variants` (`test_id`);
CREATE INDEX `ab_tests_store_idx` ON `ab_tests` (`store_id`);
CREATE INDEX `ab_tests_status_idx` ON `ab_tests` (`store_id`,`status`);
CREATE INDEX `email_automation_steps_automation_idx` ON `email_automation_steps` (`automation_id`);
CREATE INDEX `email_automations_store_idx` ON `email_automations` (`store_id`);
CREATE INDEX `email_queue_scheduled_idx` ON `email_queue` (`scheduled_at`,`status`);
CREATE INDEX `email_queue_store_idx` ON `email_queue` (`store_id`);
CREATE INDEX `order_bumps_store_product_idx` ON `order_bumps` (`store_id`,`product_id`);
CREATE INDEX `upsell_offers_store_product_idx` ON `upsell_offers` (`store_id`,`product_id`);
CREATE UNIQUE INDEX `upsell_tokens_token_unique` ON `upsell_tokens` (`token`);
CREATE INDEX `upsell_tokens_token_idx` ON `upsell_tokens` (`token`);
CREATE INDEX page_views_store_idx ON page_views(store_id);
CREATE INDEX page_views_date_idx ON page_views(store_id, created_at);
CREATE INDEX page_views_visitor_idx ON page_views(store_id, visitor_id);
CREATE INDEX audit_logs_admin_idx ON admin_audit_logs(admin_id);
CREATE INDEX audit_logs_action_idx ON admin_audit_logs(action);
CREATE INDEX audit_logs_target_idx ON admin_audit_logs(target_type, target_id);
CREATE INDEX audit_logs_date_idx ON admin_audit_logs(created_at);
CREATE INDEX admin_roles_user_idx ON admin_roles(user_id);
CREATE INDEX store_tags_store_idx ON store_tags(store_id);
CREATE INDEX store_tags_tag_idx ON store_tags(tag);
CREATE UNIQUE INDEX `marketing_leads_email_unique` ON `marketing_leads` (`email`);
CREATE INDEX `marketing_leads_email_idx` ON `marketing_leads` (`email`);
