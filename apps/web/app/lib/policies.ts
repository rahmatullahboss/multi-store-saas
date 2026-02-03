/**
 * Legal Policy Templates
 * 
 * Auto-generated legal policy text for merchant stores.
 * These are generic e-commerce compliant templates that can be
 * overridden by merchants with custom text.
 */

/**
 * Generate a Privacy Policy for a store
 */
export function getPrivacyPolicy(storeName: string, email: string): string {
  return `
# Privacy Policy

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Introduction

Welcome to ${storeName}. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our store or make a purchase.

## Information We Collect

### Personal Information
When you make a purchase or create an account, we collect:
- Name and contact information (email, phone number)
- Billing and shipping addresses
- Payment information (processed securely by our payment providers)
- Order history and preferences

### Automatically Collected Information
When you visit our store, we may automatically collect:
- IP address and browser type
- Device information
- Pages visited and time spent on our site
- Referring website information

## How We Use Your Information

We use your personal information to:
- Process and fulfill your orders
- Communicate about your orders and provide customer support
- Send promotional emails (with your consent)
- Improve our website and services
- Comply with legal obligations

## Information Sharing

We do not sell your personal information. We may share your information with:
- Shipping carriers to deliver your orders
- Payment processors to complete transactions
- Service providers who assist our operations
- Law enforcement when required by law

## Data Security

We implement appropriate security measures to protect your personal information, including encryption, secure servers, and regular security audits.

## Your Rights

You have the right to:
- Access the personal data we hold about you
- Request correction of inaccurate data
- Request deletion of your data (subject to legal requirements)
- Opt-out of marketing communications

## Cookies

We use cookies to enhance your browsing experience. You can manage cookie preferences through your browser settings.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.

## Contact Us

If you have questions about this privacy policy, please contact us at:
- **Email:** ${email}
- **Store:** ${storeName}
`.trim();
}

/**
 * Generate Terms of Service for a store
 */
export function getTermsOfService(storeName: string, email: string): string {
  return `
# Terms of Service

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Agreement to Terms

By accessing and using ${storeName}, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.

## Use of Our Services

### Eligibility
You must be at least 18 years old or have parental consent to use our services and make purchases.

### Account Responsibilities
- You are responsible for maintaining the confidentiality of your account
- You must provide accurate and complete information
- You are responsible for all activities under your account
- Notify us immediately of any unauthorized use

## Products and Pricing

### Product Information
We strive to provide accurate product descriptions and pricing. However, we reserve the right to:
- Correct any errors in product information or pricing
- Cancel orders if pricing errors occur
- Limit quantities per customer

### Pricing
- All prices are displayed in the store's designated currency
- Prices may change without prior notice
- Applicable taxes and shipping charges will be added at checkout

## Orders and Payment

### Order Acceptance
All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order.

### Payment
- Payment must be made at the time of purchase or upon delivery (for Cash on Delivery)
- We accept the payment methods displayed during checkout
- All transactions are processed securely

## Shipping and Delivery

- Delivery times are estimates and not guaranteed
- Risk of loss passes to you upon delivery
- Please review our shipping policy for detailed information

## Intellectual Property

All content on ${storeName}, including text, images, logos, and designs, is our property or licensed to us. You may not use, reproduce, or distribute our content without written permission.

## Limitation of Liability

To the fullest extent permitted by law, ${storeName} shall not be liable for:
- Indirect, incidental, or consequential damages
- Loss of profits or data
- Damages arising from use or inability to use our services

## Indemnification

You agree to indemnify and hold harmless ${storeName} from any claims, damages, or expenses arising from your violation of these terms or misuse of our services.

## Governing Law

These terms are governed by the laws of the jurisdiction where ${storeName} operates.

## Changes to Terms

We may modify these terms at any time. Continued use of our services constitutes acceptance of updated terms.

## Contact Us

For questions about these terms, please contact us at:
- **Email:** ${email}
- **Store:** ${storeName}
`.trim();
}

/**
 * Generate a Refund Policy for a store
 */
/**
 * Generate a Refund Policy for a store
 */
