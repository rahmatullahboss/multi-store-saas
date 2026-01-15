/**
 * Button Action Handler Script
 * 
 * Runtime script that handles button clicks on preview/published landing pages.
 * Inject this script into pages that have buttons connected via ButtonConnectorModal.
 * 
 * Supported actions:
 * - data-ozzyl-action="order" → Show order form modal
 * - data-ozzyl-action="cart" → Add product to cart
 * - data-ozzyl-action="whatsapp" → Open WhatsApp
 * - data-ozzyl-action="call" → Dial phone number
 */

export interface ButtonActionConfig {
  productId?: number;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  phoneNumber?: string;
  messageTemplate?: string;
  storeId?: number;
}

/**
 * Initialize button action handlers on the page
 * Call this function after the page content is loaded
 */
export function initButtonActionHandlers(config: ButtonActionConfig = {}) {
  // Find all connected buttons
  const buttons = document.querySelectorAll('[data-ozzyl-action]');
  
  buttons.forEach((button) => {
    const action = button.getAttribute('data-ozzyl-action');
    const productId = button.getAttribute('data-ozzyl-product') || config.productId;
    const phoneNumber = button.getAttribute('data-ozzyl-phone') || config.phoneNumber;
    const message = button.getAttribute('data-ozzyl-message') || config.messageTemplate;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      switch (action) {
        case 'order':
          handleOrder(productId, config);
          break;
        case 'cart':
          handleAddToCart(productId, config);
          break;
        case 'whatsapp':
          handleWhatsApp(phoneNumber, message, config);
          break;
        case 'call':
          handleCall(phoneNumber);
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    });
  });
  
  console.log(`[ButtonActionHandler] Initialized ${buttons.length} button(s)`);
}

/**
 * Handle Order action - scroll to order form or show modal
 */
function handleOrder(productId: string | number | null | undefined, config: ButtonActionConfig) {
  // First, try to scroll to an existing order form
  const orderForm = document.querySelector('#order-form, #order, [data-order-form], .order-form');
  if (orderForm) {
    orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  
  // Otherwise, dispatch custom event for React components to handle
  window.dispatchEvent(new CustomEvent('ozzyl:show-order-form', {
    detail: {
      productId,
      ...config
    }
  }));
}

/**
 * Handle Add to Cart action
 */
function handleAddToCart(productId: string | number | null | undefined, config: ButtonActionConfig) {
  if (!productId) {
    console.warn('[ButtonActionHandler] No product ID for cart action');
    return;
  }
  
  const numericProductId = typeof productId === 'string' ? parseInt(productId) : productId;
  
  try {
    // Update localStorage cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: { productId: number }) => item.productId === numericProductId);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ 
        productId: numericProductId, 
        quantity: 1, 
        storeId: config.storeId 
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch events for UI updates
    window.dispatchEvent(new Event('cart-updated'));
    window.dispatchEvent(new Event('storage'));
    
    // Show visual feedback
    showToast('Added to cart! 🛒', 'success');
  } catch (e) {
    console.error('[ButtonActionHandler] Failed to update cart:', e);
    showToast('Failed to add to cart', 'error');
  }
}

/**
 * Handle WhatsApp action
 */
function handleWhatsApp(phoneNumber: string | null | undefined, message: string | null | undefined, config: ButtonActionConfig) {
  if (!phoneNumber) {
    console.warn('[ButtonActionHandler] No phone number for WhatsApp action');
    return;
  }
  
  // Clean phone number (remove non-digits except leading +)
  let cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  
  // Add Bangladesh country code if needed
  if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
    cleanPhone = '880' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('+880')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Build WhatsApp URL
  let url = `https://wa.me/${cleanPhone}`;
  if (message) {
    // Replace placeholders
    let finalMessage = message;
    if (config.productTitle) {
      finalMessage = finalMessage.replace('{{product_name}}', config.productTitle);
    }
    url += `?text=${encodeURIComponent(finalMessage)}`;
  }
  
  window.open(url, '_blank');
}

/**
 * Handle Call action
 */
function handleCall(phoneNumber: string | null | undefined) {
  if (!phoneNumber) {
    console.warn('[ButtonActionHandler] No phone number for call action');
    return;
  }
  
  // Clean phone number
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  window.location.href = `tel:${cleanPhone}`;
}

/**
 * Show a simple toast notification
 */
function showToast(message: string, type: 'success' | 'error' = 'success') {
  // Check if a toast container exists
  let container = document.getElementById('ozzyl-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ozzyl-toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  // Add animation keyframes if not exists
  if (!document.getElementById('ozzyl-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'ozzyl-toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  container.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Generate and inject the handler script into an HTML string
 * Used when saving the page to include runtime functionality
 */
export function generateHandlerScript(config: ButtonActionConfig = {}): string {
  const configJson = JSON.stringify(config);
  
  return `
<script>
(function() {
  var config = ${configJson};
  
  function initHandlers() {
    var buttons = document.querySelectorAll('[data-ozzyl-action]');
    buttons.forEach(function(button) {
      var action = button.getAttribute('data-ozzyl-action');
      var productId = button.getAttribute('data-ozzyl-product') || config.productId;
      var phoneNumber = button.getAttribute('data-ozzyl-phone') || config.phoneNumber;
      var message = button.getAttribute('data-ozzyl-message') || config.messageTemplate;
      
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (action === 'order') {
          var orderForm = document.querySelector('#order-form, #order, [data-order-form]');
          if (orderForm) {
            orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.dispatchEvent(new CustomEvent('ozzyl:show-order-form', { detail: { productId: productId } }));
          }
        } else if (action === 'cart') {
          if (productId) {
            var cart = JSON.parse(localStorage.getItem('cart') || '[]');
            var idx = cart.findIndex(function(item) { return item.productId == productId; });
            if (idx >= 0) { cart[idx].quantity += 1; } else { cart.push({ productId: parseInt(productId), quantity: 1 }); }
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cart-updated'));
            alert('Added to cart! 🛒');
          }
        } else if (action === 'whatsapp') {
          if (phoneNumber) {
            var phone = phoneNumber.replace(/[^0-9]/g, '');
            if (phone.startsWith('01') && phone.length === 11) phone = '880' + phone.substring(1);
            var url = 'https://wa.me/' + phone;
            if (message) url += '?text=' + encodeURIComponent(message);
            window.open(url, '_blank');
          }
        } else if (action === 'call') {
          if (phoneNumber) {
            window.location.href = 'tel:' + phoneNumber.replace(/[^0-9+]/g, '');
          }
        }
      });
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHandlers);
  } else {
    initHandlers();
  }
})();
</script>`;
}

export default {
  initButtonActionHandlers,
  generateHandlerScript
};
