# Migration to Tailwind v4.0 and Clerk Passwordless Auth

## Summary of Changes

### ✅ Tailwind CSS v4.0 Migration

- Upgraded `tailwindcss` to `^4.0.0-beta.6`
- Removed `autoprefixer` dependency (included in Tailwind v4)
- Updated `tailwind.config.ts` to use direct color values instead of CSS variables
- Removed dark mode configuration (`darkMode` setting)
- Updated PostCSS configuration

### ✅ Dark Mode Removal

- Removed `next-themes` dependency
- Deleted `components/theme-provider.tsx`
- Deleted `components/mode-toggle.tsx`
- Removed all `dark:` classes from components
- Updated layout to remove ThemeProvider wrapper
- Simplified CSS variables to light mode only

### ✅ Clerk Passwordless Authentication

- Clerk is already configured with `@clerk/nextjs`
- Sign-in and sign-up pages are properly set up
- Middleware is configured to protect `/dashboard` routes
- Updated auth page styling for light mode only

## Next Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file with your Clerk keys:

```env
# Clerk Keys - Get these from https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Configure Clerk Dashboard

In your Clerk Dashboard (https://dashboard.clerk.com/):

1. **Enable Passwordless Authentication:**

   - Go to User & Authentication → Email, Phone, Username
   - Enable "Email address" and set it as required
   - Disable "Password" requirement
   - Enable "Email verification code" for passwordless sign-in

2. **Configure Social Providers (Optional):**

   - Go to User & Authentication → Social Connections
   - Enable providers like Google, GitHub, etc.

3. **Set Redirect URLs:**
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

### 4. Test the Application

```bash
pnpm dev
```

Visit:

- `/` - Landing page
- `/sign-up` - Passwordless registration
- `/sign-in` - Passwordless sign-in
- `/dashboard` - Protected dashboard (requires auth)

## Features

### Passwordless Authentication Methods

- **Email Magic Links**: Users receive a link via email to sign in
- **Email Verification Codes**: Users receive a code via email
- **Social Login**: OAuth with Google, GitHub, etc. (if configured)

### Security Features

- Protected routes with Clerk middleware
- Automatic session management
- User profile management
- Secure authentication state

## File Changes Made

### Updated Files:

- `package.json` - Updated dependencies
- `tailwind.config.ts` - Migrated to v4.0 format
- `app/layout.tsx` - Removed theme provider
- `app/globals.css` - Removed dark mode variables
- `middleware.ts` - Clerk middleware (already configured)
- `postcss.config.mjs` - Simplified for Tailwind v4
- All component files - Removed dark mode classes

### Deleted Files:

- `components/theme-provider.tsx`
- `components/mode-toggle.tsx`

### New Files:

- `MIGRATION_NOTES.md` - This file

The application now uses only light mode and supports passwordless authentication through Clerk.