export function getRefundPolicy(storeName: string, email: string): string {
  return `
# Refund & Return Policy

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Overview

At ${storeName}, we want you to be completely satisfied with your purchase. If you're not happy with your order, we're here to help.

## Return Eligibility

### Eligible for Return
Products may be returned within **7 days** of delivery if:
- Item is unused and in original condition
- Original packaging is intact
- All tags and labels are attached
- You have proof of purchase (order number or receipt)

### Not Eligible for Return
The following items cannot be returned:
- Personalized or custom-made items
- Intimate or hygiene products
- Items marked as "Final Sale" or "Non-Returnable"
- Products damaged by misuse
- Items without original packaging

## Refund Process

### How to Request a Refund

1. **Contact Us:** Email us at ${email} with:
   - Your order number
   - Reason for return
   - Photos of the item (if defective)

2. **Await Approval:** We'll review your request within 24-48 hours

3. **Ship the Item:** Once approved, return the item to the address provided

4. **Receive Refund:** Refund will be processed within 5-7 business days after we receive the returned item

### Refund Method
- Refunds will be issued to the original payment method
- For Cash on Delivery orders, refunds will be processed via bank transfer or mobile wallet

## Exchanges

If you'd like to exchange an item for a different size or color:
1. Contact us to check availability
2. Return the original item
3. Place a new order for the desired item

## Damaged or Defective Items

If you receive a damaged or defective item:
- Contact us within 48 hours of delivery
- Provide photos of the damage
- We'll arrange a replacement or full refund at no extra cost

## Shipping Costs

- **Defective/Wrong Items:** We cover return shipping costs
- **Change of Mind:** Customer is responsible for return shipping costs
- Original shipping charges are non-refundable unless the return is due to our error

## Cancellations

### Before Shipping
Orders can be canceled within 2 hours of placement for a full refund.

### After Shipping
Once an order has shipped, it cannot be canceled. You may refuse delivery or return the item following our return process.

## Contact Us

For refund-related inquiries, please contact:
- **Email:** ${email}
- **Store:** ${storeName}

We aim to respond to all inquiries within 24 hours.
`.trim();
}

/**
 * Generate a Shipping Policy for a store
 */
export function getShippingPolicy(storeName: string, email: string): string {
  return `
# Shipping Policy

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Order Processing

### Processing Time
- All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email.
- You will receive another notification when your order has shipped.

### High Volume Delay
- During high volume periods, processing times may increase. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.

## Shipping Rates and Estimates

### Domestic Shipping
- We offer standard shipping across the country.
- Shipping charges for your order will be calculated and displayed at checkout.
- **Estimated delivery time:** 2-5 business days depending on your location.

### International Shipping
- We currently do not ship outside of the country.
- We offer international shipping to select countries. Rates and delivery times vary by destination.

## How to Check the Status of Your Order

When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.

If you haven't received your order within X days of receiving your shipping confirmation email, please contact us at ${email} with your name and order number, and we will look into it for you.

## Shipping to P.O. Boxes

We ship to addresses within the country.

## Refunds, Returns, and Exchanges

We accept returns up to 7 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount.

In the event that your order arrives damaged in any way, please email us as soon as possible at ${email} with your order number and a photo of the item's condition. We address these on a case-by-case basis but will try our best to work towards a satisfactory solution.

If you have any further questions, please don't hesitate to contact us at ${email}.
`.trim();
}

/**
 * Generate a Subscription Policy for a store
 */
export function getSubscriptionPolicy(storeName: string, email: string): string {
  return `
# Subscription Policy

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Overview

This policy applies to any subscription or recurring purchase offered by ${storeName}.

## Billing & Renewal

- Subscription charges are billed on a recurring basis (weekly/monthly) as selected at checkout.
- Subscriptions renew automatically unless canceled before the next billing date.
- We will notify you if there are changes to pricing or billing schedule.

## Managing Your Subscription

You can pause or cancel your subscription by contacting us at ${email}.

## Cancellations

- Cancellations take effect at the end of the current billing cycle.
- No prorated refunds are issued unless required by law.

## Failed Payments

- If a payment fails, we may retry within a short period.
- Continued failures may result in suspension or cancellation of the subscription.

## Changes to This Policy

We may update this policy from time to time. Changes will be posted on this page with an updated revision date.

## Contact Us

If you have questions, please contact:
- **Email:** ${email}
- **Store:** ${storeName}
`.trim();
}

