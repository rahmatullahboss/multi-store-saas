/**
 * Cloudflare for SaaS Service
 *
 * Handles automatic provisioning of custom hostnames via Cloudflare API.
 * This enables paid users to connect their own domains with automatic SSL.
 *
 * Required Environment Variables:
 * - CLOUDFLARE_API_TOKEN: API token with "SSL and Certificates: Edit" permission
 * - CLOUDFLARE_ZONE_ID: Zone ID for the SaaS domain (ozzyl.com)
 */

export interface CloudflareEnv {
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ZONE_ID?: string;
}

export interface CustomHostname {
  id: string;
  hostname: string;
  status: 'pending' | 'active' | 'pending_deletion' | 'moved' | 'deleted';
  ssl: {
    id?: string;
    status: 'pending_validation' | 'pending_issuance' | 'pending_deployment' | 'active' | 'deleted';
    method: string;
    type: string;
    validation_records?: Array<{
      status: string;
      txt_name: string;
      txt_value: string;
    }>;
  };
  ownership_verification?: {
    type: string;
    name: string;
    value: string;
  };
  ownership_verification_http?: {
    http_url: string;
    http_body: string;
  };
  created_at: string;
}

export interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
}

export type HostnameStatus = 'pending' | 'active' | 'failed' | 'deleted';

export interface HostnameStatusResult {
  status: HostnameStatus;
  sslStatus: 'pending' | 'active' | 'failed';
  hostnameId: string;
  hostname: string;
  dnsTarget: string;
  ownershipVerification?: {
    type: string;
    name: string;
    value: string;
  };
  errors?: string[];
}

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

/**
 * Create a new custom hostname in Cloudflare
 *
 * @param domain - The custom hostname to create (e.g., shop.example.com)
 * @param env - Environment with Cloudflare credentials
 * @returns Created hostname details or throws error
 */
export async function createCustomHostname(
  domain: string,
  env: CloudflareEnv
): Promise<HostnameStatusResult> {
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = env;

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    throw new Error(
      'Cloudflare credentials not configured. Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID.'
    );
  }

  const url = `${CLOUDFLARE_API_BASE}/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      hostname: domain,
      ssl: {
        method: 'http', // HTTP validation (auto-validates when CNAME is set)
        type: 'dv', // Domain Validation certificate
        settings: {
          min_tls_version: '1.2',
        },
      },
    }),
  });

  const data: CloudflareResponse<CustomHostname> = await response.json();

  if (!data.success) {
    const errorMessage = data.errors.map((e) => e.message).join(', ');
    console.error('[Cloudflare] Create hostname failed:', errorMessage);
    throw new Error(`Failed to create custom hostname: ${errorMessage}`);
  }

  const hostname = data.result;

  console.log(`[Cloudflare] Created custom hostname: ${hostname.hostname} (ID: ${hostname.id})`);

  return {
    status: mapHostnameStatus(hostname.status),
    sslStatus: mapSslStatus(hostname.ssl.status),
    hostnameId: hostname.id,
    hostname: hostname.hostname,
    dnsTarget: 'multi-store-saas.ozzyl.workers.dev', // CNAME target - your actual Workers project
    ownershipVerification: hostname.ownership_verification,
  };
}

/**
 * Get the current status of a custom hostname
 *
 * @param hostnameId - Cloudflare hostname ID
 * @param env - Environment with Cloudflare credentials
 * @returns Current hostname status
 */
export async function getHostnameStatus(
  hostnameId: string,
  env: CloudflareEnv
): Promise<HostnameStatusResult> {
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = env;

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    throw new Error('Cloudflare credentials not configured.');
  }

  const url = `${CLOUDFLARE_API_BASE}/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const data: CloudflareResponse<CustomHostname> = await response.json();

  if (!data.success) {
    const errorMessage = data.errors.map((e) => e.message).join(', ');
    console.error('[Cloudflare] Get hostname status failed:', errorMessage);
    throw new Error(`Failed to get hostname status: ${errorMessage}`);
  }

  const hostname = data.result;

  return {
    status: mapHostnameStatus(hostname.status),
    sslStatus: mapSslStatus(hostname.ssl.status),
    hostnameId: hostname.id,
    hostname: hostname.hostname,
    dnsTarget: 'multi-store-saas.ozzyl.workers.dev',
    ownershipVerification: hostname.ownership_verification,
  };
}

/**
 * Delete a custom hostname from Cloudflare
 *
 * @param hostnameId - Cloudflare hostname ID
 * @param env - Environment with Cloudflare credentials
 * @returns true if deleted successfully
 */
export async function deleteCustomHostname(
  hostnameId: string,
  env: CloudflareEnv
): Promise<boolean> {
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = env;

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    throw new Error('Cloudflare credentials not configured.');
  }

  const url = `${CLOUDFLARE_API_BASE}/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const data: CloudflareResponse<{ id: string }> = await response.json();

  if (!data.success) {
    const errorMessage = data.errors.map((e) => e.message).join(', ');
    console.error('[Cloudflare] Delete hostname failed:', errorMessage);
    throw new Error(`Failed to delete hostname: ${errorMessage}`);
  }

  console.log(`[Cloudflare] Deleted custom hostname: ${hostnameId}`);
  return true;
}

/**
 * Refresh/retry hostname validation
 * Useful when DNS has been updated and you want to trigger re-validation
 *
 * @param hostnameId - Cloudflare hostname ID
 * @param env - Environment with Cloudflare credentials
 */
export async function refreshHostnameValidation(
  hostnameId: string,
  env: CloudflareEnv
): Promise<HostnameStatusResult> {
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = env;

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    throw new Error('Cloudflare credentials not configured.');
  }

  // PATCH the hostname to trigger re-validation
  const url = `${CLOUDFLARE_API_BASE}/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames/${hostnameId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ssl: {
        method: 'http',
        type: 'dv',
      },
    }),
  });

  const data: CloudflareResponse<CustomHostname> = await response.json();

  if (!data.success) {
    const errorMessage = data.errors.map((e) => e.message).join(', ');
    console.error('[Cloudflare] Refresh validation failed:', errorMessage);
    throw new Error(`Failed to refresh validation: ${errorMessage}`);
  }

  const hostname = data.result;
  console.log(`[Cloudflare] Refreshed validation for: ${hostname.hostname}`);

  return {
    status: mapHostnameStatus(hostname.status),
    sslStatus: mapSslStatus(hostname.ssl.status),
    hostnameId: hostname.id,
    hostname: hostname.hostname,
    dnsTarget: 'multi-store-saas.ozzyl.workers.dev',
    ownershipVerification: hostname.ownership_verification,
  };
}

/**
 * Check if Cloudflare credentials are configured
 */
export function isCloudflareConfigured(env: CloudflareEnv): boolean {
  return Boolean(env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ZONE_ID);
}

// Helper functions to map Cloudflare statuses to our simplified statuses
function mapHostnameStatus(status: string): HostnameStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'pending':
    case 'pending_ssl':
    case 'pending_ssl_active':
      return 'pending';
    case 'deleted':
    case 'pending_deletion':
      return 'deleted';
    default:
      return 'pending';
  }
}

function mapSslStatus(status: string): 'pending' | 'active' | 'failed' {
  switch (status) {
    case 'active':
      return 'active';
    case 'pending_validation':
    case 'pending_issuance':
    case 'pending_deployment':
      return 'pending';
    case 'deleted':
    case 'validation_timed_out':
      return 'failed';
    default:
      return 'pending';
  }
}
