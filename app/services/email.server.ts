import { Resend } from 'resend';
// Env is globally declared

/**
 * Send a password reset email to the user
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  env: Env
): Promise<{ success: boolean; error?: string }> {
  if (!env.RESEND_API_KEY) {
    console.warn('[email.server] RESEND_API_KEY is missing. Email not sent.');
    // For local dev without API key, we log the token
    if (env.ENVIRONMENT === 'development' || !env.ENVIRONMENT) {
      console.log('=================================================================');
      console.log(`[DEV] Password Reset Token for ${email}: ${token}`);
      console.log(`[DEV] Link: ${env.SAAS_DOMAIN}/auth/reset-password?token=${token}`);
      console.log('=================================================================');
      return { success: true };
    }
    return { success: false, error: 'Email service configuration missing.' };
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const resetLink = `${env.SAAS_DOMAIN}/auth/reset-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: 'Multi-Store SaaS <system@digitalcare.site>', // Update with your verified domain
      to: [email],
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset the password for your account.</p>
          <p>Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[email.server] Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('[email.server] Password reset email sent to:', email, 'ID:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[email.server] Unexpected error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email' 
    };
  }
}