/**
 * Generate a Legal Notice for a store
 */
export function getLegalNotice(storeName: string, email: string): string {
  return `
# Legal Notice

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## Business Information

- **Store Name:** ${storeName}
- **Contact Email:** ${email}

## Liability Disclaimer

We strive to keep information on this website accurate and up to date. However, ${storeName} makes no warranties regarding the completeness or accuracy of information and is not liable for any losses or damages arising from its use.

## External Links

This website may contain links to external sites. We are not responsible for the content or practices of third‑party websites.

## Intellectual Property

All content on this site (text, images, logos) is owned by ${storeName} or licensed to us. Unauthorized use is prohibited.

## Contact

If you have questions about this legal notice, please contact:
- **Email:** ${email}
- **Store:** ${storeName}
`.trim();
}

/**
 * Generate a Privacy Policy for a store (Bengali)
 */
export function getPrivacyPolicyBn(storeName: string, email: string): string {
  return `
# গোপনীয়তা নীতি

**সর্বশেষ আপডেট:** ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}

## ভূমিকা

${storeName}-এ আপনাকে স্বাগতম। আমরা আপনার গোপনীয়তাকে সম্মান করি এবং আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। আপনি যখন আমাদের স্টোর ভিজিট করেন বা কেনাকাটা করেন, তখন আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত করি, তা এই গোপনীয়তা নীতিতে ব্যাখ্যা করা হয়েছে।

## আমরা যে তথ্য সংগ্রহ করি

### ব্যক্তিগত তথ্য
আপনি যখন কেনাকাটা করেন বা অ্যাকাউন্ট তৈরি করেন, তখন আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:
- নাম এবং যোগাযোগের তথ্য (ইমেল, ফোন নম্বর)
- বিলিং এবং শিপিং ঠিকানা
- পেমেন্ট তথ্য (আমাদের পেমেন্ট প্রোভাইডার দ্বারা সুরক্ষিতভাবে প্রসেস করা হয়)
- অর্ডারের ইতিহাস এবং পছন্দসমূহ

### স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য
আপনি যখন আমাদের স্টোর ভিজিট করেন, তখন আমরা স্বয়ংক্রিয়ভাবে নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:
- আইপি অ্যাড্রেস এবং ব্রাউজারের ধরন
- ডিভাইসের তথ্য
- ভিজিট করা পেজ এবং সময়
- রেফারিং ওয়েবসাইটের তথ্য

## আমরা কীভাবে আপনার তথ্য ব্যবহার করি

আমরা আপনার ব্যক্তিগত তথ্য নিম্নলিখিত কাজে ব্যবহার করি:
- আপনার অর্ডার প্রসেস এবং ডেলিভারি করতে
- আপনার অর্ডার বা কাস্টমার সাপোর্টের বিষয়ে যোগাযোগ করতে
- আপনাকে প্রোমোশনাল ইমেল বা অফার পাঠাতে (আপনার সম্মতি থাকলে)
- আমাদের ওয়েবসাইট এবং পরিষেবা উন্নত করতে
- আইনি বাধ্যবাধকতা মেনে চলতে

## তথ্য শেয়ার করা

আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না। আমরা নিম্নলিখিত ক্ষেত্রে আপনার তথ্য শেয়ার করতে পারি:
- অর্ডার ডেলিভারির জন্য শিপিং ক্যারিয়ার বা কুরিয়ার সার্ভিসের সাথে
- পেমেন্ট সম্পন্ন করার জন্য পেমেন্ট প্রসেসরের সাথে
- আমাদের অপারেশন বা ব্যবসায়িক কাজে সহায়তাকারী সার্ভিস প্রোভাইডারদের সাথে
- আইনগত প্রয়োজনে বা প্রশাসনের নির্দেশে

## তথ্য নিরাপত্তা

আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে এনক্রিপশন, সুরক্ষিত সার্ভার এবং নিয়মিত নিরাপত্তা অডিট সহ উপযুক্ত পদক্ষেপ গ্রহণ করি।

## আপনার অধিকার

আপনার নিম্নলিখিত অধিকার রয়েছে:
- আমরা আপনার সম্পর্কে কী তথ্য সংরক্ষণ করছি তা জানার অধিকার
- ভুল তথ্য সংশোধন করার অনুরোধ
- আপনার তথ্য মুছে ফেলার অনুরোধ (আইনি বাধ্যবাধকতা সাপেক্ষে)
- মার্কেটিং যোগাযোগ থেকে বিরতি নেওয়ার সুযোগ

## কুকিজ

আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে আমরা কুকিজ ব্যবহার করি। আপনি ব্রাউজার সেটিংসের মাধ্যমে কুকিজ নিয়ন্ত্রণ করতে পারেন।

## নীতি পরিবর্তন

আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। পরিবর্তনগুলো এই পেজে নতুন তারিখ সহ প্রকাশ করা হবে।

## যোগাযোগ করুন

এই গোপনীয়তা নীতি সম্পর্কে আপনার কোনো প্রশ্ন থাকলে, অনুগ্রহ করে যোগাযোগ করুন:
- **ইমেল:** ${email}
- **স্টোর:** ${storeName}
`.trim();
}

