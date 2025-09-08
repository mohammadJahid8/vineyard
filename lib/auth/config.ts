import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyOTP } from '@/lib/auth/otp-service';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          return null;
        }

        try {
          await connectDB();
          
          // Verify OTP
          const isValidOTP = await verifyOTP(credentials.email, credentials.otp);
          if (!isValidOTP) {
            return null;
          }

          // Find or create user
          let user = await User.findByEmail(credentials.email);
          if (!user) {
            user = new User({
              email: credentials.email,
              role: 'user',
              isActive: true,
            });
            await user.save();
          }

          // Update last login
          await user.updateLastLogin();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            image: user.imageUrl,
          };
        } catch (error) {
          console.error('OTP authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          // Find or create user from Google profile
          let dbUser = await User.findByEmail(user.email!);
          if (!dbUser) {
            dbUser = new User({
              email: user.email!,
              firstName: profile?.given_name || '',
              lastName: profile?.family_name || '',
              imageUrl: user.image || '',
              role: 'user',
              isActive: true,
            });
            await dbUser.save();
          } else {
            // Update user info from Google
            dbUser.firstName = profile?.given_name || dbUser.firstName;
            dbUser.lastName = profile?.family_name || dbUser.lastName;
            dbUser.imageUrl = user.image || dbUser.imageUrl;
            await dbUser.updateLastLogin();
          }

          user.id = dbUser._id.toString();
          return true;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        
        // Get fresh user data from database
        try {
          await connectDB();
          const user = await User.findById(token.id);
          if (user) {
            session.user.role = user.role;
            session.user.isActive = user.isActive;
          }
        } catch (error) {
          console.error('Session callback error:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
