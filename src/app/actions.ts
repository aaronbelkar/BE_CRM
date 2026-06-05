'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type ActionState = {
  success: boolean;
  error?: string;
};

export async function loginAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username === 'admin' && password === '!Qaz@Wsx') {
    const cookieStore = await cookies();
    cookieStore.set('session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });
    redirect('/dashboard');
  }

  return { success: false, error: 'Invalid username or password' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}