/**
 * Generate Terms of Service for a store (Bengali)
 */
export function getTermsOfServiceBn(storeName: string, email: string): string {
  return `
# পরিষেবার শর্তাবলী

**সর্বশেষ আপডেট:** ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}

## শর্তাবলী সম্মতি

${storeName}-এ অ্যাক্সেস বা ব্যবহারের মাধ্যমে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। যদি আপনি এই শর্তাবলীর কোনো অংশের সাথে একমত না হন, তবে অনুগ্রহ করে আমাদের পরিষেবা ব্যবহার করবেন না।

## আমাদের পরিষেবার ব্যবহার

### যোগ্যতা
আমাদের পরিষেবা ব্যবহার করতে এবং কেনাকাটা করতে আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে অথবা আপনাকে অভিভাবকের সম্মতি নিতে হবে।

### অ্যাকাউন্টের দায়িত্ব
- আপনার অ্যাকাউন্টের গোপনীয়তা বজায় রাখা আপনার দায়িত্ব
- আপনাকে সঠিক এবং সম্পূর্ণ তথ্য প্রদান করতে হবে
- আপনার অ্যাকাউন্টের অধীনে সব কার্যকলাপের জন্য আপনি দায়ী
- কোনো অনুমোদনহীন ব্যবহারের ক্ষেত্রে তাৎক্ষণিকভাবে আমাদের জানান

## পণ্য এবং মূল্য নির্ধারণ

### পণ্যের তথ্য
আমরা পণ্যের সঠিক বিবরণ এবং মূল্য প্রদানের চেষ্টা করি। তবে আমরা অধিকার রাখি:
- পণ্যের তথ্য বা মূল্যে কোনো ভুল সংশোধন করার
- মূল্যে ভুল থাকলে অর্ডার বাতিল করার
- প্রতি কাস্টমারের জন্য পণ্যের পরিমাণ সীমাবদ্ধ করার

### মূল্য
- সমস্ত মূল্য স্টোরের নির্ধারিত মুদ্রায় প্রদর্শিত হয় (যেমন: BDT)
- পূর্ব নোটিশ ছাড়াই মূল্য পরিবর্তন হতে পারে
- চেকআউটের সময় প্রযোজ্য ট্যাক্স এবং শিপিং চার্জ যুক্ত হবে

## অর্ডার এবং পেমেন্ট

### অর্ডার গ্রহণ
সমস্ত অর্ডার গ্রহণ এবং পণ্যের প্রাপ্যতার উপর নির্ভরশীল। আমরা যেকোনো অর্ডার প্রত্যাখ্যান বা বাতিল করার অধিকার সংরক্ষণ করি।

### পেমেন্ট
- কেনাকাটার সময় বা ডেলিভারির সময় (ক্যাশ অন ডেলিভারি-র ক্ষেত্রে) পেমেন্ট করতে হবে
- আমাদের চেকআউট পেজে প্রদর্শিত পেমেন্ট মেথডগুলো আমরা গ্রহণ করি
- সমস্ত লেনদেন সুরক্ষিতভাবে প্রসেস করা হয়

## শিপিং এবং ডেলিভারি

- ডেলিভারির সময়সীমা আনুমানিক এবং নিশ্চিত নয়
- ডেলিভারির পর পণ্যের ক্ষতির ঝুঁকি আপনার উপর বর্তাবে
- বিস্তারিত তথ্যের জন্য অনুগ্রহ করে আমাদের শিপিং পলিসি দেখুন

## মেধা সম্পত্তি (Intellectual Property)

${storeName}-এর সমস্ত কনটেন্ট, টেক্সট, ছবি, লোগো এবং ডিজাইন আমাদের সম্পত্তি বা আমাদের দ্বারা লাইসেন্সকৃত। লিখিত অনুমতি ছাড়া আপনি এগুলো ব্যবহার, পুনরুত্পাদন বা বিতরণ করতে পারবেন না।

## দায়বদ্ধতার সীমাবদ্ধতা

আইন অনুযায়ী অনুমোদিত সর্বোচ্চ সীমা পর্যন্ত, ${storeName} নিম্নলিখিত ক্ষেত্রে দায়ী থাকবে না:
- পরোক্ষ, আনুষঙ্গিক বা ফলস্বরূপ ক্ষতি
- লাভ বা ডেটা হারানো
- আমাদের পরিষেবা ব্যবহার বা ব্যবহারে অক্ষমতা থেকে উদ্ভূত ক্ষতি

## ক্ষতিপূরণ

আপনি এই শর্তাবলী লঙ্ঘন বা আমাদের পরিষেবার অপব্যবহার থেকে উদ্ভূত যেকোনো দাবি, ক্ষতি বা খরচ থেকে ${storeName}-কে ক্ষতিপূরণ দিতে সম্মত হচ্ছেন।

## প্রযোজ্য আইন

এই শর্তাবলী ${storeName} যে এলাকায় পরিচালিত হয়, সেই এলাকার আইন দ্বারা নিয়ন্ত্রিত হবে।

## শর্তাবলী পরিবর্তন

আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করতে পারি। আমাদের পরিষেবা ব্যবহার অব্যাহত রাখলে আপনি আপডেট করা শর্তাবলী মেনে নিচ্ছেন বলে গণ্য হবে।

## যোগাযোগ করুন

এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে, অনুগ্রহ করে যোগাযোগ করুন:
- **ইমেল:** ${email}
- **স্টোর:** ${storeName}
`.trim();
}

