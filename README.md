# SecureApp - Passwordless Authentication with Clerk

A modern Next.js application featuring passwordless authentication using Clerk, built with Tailwind CSS and shadcn/ui components.

## Features

- 🔐 **Passwordless Authentication** - Magic links, social logins, no passwords required
- 📱 **Mobile-First Design** - Responsive and optimized for all devices
- 🎨 **Modern UI** - Clean, professional design with dark mode support
- ⚡ **Fast & Secure** - Built with Next.js 15 and Clerk authentication
- 🛡️ **Protected Routes** - Automatic route protection with middleware
- 🎯 **User Dashboard** - Personalized dashboard after authentication

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Clerk account (free at [clerk.com](https://clerk.com))

### Installation

1. **Clone or download this project**

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Clerk:**
   - Go to [clerk.com](https://clerk.com) and create a free account
   - Create a new application
   - Copy your publishable key and secret key

4. **Configure environment variables:**
   - Rename `.env.local` to your actual environment file
   - Replace the placeholder values with your actual Clerk keys:
   \`\`\`env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   \`\`\`

5. **Configure Clerk Dashboard:**
   - In your Clerk dashboard, go to "User & Authentication" > "Email, Phone, Username"
   - Enable "Email address" and set it as required
   - Go to "User & Authentication" > "Social Connections" and enable desired providers (Google, GitHub, etc.)
   - In "Paths", set:
     - Sign-in URL: `/sign-in`
     - Sign-up URL: `/sign-up`
     - Home URL: `/dashboard`

6. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Authentication Methods

This app supports multiple passwordless authentication methods:

- **Magic Links** - Sign in via email link (no password needed)
- **Social Logins** - Google, GitHub, and other OAuth providers
- **Email Codes** - One-time codes sent to email
- **Phone Authentication** - SMS-based authentication (if enabled)

## Project Structure

\`\`\`
├── app/
│   ├── dashboard/          # Protected dashboard page
│   ├── sign-in/           # Clerk sign-in page
│   ├── sign-up/           # Clerk sign-up page
│   ├── layout.tsx         # Root layout with Clerk provider
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── dashboard.tsx      # Dashboard component
│   ├── landing-page.tsx   # Landing page component
│   └── mode-toggle.tsx    # Dark mode toggle
├── middleware.ts          # Route protection
└── .env.local            # Environment variables
\`\`\`

## Customization

### Styling
- The app uses Tailwind CSS for styling
- Dark mode is supported via next-themes
- Customize colors in `tailwind.config.ts`

### Authentication
- Modify Clerk appearance in sign-in/sign-up pages
- Add more social providers in Clerk dashboard
- Customize redirect URLs in environment variables

### Dashboard
- Add more features to the dashboard component
- Integrate with your backend APIs
- Add user profile management

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
- Ensure environment variables are set
- Build the project: `npm run build`
- Start the server: `npm start`

## Security Features

- ✅ No passwords to manage or store
- ✅ Automatic route protection
- ✅ Secure session management
- ✅ CSRF protection
- ✅ Rate limiting (via Clerk)
- ✅ Email verification
- ✅ Device management

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT License - feel free to use this project for personal or commercial purposes.
