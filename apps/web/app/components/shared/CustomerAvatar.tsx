/**
 * CustomerAvatar - Shared avatar component for customer headers
 *
 * Renders a circular avatar with the customer's initial letter.
 * Used in store template headers (Starter Store, Nova Lux, etc.)
 * to avoid duplicating avatar rendering logic.
 */

interface CustomerAvatarProps {
  customer: {
    name: string | null;
    email: string | null;
  };
  /** Primary theme color for the avatar background */
  primaryColor: string;
  /** Size in Tailwind units (default: 7 = 1.75rem) */
  size?: 'sm' | 'md';
}

/**
 * Get the display initial for a customer avatar.
 */
function getInitial(customer: { name: string | null; email: string | null }): string {
  return (customer.name?.[0] || customer.email?.[0] || 'U').toUpperCase();
}

/**
 * Get the display name for a customer.
 */
export function getDisplayName(customer: { name: string | null; email: string | null }): string {
  return customer.name || customer.email?.split('@')[0] || 'Account';
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-7 h-7 text-sm',
} as const;

export function CustomerAvatar({
  customer,
  primaryColor,
  size = 'md',
}: CustomerAvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white`}
      style={{ backgroundColor: primaryColor }}
    >
      {getInitial(customer)}
    </div>
  );
}