/**
 * Generate a Refund Policy for a store (Bengali)
 */
export function getRefundPolicyBn(storeName: string, email: string): string {
  return `
# রিফান্ড ও রিটার্ন পলিসি

**সর্বশেষ আপডেট:** ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}

## ওভারভিউ

${storeName}-এ আমরা চাই আপনি আপনার কেনাকাটায় সম্পূর্ণ সন্তুষ্ট থাকুন। যদি আপনি আপনার অর্ডারে খুশি না হন, আমরা সাহায্য করতে প্রস্তুত।

## রিটার্ন যোগ্যতা

### রিটার্নের জন্য যোগ্য
পণ্য ডেলিভারির **৭ দিনের** মধ্যে রিটার্ন করা যাবে যদি:
- পণ্যটি অব্যবহৃত এবং মূল অবস্থায় থাকে
- মূল প্যাকেজিং অক্ষত থাকে
- সব ট্যাগ এবং লেবেল সংযুক্ত থাকে
- আপনার কাছে ক্রয়ের প্রমাণ (অর্ডার নম্বর বা রিসিট) থাকে

### রিটার্নের জন্য যোগ্য নয়
নিম্নলিখিত পণ্যগুলো রিটার্ন করা যাবে না:
- ব্যক্তিগতকৃত বা কাস্টম-মেড আইটেম
- অন্তরঙ্গ বা স্বাস্থ্য সুরক্ষা পণ্য
- "ফাইনাল সেল" বা "নন-রিটার্নেবল" হিসেবে চিহ্নিত পণ্য
- অপব্যবহারের কারণে ক্ষতিগ্রস্ত পণ্য
- মূল প্যাকেজিং ছাড়া পণ্য

## রিফান্ড প্রক্রিয়া

### কীভাবে রিফান্ডের অনুরোধ করবেন

১. **যোগাযোগ করুন:** আমাদের ইমেল করুন ${email}-এ, সাথে দিন:
   - আপনার অর্ডার নম্বর
   - রিটার্নের কারণ
   - পণ্যের ছবি (যদি ত্রুটিপূর্ণ হয়)

২. **অনুমোদনের অপেক্ষা:** আমরা ২৪-৪৮ ঘণ্টার মধ্যে আপনার অনুরোধ পর্যালোচনা করব

৩. **পণ্য পাঠান:** অনুমোদিত হলে, প্রদত্ত ঠিকানায় পণ্যটি পাঠিয়ে দিন

৪. **রিফান্ড পান:** আমরা ফেরত পণ্যটি পাওয়ার ৫-৭ কার্যদিবসের মধ্যে রিফান্ড প্রসেস করব

### রিফান্ড মেথড
- মূল পেমেন্ট মেথডেই রিফান্ড দেওয়া হবে
- ক্যাশ অন ডেলিভারি অর্ডারের ক্ষেত্রে, ব্যাংক ট্রান্সফার বা মোবাইল ওয়ালেটের (বিকাশ/নগদ) মাধ্যমে রিফান্ড দেওয়া হবে

## এক্সচেঞ্জ (বিনিময়)

যদি আপনি ভিন্ন সাইজ বা রঙের জন্য পণ্য পরিবর্তন করতে চান:
১. স্টক আছে কিনা জানতে যোগাযোগ করুন
২. মূল পণ্যটি ফেরত দিন
৩. কাঙ্ক্ষিত পণ্যের জন্য নতুন অর্ডার করুন

## ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ পণ্য

যদি আপনি কোনো ক্ষতিগ্রস্ত বা ত্রুটিপূর্ণ পণ্য পান:
- ডেলিভারির ৪৮ ঘণ্টার মধ্যে যোগাযোগ করুন
- ক্ষতির ছবি প্রদান করুন
- আমরা কোনো অতিরিক্ত খরচ ছাড়াই রিপ্লেসমেন্ট বা পূর্ণ রিফান্ড ব্যবস্থা করব

## শিপিং খরচ

- **ত্রুটিপূর্ণ/ভুল পণ্য:** রিটার্ন শিপিং খরচ আমরা বহন করব
- **মন পরিবর্তন:** রিটার্ন শিপিং খরচ কাস্টমারকে বহন করতে হবে
- আমাদের ভুল ছাড়া অন্য কারণে রিটার্ন হলে মূল শিপিং চার্জ অফেরতযোগ্য

## অর্ডার বাতিল

### শিপিংয়ের আগে
অর্ডার প্লেস করার ২ ঘণ্টার মধ্যে বাতিল করলে পূর্ণ রিফান্ড পাওয়া যাবে।

### শিপিংয়ের পরে
অর্ডার শিপ হয়ে গেলে তা বাতিল করা যাবে না। আপনি ডেলিভারি নিতে অস্বীকৃতি জানাতে পারেন অথবা আমাদের রিটার্ন পলিসি অনুসরণ করে পণ্য ফেরত দিতে পারেন।

## যোগাযোগ করুন

রিফান্ড সম্পর্কিত অনুসন্ধানের জন্য যোগাযোগ করুন:
- **ইমেল:** ${email}
- **স্টোর:** ${storeName}

আমরা ২৪ ঘণ্টার মধ্যে সমস্ত অনুসন্ধানের উত্তর দেওয়ার চেষ্টা করি।
`.trim();
}

