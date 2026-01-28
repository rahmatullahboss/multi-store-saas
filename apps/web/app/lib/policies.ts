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
OR
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
 * Get policy content by type
 */
export type PolicyType = 'privacy' | 'terms' | 'refund' | 'shipping';

export function getPolicyContent(
  type: PolicyType,
  storeName: string,
  email: string
): { title: string; content: string } {
  switch (type) {
    case 'privacy':
      return {
        title: 'Privacy Policy',
        content: getPrivacyPolicy(storeName, email),
      };
    case 'terms':
      return {
        title: 'Terms of Service',
        content: getTermsOfService(storeName, email),
      };
    case 'refund':
      return {
        title: 'Refund & Return Policy',
        content: getRefundPolicy(storeName, email),
      };
    case 'shipping':
      return {
        title: 'Shipping Policy',
        content: getShippingPolicy(storeName, email),
      };
    default:
      throw new Error(`Unknown policy type: ${type}`);
  }
}
