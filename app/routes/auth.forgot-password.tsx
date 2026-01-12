import type { ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { requestPasswordReset } from '~/services/auth.server';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Forgot Password - Ozzyl SaaS' }];
};

type ActionData = 
  | { success: true; error?: undefined }
  | { success: false; error: string }; 

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email || !email.includes('@')) {
    return json<ActionData>({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
  }

  // Rate limiting check could go here

  const result = await requestPasswordReset(email, context.cloudflare.env.DB, context.cloudflare.env);

  if (!result.success) {
    return json<ActionData>({ success: false, error: result.error || 'Failed to send reset link.' }, { status: 500 });
  }

  return json<ActionData>({ success: true });
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t('forgotPassword') || 'Forgot Password'}</h1>
            <p className="text-gray-600 mt-2 text-sm">
              {t('enterEmailForReset') || 'Enter your email address and we will send you a link to reset your password.'}
            </p>
          </div>

          {actionData?.success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-gray-600 mb-8">
                If an account exists for that email, we have sent password reset instructions.
              </p>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition w-full"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('backToLogin') || 'Back to Login'}
              </Link>
            </div>
          ) : (
            <Form method="post" className="space-y-6">
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                  {actionData.error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : (t('sendResetLink') || 'Send Reset Link')}
              </button>

              <div className="text-center mt-4">
                <Link to="/auth/login" className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-2">
                  <ArrowLeft className="w-3 h-3" />
                  {t('backToLogin') || 'Back to Login'}
                </Link>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