/**
 * Generate a Shipping Policy for a store (Bengali)
 */
export function getShippingPolicyBn(storeName: string, email: string): string {
  return `
# শিপিং পলিসি

**সর্বশেষ আপডেট:** ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}

## অর্ডার প্রসেসিং

### প্রসেসিং সময়
- অর্ডার কনফার্মেশন ইমেল পাওয়ার পর ১-২ কার্যদিবসের মধ্যে (ছুটির দিন ছাড়া) সব অর্ডার প্রসেস করা হয়।
- আপনার অর্ডার শিপ হওয়ার পর আপনি আরেকটি নোটিফিকেশন পাবেন।

### অতিরিক্ত চাপের সময় বিলম্ব
- অর্ডারের চাপ বেশি থাকলে প্রসেসিংয়ে কিছুটা বেশি সময় লাগতে পারে। যদি আপনার শিপমেন্টে উল্লেখযোগ্য বিলম্ব হয়, তবে আমরা ইমেল বা ফোনের মাধ্যমে যোগাযোগ করব।

## শিপিং রেট এবং সময়সীমা

### দেশের ভেতরে শিপিং
- আমরা সারা দেশে স্ট্যান্ডার্ড শিপিং সুবিধা প্রদান করি।
- আপনার অর্ডারের শিপিং চার্জ চেকআউটের সময় প্রদর্শিত হবে।
- **আনুমানিক ডেলিভারি সময়:** আপনার অবস্থানের উপর ভিত্তি করে ২-৫ কার্যদিবস।

### আন্তর্জাতিক শিপিং
- বর্তমানে আমরা দেশের বাইরে শিপিং করি না।

## অর্ডারের স্ট্যাটাস জানা

আপনার অর্ডার শিপ হয়ে গেলে, আমরা আপনাকে একটি ট্র্যাকিং নম্বর সহ ইমেল নোটিফিকেশন পাঠাব, যা দিয়ে আপনি স্ট্যাটাস চেক করতে পারবেন। ট্র্যাকিং তথ্য আপডেট হতে অনুগ্রহ করে ৪৮ ঘণ্টা সময় দিন।

যদি শিপিং কনফার্মেশন ইমেল পাওয়ার X দিনের মধ্যে আপনি অর্ডার না পান, তবে অনুগ্রহ করে আপনার নাম এবং অর্ডার নম্বর সহ ${email}-এ যোগাযোগ করুন। আমরা বিষয়টি খতিয়ে দেখব।

## রিফান্ড, রিটার্ন এবং এক্সচেঞ্জ

আমাদের রিফান্ড ও রিটার্ন পলিসি অনুযায়ী, পণ্য অব্যবহৃত এবং মূল অবস্থায় থাকলে ডেলিভারির ৭ দিন পর্যন্ত আমরা রিটার্ন গ্রহণ করি এবং পূর্ণ রিফান্ড প্রদান করি।

যদি আপনার অর্ডার কোনোভাবে ক্ষতিগ্রস্ত অবস্থায় পৌঁছায়, তবে অনুগ্রহ করে অর্ডার নম্বর এবং ক্ষতির ছবিসহ যত দ্রুত সম্ভব ${email}-এ ইমেল করুন। আমরা প্রতিটি কেস গুরুত্বের সাথে দেখি এবং সন্তোষজনক সমাধানের চেষ্টা করি।

আপনার আরও কোনো প্রশ্ন থাকলে, অনুগ্রহ করে ${email}-এ যোগাযোগ করতে দ্বিধা করবেন না।
`.trim();
}

