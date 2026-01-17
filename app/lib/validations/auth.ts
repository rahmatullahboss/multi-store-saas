/**
 * Auth Validation Schemas
 * 
 * Zod schemas for authentication and registration forms
 */

import { z } from 'zod';

// Bangladesh mobile number: must start with 01 and be 11 digits
export const bdPhoneSchema = z
  .string()
  .min(11, 'মোবাইল নম্বর ১১ সংখ্যার হতে হবে')
  .max(11, 'মোবাইল নম্বর ১১ সংখ্যার হতে হবে')
  .regex(/^01\d{9}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)');

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'ইমেইল দিন')
  .email('সঠিক ইমেইল দিন');

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে');

// Store name validation
export const storeNameSchema = z
  .string()
  .min(2, 'স্টোরের নাম কমপক্ষে ২ অক্ষরের হতে হবে');

// Subdomain validation: lowercase alphanumeric and hyphens, 3-30 chars
export const subdomainSchema = z
  .string()
  .min(3, 'সাবডোমেইন কমপক্ষে ৩ অক্ষরের হতে হবে')
  .max(30, 'সাবডোমেইন সর্বোচ্চ ৩০ অক্ষরের হতে পারে')
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/, 'সাবডোমেইন শুধু ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন থাকতে পারে');

// ============================================================================
// FORM SCHEMAS
// ============================================================================

// Step 1: Account info (onboarding)
export const accountInfoSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: bdPhoneSchema,
});

// Step 2: Store info (onboarding)
export const storeInfoSchema = z.object({
  storeName: storeNameSchema,
  subdomain: subdomainSchema,
  category: z.string().min(1, 'ক্যাটাগরি সিলেক্ট করুন'),
});

// Complete Profile (Google OAuth users)
export const completeProfileSchema = z.object({
  phone: bdPhoneSchema,
  storeName: storeNameSchema,
  subdomain: subdomainSchema,
  category: z.string().min(1, 'ক্যাটাগরি সিলেক্ট করুন'),
});

// Login form
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'পাসওয়ার্ড দিন'),
});

// ============================================================================
// Utility Types (infer from schemas)
// ============================================================================
export type AccountInfo = z.infer<typeof accountInfoSchema>;
export type StoreInfo = z.infer<typeof storeInfoSchema>;
export type CompleteProfile = z.infer<typeof completeProfileSchema>;
export type LoginData = z.infer<typeof loginSchema>;
