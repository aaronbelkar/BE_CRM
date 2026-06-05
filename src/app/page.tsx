import { cookies } from 'next/headers';
import DashboardPage from './dashboard/page';
import { LoginForm } from '../components/features/LoginForm';

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
    <main className="flex min-h-screen flex-col lg:flex-row bg-[#1a1a1b] text-white font-sans">
      {/* Left side: Greeting panel */}
      <section className="flex flex-col justify-center flex-1 p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-[#151516]">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded text-xs font-mono bg-[#25292d] text-[#e67e22] border border-[#e67e22]/20">
            SYS_GATEWAY // SECURE_ACCESS
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Sovereign CRM & Kanban Hub
          </h1>
          <p className="text-sm lg:text-base text-zinc-400 leading-relaxed">
            Welcome, operator. This is your high-density command center for tracking leads, managing critical tasks, and orchestrating strategic integrations with agentic assistants.
          </p>
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <span className="block text-xs font-mono text-[#e5e7e9] uppercase tracking-wider">Default Testing Credentials</span>
            <div className="bg-[#25292d] p-3 rounded border border-zinc-800 text-xs font-mono text-zinc-400">
              <p>Username: <span className="text-[#e67e22]">admin</span></p>
              <p>Password: <span className="text-[#e67e22]">!Qaz@Wsx</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Right side: Login gateway */}
      <section className="flex items-center justify-center flex-1 p-8 bg-[#1a1a1b]">
        <div className="w-full max-w-md bg-[#25292d] rounded-lg border border-zinc-800 p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Sovereign CRM</h2>
            <p className="text-sm text-[#e5e7e9] mt-2 font-mono">operator_auth_gateway</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