/**
 * Generate a Subscription Policy for a store (Bengali)
 */
export function getSubscriptionPolicyBn(storeName: string, email: string): string {
  return `
# সাবস্ক্রিপশন পলিসি

**সর্বশেষ আপডেট:** ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}

## সারসংক্ষেপ

এই পলিসি ${storeName}-এর সাবস্ক্রিপশন বা রিকারিং অর্ডারগুলোর ক্ষেত্রে প্রযোজ্য।

## বিলিং ও রিনিউ

- সাবস্ক্রিপশন ফি নির্ধারিত সময় অনুযায়ী (সাপ্তাহিক/মাসিক) চার্জ হবে।
- ক্যানসেল না করলে সাবস্ক্রিপশন অটোমেটিক রিনিউ হবে।
- মূল্য বা বিলিং শিডিউলে পরিবর্তন হলে আমরা জানিয়ে দেব।

## সাবস্ক্রিপশন ম্যানেজমেন্ট

আপনি ${email}‑এ যোগাযোগ করে সাবস্ক্রিপশন পজ/ক্যানসেল করতে পারবেন।

## ক্যানসেলেশন

- ক্যানসেলেশন বর্তমান বিলিং সাইকেল শেষ হলে কার্যকর হবে।
- আইনগত বাধ্যবাধকতা ছাড়া প্রোরেটেড রিফান্ড দেওয়া হবে না।

## ব্যর্থ পেমেন্ট

- পেমেন্ট ব্যর্থ হলে আমরা নির্দিষ্ট সময়ের মধ্যে পুনরায় চেষ্টা করতে পারি।
- একাধিকবার ব্যর্থ হলে সাবস্ক্রিপশন স্থগিত বা বাতিল হতে পারে।

## পলিসি পরিবর্তন

সময় অনুযায়ী আমরা পলিসি আপডেট করতে পারি এবং এই পাতায় আপডেট প্রকাশ করা হবে।

## যোগাযোগ

কোনো প্রশ্ন থাকলে যোগাযোগ করুন:
- **ইমেল:** ${email}
- **স্টোর:** ${storeName}
`.trim();
}

