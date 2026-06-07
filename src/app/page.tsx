import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  const isLoggedIn = session && session.value === 'authenticated';

  if (isLoggedIn) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
