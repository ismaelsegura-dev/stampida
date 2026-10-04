import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase();

        // 1. Admins (cuentas sin comercio, acceso al panel general)
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (admin) {
          const isValid = await bcrypt.compare(credentials.password, admin.password);
          if (!isValid) return null;
          return { id: admin.id, email: admin.email, nombre: 'Admin', role: 'admin' };
        }

        // 2. Comercios
        const merchant = await prisma.merchant.findUnique({ where: { email } });
        if (!merchant) return null;

        const isValid = await bcrypt.compare(credentials.password, merchant.password);
        if (!isValid) return null;

        if (!merchant.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        return {
          id: merchant.id,
          email: merchant.email,
          nombre: merchant.nombre,
          role: 'merchant',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
};
