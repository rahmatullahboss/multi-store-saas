import type { ReactElement } from 'react';

/** Props accepted by FloatingActionButtons for type compatibility with routes.
 *  MVP stub — renders nothing; full implementation is archived. */
export interface FloatingActionButtonsProps {
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  callEnabled?: boolean;
  callNumber?: string;
  orderEnabled?: boolean;
  orderText?: string;
  orderBgColor?: string;
  orderTextColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

// MVP fallback: disables builder floating actions on storefront pages.
export function FloatingActionButtons(_props: FloatingActionButtonsProps): ReactElement | null {
  return null;
}

export default FloatingActionButtons;
