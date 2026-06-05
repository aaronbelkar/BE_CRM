'use client';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#1a1a1b] text-white font-sans">
      <div className="w-full max-w-md bg-[#25292d] rounded-lg border border-zinc-800 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Sovereign CRM</h1>
          <p className="text-sm text-[#e5e7e9] mt-2 font-mono">operator_auth_gateway</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-mono text-[#e5e7e9] uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              name="username"
              required
              className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono transition-colors"
              placeholder="operator"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#e5e7e9] uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-sm font-semibold rounded transition-colors mt-6 uppercase tracking-wider font-mono"
          >
            Authenticate
          </button>
        </form>
      </div>
    </main>
  );
}
