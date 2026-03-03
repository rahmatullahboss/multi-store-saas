import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { requireTenant } from '~/lib/tenant-guard.server';
import { drizzle } from 'drizzle-orm/d1';
import { leadSubmissions } from '@db/schema';
import { eq, desc } from 'drizzle-orm';

function escapeCsv(value: string | null | undefined): string {
  const v = value ?? '';
  return `"${v.replace(/"/g, '""')}"`;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

  const db = drizzle(context.cloudflare.env.DB);
  const leads = await db
    .select()
    .from(leadSubmissions)
    .where(eq(leadSubmissions.storeId, storeId))
    .orderBy(desc(leadSubmissions.createdAt))
    .limit(5000);

  const header = [
    'id',
    'name',
    'email',
    'phone',
    'company',
    'status',
    'source',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'created_at',
  ];

  const rows = leads.map((lead) => [
    String(lead.id),
    escapeCsv(lead.name),
    escapeCsv(lead.email),
    escapeCsv(lead.phone),
    escapeCsv(lead.company),
    escapeCsv(lead.status),
    escapeCsv(lead.source),
    escapeCsv(lead.utmSource),
    escapeCsv(lead.utmMedium),
    escapeCsv(lead.utmCampaign),
    lead.createdAt ? new Date(lead.createdAt).toISOString() : '',
  ]);

  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-store-${storeId}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