/**
 * Generate a Legal Notice for a store (Bengali)
 */
export function getLegalNoticeBn(storeName: string, email: string): string {
  return `
# লিগ্যাল নোটিশ

**সর্বশেষ আপডেট:** ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}

## ব্যবসার তথ্য

- **স্টোরের নাম:** ${storeName}
- **যোগাযোগ ইমেল:** ${email}

## দায়মুক্তি (ডিসক্লেইমার)

আমরা যথাসাধ্য সঠিক তথ্য প্রদানের চেষ্টা করি। তবে ${storeName} কোনো তথ্যের সম্পূর্ণতা/নির্ভুলতা সম্পর্কে নিশ্চয়তা দেয় না এবং এর ব্যবহারজনিত ক্ষতির জন্য দায়ী নয়।

## বাহ্যিক লিংক

এই সাইটে তৃতীয়‑পক্ষের লিংক থাকতে পারে। সেসব সাইটের কনটেন্ট বা প্র্যাকটিসের জন্য আমরা দায়ী নই।

## বুদ্ধিবৃত্তিক সম্পত্তি

এই সাইটের সব কনটেন্ট (লেখা, ছবি, লোগো) ${storeName}‑এর মালিকানাধীন অথবা লাইসেন্সপ্রাপ্ত। অনুমতি ছাড়া ব্যবহার নিষিদ্ধ।

## যোগাযোগ

লিগ্যাল নোটিশ সম্পর্কিত প্রশ্ন থাকলে:
- **ইমেল:** ${email}
- **স্টোর:** ${storeName}
`.trim();
}

/**
 * Get policy content by type
 */
export type PolicyType = 'privacy' | 'terms' | 'refund' | 'shipping' | 'subscription' | 'legal';
export type Language = 'en' | 'bn';

export function getPolicyContent(
  type: PolicyType,
  storeName: string,
  email: string,
  lang: Language = 'en'
): { title: string; content: string } {
  const isBn = lang === 'bn';

  switch (type) {
    case 'privacy':
      return {
        title: isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy',
        content: isBn ? getPrivacyPolicyBn(storeName, email) : getPrivacyPolicy(storeName, email),
      };
    case 'terms':
      return {
        title: isBn ? 'পরিষেবার শর্তাবলী' : 'Terms of Service',
        content: isBn ? getTermsOfServiceBn(storeName, email) : getTermsOfService(storeName, email),
      };
    case 'refund':
      return {
        title: isBn ? 'রিফান্ড ও রিটার্ন পলিসি' : 'Refund & Return Policy',
        content: isBn ? getRefundPolicyBn(storeName, email) : getRefundPolicy(storeName, email),
      };
    case 'shipping':
      return {
        title: isBn ? 'শিপিং পলিসি' : 'Shipping Policy',
        content: isBn ? getShippingPolicyBn(storeName, email) : getShippingPolicy(storeName, email),
      };
    case 'subscription':
      return {
        title: isBn ? 'সাবস্ক্রিপশন পলিসি' : 'Subscription Policy',
        content: isBn ? getSubscriptionPolicyBn(storeName, email) : getSubscriptionPolicy(storeName, email),
      };
    case 'legal':
      return {
        title: isBn ? 'লিগ্যাল নোটিশ' : 'Legal Notice',
        content: isBn ? getLegalNoticeBn(storeName, email) : getLegalNotice(storeName, email),
      };
    default:
      throw new Error(`Unknown policy type: ${type}`);
  }
}
