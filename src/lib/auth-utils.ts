import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }
  return session.user;
}
