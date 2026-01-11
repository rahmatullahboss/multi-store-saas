import type { Database } from "../lib/db.server";
import { stores, agents } from "../../db/schema";
import { eq } from "drizzle-orm";

/**
 * MESSAGING SERVICE
 * Centralized hub for sending multi-channel notifications (SMS, WhatsApp, Email).
 * Implements "Part 2: Merchant-Facing Features" from Marketing Research.
 */

interface SMSPayload {
  to: string; // 88017...
  message: string;
  storeId: number;
}

interface WhatsAppPayload {
  to: string;
  templateName?: string;
  templateLanguage?: string;
  components?: any[];
  text?: string;
  storeId: number;
}

// === SMS GATEWAY INTEGRATIONS (SSL Wireless / BulkSMS BD) ===

export async function sendSMS(db: Database, { to, message, storeId }: SMSPayload) {
  // 1. Get Store SMS Config
  const store = await db.query.stores.findFirst({
    where: eq(stores.id, storeId),
    columns: {
      name: true,
      // In future: Add smsConfig column
    }
  });

  if (!store) throw new Error("Store not found");

  // TODO: Replace with actual Provider API call (SSL Wireless / BulkSMS)
  console.log(`[SMS][Active] Sending to ${to}: ${message}`);
  
  // Placeholder for SSL Wireless Implementation
  // const response = await fetch("https://smsplus.sslwireless.com/api/v3/send-sms", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     api_token: process.env.SSLWIRELESS_API_TOKEN,
  //     sid: process.env.SSLWIRELESS_SID,
  //     msisdn: to,
  //     sms: message,
  //     csms_id: crypto.randomUUID()
  //   })
  // });

  return { success: true, provider: "simulator" };
}

// === WHATSAPP BUSINESS API (Cloud API) ===

export async function sendWhatsApp(db: Database, { to, templateName, text, storeId }: WhatsAppPayload) {
  // 1. Get Agent/Store WhatsApp Config
  const agent = await db.query.agents.findFirst({
    where: eq(agents.storeId, storeId),
    columns: {
      whatsappPhoneId: true,
      // accessToken should be securely stored (e.g. env or encrypted DB)
    }
  });

  if (!agent?.whatsappPhoneId) {
    console.warn("[WhatsApp] No WhatsApp Business configuration found for store", storeId);
    return { success: false, error: "not_configured" };
  }

  // TODO: Implement Meta Cloud API
  console.log(`[WhatsApp][${agent.whatsappPhoneId}] Sending to ${to}: ${templateName || text}`);

  // Base URL: https://graph.facebook.com/v18.0/${phoneId}/messages

  return { success: true, provider: "meta_cloud_api_simulator" };
}

/**
 * SMART NOTIFIER
 * Decides whether to send SMS, WhatsApp or Both based on customer activity
 */
export async function sendSmartNotification(
  db: Database,
  customerId: number, 
  storeId: number, 
  type: 'ORDER_CONFIRMATION' | 'ABANDONED_CART' | 'WELCOME' | 'WINBACK_OFFER' | 'REVIEW_REQUEST',
  data: any
) {
  // 1. Fetch Customer Preferences (if any)
  // ...

  let messageText = `Update: ${type}`;
  if (type === 'WINBACK_OFFER') messageText = `We miss you! Here is a 10% discount for your next order. Code: WELCOMEBACK`;
  if (type === 'REVIEW_REQUEST') messageText = `Hi ${data.customerName}, thanks for your order! Please rate your experience here: ${data.reviewUrl || 'https://store.com/review'}`;

  // 2. Logic: Try WhatsApp first (cheaper/richer), fallback to SMS
  const whatsAppResult = await sendWhatsApp(db, {
    to: data.phone,
    text: messageText,
    storeId
  });

  if (!whatsAppResult.success) {
    // Fallback to SMS
    await sendSMS(db, {
      to: data.phone,
      message: messageText,
      storeId
    });
  }

  return { success: true };
}
