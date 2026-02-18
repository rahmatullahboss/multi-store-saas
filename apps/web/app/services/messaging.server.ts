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
  components?: Record<string, unknown>[];
  text?: string;
  storeId: number;
}

interface SMSResponse {
  success: boolean;
  provider: string;
  data?: unknown;
  error?: string;
  messageId?: string;
}

// === CONFIG INTERFACE ===
interface MarketingConfig {
  sslWireless?: {
    apiToken: string;
    sid: string;
    domain?: string;
  };
  bulkSmsBd?: {
    apiKey: string;
    senderId: string;
  };
  meta?: {
    phoneId: string;
    accessToken: string;
  };
}

// === SMS PROVIDER ABSTRACTION ===

interface ISMSProvider {
  send(payload: SMSPayload): Promise<SMSResponse>;
}

class SSLWirelessProvider implements ISMSProvider {
  constructor(private env: Env, private config?: MarketingConfig['sslWireless']) {}

  async send({ to, message }: SMSPayload): Promise<SMSResponse> {
    // Priority: DB Config > Env Config
    const apiToken = this.config?.apiToken || this.env.SSL_SMS_API_TOKEN;
    const sid = this.config?.sid || this.env.SSL_SMS_SID;
    const domain = this.config?.domain || this.env.SSL_SMS_DOMAIN || "https://smsplus.sslwireless.com";

    if (!apiToken || !sid) {
        return { success: false, provider: "ssl_wireless", error: "Missing Credentials" };
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
      console.log(`[SMS][SSL] Response:`, JSON.stringify(data));
      
      // SSL Wireless Success checks
      if (data?.status_code === 200 || data?.status === "SUCCESS") {
          return { success: true, provider: "ssl_wireless", data, messageId: data?.smsinfo?.[0]?.sms_status };
      } else {
          return { success: false, provider: "ssl_wireless", error: data?.error_message || "Gateway Error", data };
      }

    } catch (error: any) {
      console.error("[SMS][SSL] Network Error:", error);
      return { success: false, provider: "ssl_wireless", error: error.message || "Network Error" };
    }
  }
}

class BulkSMSBDProvider implements ISMSProvider {
  constructor(private env: Env) {}

  async send({ to, message }: SMSPayload): Promise<SMSResponse> {
    const apiKey = this.env.BULKSMS_BD_API_KEY;
    const senderId = this.env.BULKSMS_BD_SENDER_ID;
    
    // Using standard BulkSMS BD endpoint (may need adjustment based on specific reseller)
    const baseUrl = "https://bulksmsbd.net/api/smsapi"; 

    if (!apiKey || !senderId) {
        return { success: false, provider: "bulksms_bd", error: "Missing Credentials" };
    }

    try {
      // BulkSMS BD usually uses GET or POST with url-encoded params
      const params = new URLSearchParams({
        api_key: apiKey,
        type: "text",
        number: to,
        senderid: senderId,
        message: message,
      });

      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: "GET", // Most support GET
      });

      const data = await response.json() as any;
      console.warn(`[SMS][BulkSMS] Response:`, JSON.stringify(data));

      // Check success (Response format varies, usually has response_code 202 or similar)
      if (data?.response_code === 202 || data?.success === true) {
          return { success: true, provider: "bulksms_bd", data, messageId: data?.message_id };
      } else {
          return { success: false, provider: "bulksms_bd", error: data?.error_message || "Gateway Error", data };
      }
    } catch (error: any) {
       console.error("[SMS][BulkSMS] Network Error:", error);
       return { success: false, provider: "bulksms_bd", error: error.message || "Network Error" };
    }
  }
}

class SimulatorProvider implements ISMSProvider {
  async send({ to, message }: SMSPayload): Promise<SMSResponse> {
    console.warn(`[SMS][SIMULATION] To: ${to}, Message: ${message}`);
    return { success: true, provider: "simulator", messageId: "sim_" + crypto.randomUUID() };
  }
}

// === FACTORY ===

// === FACTORY ===

