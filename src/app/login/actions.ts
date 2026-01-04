'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  username: string,
  password: string
) {
  try {
    await signIn('credentials', {
      username,
      password,
      redirectTo: '/',
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'ユーザー名またはパスワードが正しくありません' };
        default:
          return { error: 'ログインに失敗しました' };
      }
    }
    throw error;
  }
}
