import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const DISPOSABLE_DOMAINS = [
  'yopmail.com', 'mailinator.com', 'guerrillamail.com', '10minutemail.com',
  'temp-mail.org', 'tempmail.com', 'throwawaymail.com'
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        const domain = user.email.split('@')[1];
        if (DISPOSABLE_DOMAINS.includes(domain)) {
          return false; // Reject disposable emails
        }
      }
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      
      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
});
