import { cookies } from 'next/headers';
import DashboardPage from './dashboard/page';
import { LoginForm } from '../components/features/LoginForm';
import { ThemeToggle } from '../components/features/ThemeToggle';

interface HomeProps {
  searchParams: Promise<{ board?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  const isLoggedIn = session && session.value === 'authenticated';

  if (isLoggedIn) {
    return <DashboardPage searchParams={searchParams} />;
  }

  return (
    <main className="relative flex min-h-screen flex-col lg:flex-row bg-background text-text-main font-sans transition-colors duration-200">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left side: Greeting panel */}
      <section className="flex flex-col justify-center flex-1 p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-border-color bg-surface/50 space-y-8">
        {/* Dynamic Logo */}
        <div className="relative w-48 h-16">
          <img
            src="/assets/site logo light theme.png"
            alt="Sovereign CRM Logo"
            className="h-full object-contain block dark:hidden"
          />
          <img
            src="/assets/site logo dark theme.png"
            alt="Sovereign CRM Logo"
            className="h-full object-contain hidden dark:block"
          />
        </div>

        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-surface text-[#e67e22] border border-[#e67e22]/20">
            SYS_GATEWAY // SECURE_ACCESS
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold tracking-tight text-text-main">
            Sovereign CRM & Kanban Hub
          </h1>
          <p className="text-sm lg:text-base text-text-muted leading-relaxed">
            Welcome, operator. This is your high-density command center for tracking leads, managing critical tasks, and orchestrating strategic integrations with agentic assistants.
          </p>
        </div>
      </section>

      {/* Right side: Login gateway */}
      <section className="flex items-center justify-center flex-1 p-8 bg-background">
        <div className="w-full max-w-md bg-surface rounded-3xl border border-border-color p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-serif font-bold tracking-tight text-text-main">Sovereign CRM</h2>
            <p className="text-sm text-text-muted mt-2 font-mono">operator_auth_gateway</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
