import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from '../../components/features/LoginForm';
import { ThemeToggle } from '../../components/features/ThemeToggle';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  const isLoggedIn = !!(session && session.value);

  if (isLoggedIn) {
    redirect('/dashboard');
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-background text-text-main font-sans transition-colors duration-200">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-surface rounded-3xl border border-border-color p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4">
            <img
              src="/assets/BE logo light theme.png"
              alt="BE Logo"
              className="h-full w-full object-contain block dark:hidden"
            />
            <img
              src="/assets/BE logo dark theme.png"
              alt="BE Logo"
              className="h-full w-full object-contain hidden dark:block"
            />
          </div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-text-main mb-1">BE CRM</h2>
          <p className="text-xs text-text-muted font-mono">operator_auth_gateway</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
