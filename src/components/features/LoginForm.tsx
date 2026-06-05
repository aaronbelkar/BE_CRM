'use client';

import { useActionState } from 'react';
import { loginAction } from '../../app/actions';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 bg-red-950/50 border border-red-500/30 rounded text-xs font-mono text-red-400">
          [ERROR]: {state.error}
        </div>
      )}
      
      <div>
        <label className="block text-xs font-mono text-[#e5e7e9] uppercase tracking-wider mb-2">Username</label>
        <input
          type="text"
          name="username"
          required
          disabled={isPending}
          className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono transition-colors disabled:opacity-50"
          placeholder="operator"
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-[#e5e7e9] uppercase tracking-wider mb-2">Password</label>
        <input
          type="password"
          name="password"
          required
          disabled={isPending}
          className="w-full px-3 py-2 bg-[#1a1a1b] border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#e67e22] font-mono transition-colors disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-sm font-semibold rounded transition-colors mt-6 uppercase tracking-wider font-mono disabled:opacity-50"
      >
        {isPending ? 'Authenticating...' : 'Authenticate'}
      </button>
    </form>
  );
}
