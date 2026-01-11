# Walkthrough - Forgot Password System

I have successfully implemented a secure Forgot Password system. This allows users to request a password reset link via email and set a new password.

## Features Implemented

1.  **Database Schema**: Added `password_resets` table to store secure, hashed reset tokens with expiration times.
2.  **Email Service**: Integrated `Resend` to deliver password reset emails.
3.  **Backend Logic**: Secure token generation, validation, and password hasing in `auth.server.ts`.
4.  **Frontend Routes**:
    - `/auth/forgot-password`: Request a reset link.
    - `/auth/reset-password`: Set a new password (verified via token).
    - Updated Login page with "Forgot Password?" link.
5.  **Direct Links**:
    - [Login Page](http://localhost:3000/auth/login)
    - [Forgot Password Page](http://localhost:3000/auth/forgot-password)

## How to Verify

Since this feature relies on email delivery, here is how to test it:

### Prerequisites

- Ensure `RESEND_API_KEY` is set in `.dev.vars` or `.env`.
- If testing locally without a valid API key, the system will fallback to logging the reset link in the terminal.

### Steps

1.  **Request Reset**:

    - Go to `/auth/login` and click "Forgot Password?".
    - Enter your registered email address.
    - Click "Send Reset Link".

2.  **Get the Link**:

    - **Check your email**: If configured, you should receive an email from "Multi-Store SaaS".
    - **Check the logs**: If running locally or without an API key, check your terminal output for a log starting with `[DEV] Link:`.

3.  **Reset Password**:

    - Click the link or copy-paste it into your browser.
    - You should see the "Reset Password" form.
    - Enter a new password and confirm it.
    - Submit the form.

4.  **Login**:
    - You will be redirected to the login page.
    - Login with your **new** password.

## Manual Verification

> [!TIP] > **Testing Locally:**
> Watch the terminal where `npm run dev` is running. You will see:
>
> ```
> [DEV] Password Reset Token for user@example.com: ...
> [DEV] Link: http://localhost:3000/auth/reset-password?token=...
> ```
>
> Use this link to test the flow without sending real emails.