async function getSMSProvider(db: Database, env: Env, storeId: number): Promise<ISMSProvider> {
    // Fetch Store Config
    const store = await db.query.stores.findFirst({
        where: eq(stores.id, storeId),
        columns: { marketingConfig: true }
    });
    
    let config: MarketingConfig = {};
    if (store?.marketingConfig) {
        try { config = JSON.parse(store.marketingConfig); } catch (e) {
          console.error("Failed to parse marketingConfig", e);
        }
    }

    // Determine Provider Preference (could be added to DB later, using Env for now or presence of keys)
    const provider = env.SMS_PROVIDER || 'simulator';
    
    if (config.sslWireless?.apiToken || provider === 'ssl_wireless') {
        return new SSLWirelessProvider(env, config.sslWireless);
    }
    // Implement BulkSMS update similarly if needed
    if (provider === 'bulksms_bd') return new BulkSMSBDProvider(env);
    
    return new SimulatorProvider();
}


// === EXPORTED DUAL-CHANNEL FUNCTIONS ===

export async function sendSMS(db: Database, env: Env, payload: SMSPayload) {
  const provider = await getSMSProvider(db, env, payload.storeId);
  return await provider.send(payload);
}

// === WHATSAPP BUSINESS API (Cloud API) ===

export async function sendWhatsApp(db: Database, env: Env, { to, templateName, templateLanguage, components, text, storeId }: WhatsAppPayload) {
  // 1. Get Agent/Store WhatsApp Config
  const agent = await db.query.agents.findFirst({
    where: eq(agents.storeId, storeId),
    columns: { whatsappPhoneId: true }
  });

  const store = await db.query.stores.findFirst({
      where: eq(stores.id, storeId),
      columns: { marketingConfig: true }
  });

  let config: MarketingConfig = {};
  if (store?.marketingConfig) {
      try { config = JSON.parse(store.marketingConfig); } catch (e) {
        console.error("Failed to parse marketingConfig for WhatsApp", e);
      }
  }


  // Priority: Agent specific > Store Config > Env (Platform)
  const phoneId = agent?.whatsappPhoneId || config.meta?.phoneId || env.META_WHATSAPP_PHONE_ID;
  const accessToken = config.meta?.accessToken || env.META_WHATSAPP_TOKEN;

  if (!phoneId || !accessToken) {
    console.warn(`[WhatsApp] Configuration missing for store ${storeId}. PhoneID: ${phoneId}, Token: ${!!accessToken}`);
    console.warn(`[WhatsApp][SIMULATION] To: ${to}, Template: ${templateName}, Text: ${text}`);
    return { success: false, error: "not_configured" };
  }

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
  
  const body: Record<string, unknown> = {
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

  } catch (error: any) {
    console.error("[WhatsApp][Meta] Network Error:", error);
    return { success: false, error: "Network Error" };
  }
}


/**
 * SMART NOTIFIER
 * Decides whether to send SMS, WhatsApp or Both based on customer activity
 */
export async function sendSmartNotification(
  db: Database,
  env: Env,
  customerId: number, 
  storeId: number, 
  type: 'ORDER_CONFIRMATION' | 'ABANDONED_CART' | 'WELCOME' | 'WINBACK_OFFER' | 'REVIEW_REQUEST',
  data: Record<string, any>
) {
  // 1. Fetch Customer Preferences (Future)
  // ...

  let messageText = `Update: ${type}`;
  if (type === 'ABANDONED_CART') {
    const cartUrl = data.cartUrl || data.recoveryUrl || '';
    const amountText =
      typeof data.amount === 'number'
        ? ` (${data.currency || 'BDT'} ${Math.round(data.amount)})`
        : '';
    messageText = `Hi ${data.customerName || 'there'}, your cart is waiting${amountText}. Complete checkout: ${cartUrl}`;
  }
  if (type === 'WINBACK_OFFER') messageText = `We miss you! Here is a 10% discount for your next order. Code: WELCOMEBACK`;
  if (type === 'REVIEW_REQUEST') messageText = `Hi ${data.customerName}, thanks for your order! Please rate your experience here: ${data.reviewUrl || 'https://store.com/review'}`;

  // 2. Logic: Try WhatsApp first (cheaper/richer), fallback to SMS
  const whatsAppResult = await sendWhatsApp(db, env, {
    to: data.phone,
    text: messageText,
    storeId
  });

  if (!whatsAppResult.success) {
    console.warn(`[SmartNotifier] WhatsApp failed (${whatsAppResult.error}), falling back to SMS.`);
    // Fallback to SMS
    await sendSMS(db, env, {
      to: data.phone,
      message: messageText,
      storeId
    });
  }

  return { success: true };
}
