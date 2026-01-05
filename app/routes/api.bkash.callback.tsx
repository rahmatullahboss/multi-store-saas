/**
 * bKash Payment Callback Handler
 * 
 * Route: /api/bkash/callback
 * 
 * This route handles the redirect from bKash after payment.
 * - On success: Execute payment and upgrade plan
 * - On failure: Show error message
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { BkashService } from '~/services/bkash.server';
import type { PlanType } from '~/utils/plans.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Get query params from bKash callback
  const paymentID = url.searchParams.get('paymentID');
  const status = url.searchParams.get('status');
  const storeId = url.searchParams.get('storeId');
  const plan = url.searchParams.get('plan') as PlanType | null;
  const invoice = url.searchParams.get('invoice');

  // Validate required params
  if (!paymentID || !storeId || !plan) {
    return redirect('/app/billing?error=invalid_callback');
  }

  // Handle cancelled or failed payments
  if (status === 'cancel') {
    return redirect('/app/billing?error=payment_cancelled');
  }
  
  if (status === 'failure') {
    return redirect('/app/billing?error=payment_failed');
  }

  // For success, execute the payment
  const env = context.cloudflare.env;
  
  if (!env.BKASH_APP_KEY || !env.BKASH_APP_SECRET) {
    return redirect('/app/billing?error=config_error');
  }

  try {
    const bkash = BkashService.fromEnv(env);
    
    // Execute the payment to complete it
    const executeResult = await bkash.executePayment(paymentID);
    
    if (executeResult.transactionStatus !== 'Completed') {
      console.error('[bKash Callback] Payment not completed:', executeResult);
      return redirect(`/app/billing?error=payment_incomplete&status=${executeResult.transactionStatus}`);
    }

    // Payment successful - update store plan
    const db = drizzle(env.DB);
    const storeIdNum = parseInt(storeId, 10);
    
    await db
      .update(stores)
      .set({
        planType: plan,
        subscriptionStatus: 'active',
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeIdNum));

    // Log the successful payment (you could save to a payments table here)
    console.log('[bKash Callback] Payment successful:', {
      storeId: storeIdNum,
      plan,
      trxID: executeResult.trxID,
      amount: executeResult.amount,
      invoice,
    });

    // Redirect to billing with success message
    return redirect(`/app/billing?success=true&plan=${plan}&trxID=${executeResult.trxID}`);

  } catch (error) {
    console.error('[bKash Callback] Error executing payment:', error);
    return redirect('/app/billing?error=execution_failed');
  }
}
