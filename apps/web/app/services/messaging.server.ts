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

export async function sendSMS(db: Database, env: Env, { to, message, storeId }: SMSPayload) {
  // 1. Get Store SMS Config (Future: Fetch from DB)
  // For now, we assume global ENV variables for the platform's gateway
  const apiToken = env.SSL_SMS_API_TOKEN;
  const sid = env.SSL_SMS_SID;
  const domain = env.SSL_SMS_DOMAIN || "https://smsplus.sslwireless.com";

  if (!apiToken || !sid) {
    console.warn("[SMS] SSL Wireless credentials not found in ENV. Simulating send.");
    console.log(`[SMS][SIMULATION] To: ${to}, Message: ${message}`);
    return { success: true, provider: "simulator" };
  }

  try {
    const csmsId = crypto.randomUUID().slice(0, 15); // Unique ID per SMS
    const response = await fetch(`${domain}/api/v3/send-sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_token: apiToken,
        sid: sid,
        msisdn: to,
        sms: message,
        csms_id: csmsId
      })
    });

    const data = await response.json() as any;
    
    // SSL Wireless Success Response usually has status_code 200 and 'success' string
    if (data?.status_code === 200 || data?.status === "SUCCESS") {
        console.log(`[SMS][SSL] Sent to ${to}. Ref: ${data?.smsinfo?.[0]?.sms_status}`);
        return { success: true, provider: "ssl_wireless", data };
    } else {
        console.error(`[SMS][SSL] Failed: ${JSON.stringify(data)}`);
        return { success: false, error: data?.error_message || "Gateway Error" };
    }

  } catch (error) {
    console.error("[SMS][SSL] Network Error:", error);
    return { success: false, error: "Network Error" };
  }
}

// === WHATSAPP BUSINESS API (Cloud API) ===

export async function sendWhatsApp(db: Database, env: Env, { to, templateName, templateLanguage, components, text, storeId }: WhatsAppPayload) {
  // 1. Get Agent/Store WhatsApp Config
  const agent = await db.query.agents.findFirst({
    where: eq(agents.storeId, storeId),
    columns: {
      whatsappPhoneId: true,
      // In production, accessToken should be in DB. For now, fallback to ENV.
    }
  });

  const phoneId = agent?.whatsappPhoneId;
  const accessToken = env.META_WHATSAPP_TOKEN;

  if (!phoneId || !accessToken) {
    console.warn(`[WhatsApp] Configuration missing for store ${storeId}. PhoneID: ${phoneId}, Token: ${!!accessToken}`);
    console.log(`[WhatsApp][SIMULATION] To: ${to}, Template: ${templateName}, Text: ${text}`);
    return { success: false, error: "not_configured" };
  }

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
  
  const body: any = {
    messaging_product: "whatsapp",
    to: to,
  };

  if (templateName) {
    body.type = "template";
    body.template = {
      name: templateName,
      language: { code: templateLanguage || "en_US" },
      components: components || []
    };
  } else if (text) {
    body.type = "text";
    body.text = { body: text };
  } else {
      return { success: false, error: "Invalid Payload: No text or template" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json() as any;

    if (response.ok) {
        return { success: true, provider: "meta_cloud_api", messageId: data.messages?.[0]?.id };
    } else {
        console.error(`[WhatsApp][Meta] Failed: ${JSON.stringify(data)}`);
        return { success: false, error: data?.error?.message || "Meta API Error" };
    }

  } catch (error) {
    console.error("[WhatsApp][Meta] Network Error:", error);
    return { success: false, error: "Network Error" };
  }
}


/**
 * SMART NOTIFIER
 * Decides whether to send SMS, WhatsApp or Both based on customer activity
 */
// ...
export async function sendSmartNotification(
  db: Database,
  env: Env,
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
  const whatsAppResult = await sendWhatsApp(db, env, {
    to: data.phone,
    text: messageText,
    storeId
  });

  if (!whatsAppResult.success) {
    // Fallback to SMS
    await sendSMS(db, env, {
      to: data.phone,
      message: messageText,
      storeId
    });
  }


  return { success: true };
}
