import { auth } from '@/lib/auth';

export default auth((req) => {
  // This function is called for every request
  // You can add custom logic here if needed
  // For now, just let NextAuth handle authentication
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login
     * - /signup
     * - /api/auth/* (NextAuth routes)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt, etc.
     */
    '/((?!login|signup|api/auth|_next/static|_next/image|favicon.ico|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.gif$).*)',
  ],
};
