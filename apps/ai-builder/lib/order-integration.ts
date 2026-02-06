export interface OrderConfig {
  storeId: number;
  productId: number;
  apiUrl: string;
  productTitle?: string;
  productPrice?: number;
}

/**
 * Replace order form placeholders in AI-generated code with actual values.
 * The AI now generates unique order form designs, we just replace the placeholder values.
 */
export function injectOrderForm(code: string, config: OrderConfig): string {
  // Replace placeholders with actual values
  let processedCode = code
    .replace(/__STORE_ID__/g, String(config.storeId))
    .replace(/__PRODUCT_ID__/g, String(config.productId))
    .replace(/__API_URL__/g, config.apiUrl);
  
  return processedCode;
}

/**
 * Extract code from AI response (handles code fences if present)
 */
export function extractCode(response: string): string {
  // Remove markdown code fences if present
  const codeBlockMatch = response.match(/```(?:jsx?|tsx?|react)?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code block, assume the entire response is code
  return response.trim();
}
