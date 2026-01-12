
import { drizzle } from 'drizzle-orm/d1';
import { sql, desc, gte, eq, and } from 'drizzle-orm';
import { systemLogs } from '@db/schema';
import { createEmailService } from './email.server';

/**
 * Check for brute force attempts or suspicious login failures
 * Should be called after every failed login attempt
 */
export async function checkLoginAnomalies(
  db: D1Database, 
  env: Env,
  params: { ip?: string; email?: string }
) {
  // If no params (shouldn't happen), return
  if (!params.ip && !params.email) return;

  const drizzleDb = drizzle(db);
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  // 1. Count failures for this IP in last 10 minutes
  let ipFailures = 0;
  if (params.ip) {
    const contextLike = `%${params.ip}%`; // Basic match in context JSON
    const result = await drizzleDb.all<{ count: number }>(sql`
      SELECT count(*) as count 
      FROM system_logs 
      WHERE level = 'warn' 
      AND message LIKE 'Login failed%'
      AND context LIKE ${contextLike}
      AND created_at >= ${tenMinutesAgo.getTime()}
    `);
    ipFailures = Number((result[0] as unknown as { count: number }).count);
  }

  // 2. Count failures for this Email in last 10 minutes (optional, Brute Force on user)
  let emailFailures = 0;
  if (params.email) {
     const contextLike = `%${params.email}%`;
     const result = await drizzleDb.all<{ count: number }>(sql`
      SELECT count(*) as count 
      FROM system_logs 
      WHERE level = 'warn' 
      AND message LIKE 'Login failed%'
      AND context LIKE ${contextLike}
      AND created_at >= ${tenMinutesAgo.getTime()}
    `);
    emailFailures = Number((result[0] as unknown as { count: number }).count);
  }

  // 3. Trigger Alert if Threshold Exceeded
  // Threshold: > 5 failures in 10 mins
  if (ipFailures > 5 || emailFailures > 5) {
     console.warn(`[Security] Brute force detected! IP: ${params.ip} (${ipFailures}), Email: ${params.email} (${emailFailures})`);
     
     // Only send email if configured
     if (env.RESEND_API_KEY && env.SUPER_ADMIN_EMAIL) {
        await sendSecurityAlert(env, {
          type: 'brute_force',
          ip: params.ip,
          email: params.email,
          count: Math.max(ipFailures, emailFailures)
        });
     }
  }
}

async function sendSecurityAlert(env: Env, data: { type: string, ip?: string, email?: string, count: number }) {
  const emailService = createEmailService(env.RESEND_API_KEY);
  
  // NOTE: email.server.ts doesn't have a generic sendRawEmail, so we might need to add one or reuse an existing structure.
  // For now, I will use a direct call if Resend is available or mock it.
  // Actually, I can use the same pattern as email.server.ts (dynamic import).
  
  try {
     const { Resend } = await import('resend');
     const resend = new Resend(env.RESEND_API_KEY);
     
     const subject = `🚨 Security Alert: Suspicious Login Activity`;
     const html = `
       <h2>Security Alert System</h2>
       <p>Multiple failed login attempts detected.</p>
       <ul>
         <li><strong>Type:</strong> ${data.type}</li>
         <li><strong>IP Address:</strong> ${data.ip || 'Unknown'}</li>
         <li><strong>Target Email:</strong> ${data.email || 'Unknown'}</li>
         <li><strong>Failures (10m):</strong> ${data.count}</li>
       </ul>
       <p>Please check the System Health dashboard immediately.</p>
     `;

     await resend.emails.send({
        from: 'Ozzyl Security <security@ozzyl.com>',
        to: env.SUPER_ADMIN_EMAIL!,
        subject,
        html
     });
     
  } catch (err) {
    console.error('[Security] Failed to send alert email:', err);
  }
}
