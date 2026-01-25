-- ============================================================================
-- Demo Store Seeder
-- Seeds demo products to the Demo Store (store_id: 1) for showcase purposes
-- 
-- Run locally: npx wrangler d1 execute DB --local --file=packages/database/src/seeds/seed-demo-store.sql
-- Run production: npx wrangler d1 execute DB --remote --file=packages/database/src/seeds/seed-demo-store.sql
-- ============================================================================

-- Note: Not deleting existing products to preserve order_items foreign key references
-- New products will be added alongside existing ones

-- ============================================================================
-- ELECTRONICS (8 products)
-- ============================================================================
INSERT INTO products (store_id, title, description, price, compare_at_price, image_url, category, inventory, is_published, created_at)
VALUES
(1, 'প্রিমিয়াম ওয়্যারলেস হেডফোন', 'অসাধারণ সাউন্ড কোয়ালিটি এবং ৩০ ঘন্টা ব্যাটারি লাইফ সহ প্রিমিয়াম হেডফোন। নয়েজ ক্যান্সেলিং এবং ব্লুটুথ ৫.০ সাপোর্ট।', 4999, 5999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&fm=webp&q=80', 'Electronics', 50, 1, strftime('%s', 'now')),
(1, 'স্মার্ট ওয়াচ প্রো এডিশন', 'হার্ট রেট মনিটর, স্টেপ কাউন্টার এবং স্লিপ ট্র্যাকিং সহ অ্যাডভান্সড স্মার্টওয়াচ। ওয়াটারপ্রুফ ডিজাইন।', 3499, 4499, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&fm=webp&q=80', 'Electronics', 35, 1, strftime('%s', 'now')),
(1, 'পোর্টেবল ব্লুটুথ স্পিকার', 'কমপ্যাক্ট ডিজাইনে শক্তিশালী বেস। IPX7 ওয়াটারপ্রুফ এবং ১২ ঘন্টা প্লেটাইম।', 1999, 2499, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop&fm=webp&q=80', 'Electronics', 60, 1, strftime('%s', 'now')),
(1, 'ট্রু ওয়্যারলেস ইয়ারবাডস', 'একটিভ নয়েজ ক্যান্সেলেশন এবং ট্রান্সপারেন্সি মোড সহ প্রিমিয়াম ইয়ারবাডস।', 2499, 2999, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop&fm=webp&q=80', 'Electronics', 45, 1, strftime('%s', 'now')),
(1, 'ফাস্ট চার্জিং পাওয়ার ব্যাংক', '২০০০০mAh ক্যাপাসিটি, ২২.৫W ফাস্ট চার্জিং সাপোর্ট। একসাথে ৩টি ডিভাইস চার্জ করুন।', 1799, 2299, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop&fm=webp&q=80', 'Electronics', 80, 1, strftime('%s', 'now')),
(1, 'মেকানিক্যাল গেমিং কীবোর্ড', 'RGB ব্যাকলিট, ব্লু সুইচ এবং এন্টি-ঘোস্টিং সহ প্রফেশনাল গেমিং কীবোর্ড।', 2999, 3799, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&h=800&fit=crop&fm=webp&q=80', 'Electronics', 25, 1, strftime('%s', 'now')),
(1, 'ওয়্যারলেস চার্জিং প্যাড', '১৫W ফাস্ট ওয়্যারলেস চার্জিং। সব Qi-সাপোর্টেড ডিভাইসের জন্য কম্প্যাটিবল।', 899, 1199, 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=800&h=800&fit=crop&fm=webp&q=80', 'Electronics', 100, 1, strftime('%s', 'now')),
(1, 'HD ওয়েবক্যাম', '১০৮০p HD ভিডিও, অটো-ফোকাস এবং বিল্ট-ইন মাইক্রোফোন। ভিডিও কলিং এর জন্য পারফেক্ট।', 1599, 1999, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&h=800&fit=crop&fm=webp&q=80', 'Electronics', 40, 1, strftime('%s', 'now'));

-- ============================================================================
-- FASHION (8 products)
-- ============================================================================
INSERT INTO products (store_id, title, description, price, compare_at_price, image_url, category, inventory, is_published, created_at)
VALUES
(1, 'প্রিমিয়াম লেদার ব্যাগ', 'জেনুইন লেদার দিয়ে তৈরি স্টাইলিশ ব্যাগ। প্রতিদিনের ব্যবহারের জন্য পারফেক্ট।', 2499, 3299, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&fm=webp&q=80', 'Fashion', 30, 1, strftime('%s', 'now')),
(1, 'কটন কম্ফোর্ট টি-শার্ট', '১০০% অর্গানিক কটন। সফট ফেব্রিক এবং পারফেক্ট ফিট।', 699, 899, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&fm=webp&q=80', 'Fashion', 150, 1, strftime('%s', 'now')),
(1, 'ক্লাসিক ডেনিম জ্যাকেট', 'টাইমলেস ডেনিম জ্যাকেট। ভিনটেজ লুকের জন্য পারফেক্ট।', 1999, 2599, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop&fm=webp&q=80', 'Fashion', 40, 1, strftime('%s', 'now')),
(1, 'পোলারাইজড সানগ্লাস', 'UV400 প্রোটেকশন এবং পোলারাইজড লেন্স। স্টাইল এবং সুরক্ষা একসাথে।', 999, 1499, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&fm=webp&q=80', 'Fashion', 75, 1, strftime('%s', 'now')),
(1, 'মিনিমালিস্ট ওয়ালেট', 'স্লিম ডিজাইন, RFID ব্লকিং। কার্ড এবং ক্যাশ রাখার জন্য পারফেক্ট।', 599, 799, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop&fm=webp&q=80', 'Fashion', 90, 1, strftime('%s', 'now')),
(1, 'ক্যাজুয়াল স্নিকার্স', 'হালকা ওজন, ব্রিদেবল ফেব্রিক। সারাদিনের আরামের জন্য ডিজাইন করা।', 1599, 2199, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&fm=webp&q=80', 'Fashion', 55, 1, strftime('%s', 'now')),
(1, 'ফর্মাল কটন শার্ট', 'প্রিমিয়াম কটন ফেব্রিক। অফিস এবং ফর্মাল ওকেশনের জন্য পারফেক্ট।', 899, 1199, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop&fm=webp&q=80', 'Fashion', 70, 1, strftime('%s', 'now')),
(1, 'ট্রাভেল ব্যাকপ্যাক', 'ওয়াটার-রেজিস্ট্যান্ট, মাল্টিপল কম্পার্টমেন্ট। ল্যাপটপ স্লিভ সহ।', 1899, 2499, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&fm=webp&q=80', 'Fashion', 45, 1, strftime('%s', 'now'));

-- ============================================================================
-- HOME & LIVING (8 products)
-- ============================================================================
INSERT INTO products (store_id, title, description, price, compare_at_price, image_url, category, inventory, is_published, created_at)
VALUES
(1, 'মিনিমালিস্ট LED টেবিল ল্যাম্প', 'টাচ কন্ট্রোল, ৩ ব্রাইটনেস লেভেল। মডার্ন ডিজাইন যা যেকোনো ডেস্কে মানানসই।', 1499, 1899, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop&fm=webp&q=80', 'Home', 35, 1, strftime('%s', 'now')),
(1, 'হ্যান্ডমেড সয় ক্যান্ডেল সেট', '৩টি ক্যান্ডেলের সেট, প্রাকৃতিক সুগন্ধি। ৪০+ ঘন্টা বার্ন টাইম।', 799, 999, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=800&fit=crop&fm=webp&q=80', 'Home', 60, 1, strftime('%s', 'now')),
(1, 'সিরামিক ফ্লাওয়ার ভাস', 'হ্যান্ডক্রাফটেড সিরামিক ভাস। ফ্রেশ বা আর্টিফিশিয়াল ফুলের জন্য পারফেক্ট।', 599, 799, 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=800&fit=crop&fm=webp&q=80', 'Home', 50, 1, strftime('%s', 'now')),
(1, 'বাঁশের কাটিং বোর্ড', 'ইকো-ফ্রেন্ডলি বাঁশ দিয়ে তৈরি। জুস গ্রুভ সহ ডিউরেবল বোর্ড।', 499, 699, 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=800&h=800&fit=crop&fm=webp&q=80', 'Home', 80, 1, strftime('%s', 'now')),
(1, 'কটন থ্রো ব্ল্যাংকেট', 'সফট কটন ব্ল্যাংকেট। সোফা বা বেডের জন্য পারফেক্ট।', 1899, 2399, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop&fm=webp&q=80', 'Home', 40, 1, strftime('%s', 'now')),
(1, 'মিনিমালিস্ট ওয়াল আর্ট', 'অ্যাবস্ট্রাক্ট ডিজাইন, প্রিমিয়াম প্রিন্ট। ফ্রেম সহ রেডি টু হ্যাং।', 1299, 1699, 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=800&h=800&fit=crop&fm=webp&q=80', 'Home', 25, 1, strftime('%s', 'now')),
(1, 'স্টোনওয়্যার ডিনার সেট', '১৬ পিস ডিনার সেট। মাইক্রোওয়েভ এবং ডিশওয়াশার সেফ।', 2999, 3799, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=800&fit=crop&fm=webp&q=80', 'Home', 20, 1, strftime('%s', 'now')),
(1, 'ইন্ডোর প্লান্ট পট সেট', '৩টি পটের সেট, ড্রেনেজ হোল সহ। মিনিমালিস্ট ডিজাইন।', 699, 899, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop&fm=webp&q=80', 'Home', 55, 1, strftime('%s', 'now'));

-- ============================================================================
-- BEAUTY (6 products)
-- ============================================================================
INSERT INTO products (store_id, title, description, price, compare_at_price, image_url, category, inventory, is_published, created_at)
VALUES
(1, 'অর্গানিক ভিটামিন সি সিরাম', 'ব্রাইটেনিং এবং অ্যান্টি-এজিং সিরাম। ন্যাচারাল ইনগ্রিডিয়েন্টস দিয়ে তৈরি।', 1299, 1599, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop&fm=webp&q=80', 'Beauty', 70, 1, strftime('%s', 'now')),
(1, 'হাইড্রেটিং লিপ বাম সেট', '৪টি ফ্লেভারের সেট। SPF15 প্রোটেকশন সহ।', 399, 499, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop&fm=webp&q=80', 'Beauty', 120, 1, strftime('%s', 'now')),
(1, 'প্রফেশনাল হেয়ার কেয়ার কিট', 'শ্যাম্পু, কন্ডিশনার এবং হেয়ার মাস্ক। সালফেট-ফ্রি ফর্মুলা।', 1599, 1999, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=800&fit=crop&fm=webp&q=80', 'Beauty', 45, 1, strftime('%s', 'now')),
(1, 'ন্যাচারাল ফেস মাস্ক কালেকশন', '৫টি মাস্কের সেট, বিভিন্ন স্কিন টাইপের জন্য। অর্গানিক ইনগ্রিডিয়েন্টস।', 899, 1199, 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=800&fit=crop&fm=webp&q=80', 'Beauty', 65, 1, strftime('%s', 'now')),
(1, 'মেকআপ ব্রাশ সেট', '১২ পিস প্রফেশনাল ব্রাশ সেট। সফট সিন্থেটিক ব্রিসলস।', 1499, 1899, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop&fm=webp&q=80', 'Beauty', 35, 1, strftime('%s', 'now')),
(1, 'লাক্সারি পারফিউম', 'লং-লাস্টিং ফ্রেগ্র্যান্স। ইউনিসেক্স, সব সিজনের জন্য পারফেক্ট।', 2499, 3199, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=800&fit=crop&fm=webp&q=80', 'Beauty', 30, 1, strftime('%s', 'now'));

-- ============================================================================
-- FOOD (6 products)
-- ============================================================================
INSERT INTO products (store_id, title, description, price, compare_at_price, image_url, category, inventory, is_published, created_at)
VALUES
(1, 'অর্গানিক হানি', '১০০% খাঁটি মধু, সুন্দরবন থেকে সংগৃহীত। কোনো প্রিজার্ভেটিভ নেই।', 699, 899, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=800&fit=crop&fm=webp&q=80', 'Food', 100, 1, strftime('%s', 'now')),
(1, 'প্রিমিয়াম গ্রিন টি', 'জাপানিজ সেনচা গ্রিন টি। ২৫টি টি ব্যাগ।', 499, 649, 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&h=800&fit=crop&fm=webp&q=80', 'Food', 80, 1, strftime('%s', 'now')),
(1, 'মিক্সড নাটস প্যাক', 'বাদাম, কাজু, পেস্তা, আখরোট মিক্স। হাই প্রোটিন স্ন্যাক।', 599, 749, 'https://images.unsplash.com/photo-1536591375623-a82d71a671da?w=800&h=800&fit=crop&fm=webp&q=80', 'Food', 90, 1, strftime('%s', 'now')),
(1, 'এক্সট্রা ভার্জিন অলিভ অয়েল', 'ইমপোর্টেড স্প্যানিশ অলিভ অয়েল। কোল্ড প্রেসড, ৫০০ml।', 899, 1099, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop&fm=webp&q=80', 'Food', 60, 1, strftime('%s', 'now')),
(1, 'আর্টিসান চকলেট বক্স', 'হ্যান্ডমেড ডার্ক চকলেট। ১২ পিস গিফট বক্স।', 799, 999, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&h=800&fit=crop&fm=webp&q=80', 'Food', 50, 1, strftime('%s', 'now')),
(1, 'অর্গানিক কফি বিনস', 'মিডিয়াম রোস্ট, সিঙ্গেল অরিজিন। ফ্রেশলি রোস্টেড ২৫০g প্যাক।', 599, 749, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=800&fit=crop&fm=webp&q=80', 'Food', 75, 1, strftime('%s', 'now'));

-- Show success message
SELECT 'Demo Store seeded with 36 products successfully!' as message;
