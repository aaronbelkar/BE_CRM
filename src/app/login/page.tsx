import { LoginForm } from '../../components/features/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#1a1a1b] text-white font-sans">
      <div className="w-full max-w-md bg-[#25292d] rounded-lg border border-zinc-800 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Sovereign CRM</h1>
          <p className="text-sm text-[#e5e7e9] mt-2 font-mono">operator_auth_gateway</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
