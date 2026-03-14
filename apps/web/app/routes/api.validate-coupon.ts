import { type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { z } from 'zod';
import { stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import { createDb } from '~/lib/db.server';

const ValidateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  storeId: z.number().int().positive('Store ID is required'),
  orderAmount: z.number().min(0, 'Order amount must be a positive number'),
});

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  const db = createDb(context.cloudflare.env.DB);

  try {
    let body;
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
      if (body.storeId) body.storeId = parseInt(body.storeId as string, 10);
      if (body.orderAmount) body.orderAmount = parseFloat(body.orderAmount as string);
    }

    const parseResult = ValidateCouponSchema.safeParse(body);

    if (!parseResult.success) {
      return json({
        valid: false,
        discount: 0,
        message: 'Invalid request data',
        details: parseResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { code, storeId, orderAmount } = parseResult.data;

    // Verify store
    const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    if (storeResult.length === 0) {
      return json({ valid: false, discount: 0, message: 'Store not found' }, { status: 404 });
    }

    // TODO: Query the discounts table once it exists in the schema.
    /*
    const discountResult = await db.select().from(discounts).where(and(eq(discounts.storeId, storeId), eq(discounts.code, code.toUpperCase().trim()))).limit(1);
    if (discountResult.length === 0) return json({ valid: false, discount: 0, message: 'কুপন কোডটি সঠিক নয়' });
    const discount = discountResult[0];
    ... all checks ...
    */

    // MOCK DISCOUNT VALIDATION LOGIC
    let discount = null;
    const normalizedCode = code.toUpperCase().trim();
    if (normalizedCode === 'SAVE20') {
      discount = {
        code: 'SAVE20',
        type: 'percentage' as const,
        value: 20,
        minOrderAmount: 1000,
        maxDiscountAmount: 500,
        isActive: true,
      };
    } else if (normalizedCode === 'FLAT100') {
      discount = {
        code: 'FLAT100',
        type: 'fixed' as const,
        value: 100,
        minOrderAmount: 500,
        maxDiscountAmount: null,
        isActive: true,
      };
    }

    if (!discount) {
      return json({ valid: false, discount: 0, message: 'কুপন কোডটি সঠিক নয় (Invalid coupon code)' });
    }

    if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
      return json({ valid: false, discount: 0, message: `এই কুপনটি ব্যবহার করতে কমপক্ষে ৳${discount.minOrderAmount} টাকার অর্ডার করতে হবে` });
    }

    // Calculate Discount
    let calculatedDiscount = 0;
    if (discount.type === 'percentage') {
      calculatedDiscount = orderAmount * (discount.value / 100);
      if (discount.maxDiscountAmount && calculatedDiscount > discount.maxDiscountAmount) {
        calculatedDiscount = discount.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = discount.value;
    }

    // Cap at order amount
    if (calculatedDiscount > orderAmount) {
        calculatedDiscount = orderAmount;
    }

    return json({
      valid: true,
      discount: Math.round(calculatedDiscount),
      message: 'কুপনটি সফলভাবে প্রয়োগ করা হয়েছে! (Coupon applied successfully!)',
      code: discount.code,
      type: discount.type,
      value: discount.value,
      maxDiscountAmount: discount.maxDiscountAmount,
      minOrderAmount: discount.minOrderAmount,
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return json({ valid: false, discount: 0, message: 'কুপন যাচাই করতে সমস্যা হয়েছে (Failed to validate coupon)' }, { status: 500 });
  }
}
