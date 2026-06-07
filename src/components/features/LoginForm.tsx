'use client';

import { useState, useActionState } from 'react';
import { loginAction, registerAction } from '../../app/actions';

export function LoginForm() {
  const [isRegister, setIsRegister] = useState(false);
  
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, null);
  const [registerState, registerFormAction, registerPending] = useActionState(registerAction, null);

  const state = isRegister ? registerState : loginState;
  const isPending = isRegister ? registerPending : loginPending;

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex border-b border-border-color mb-6">
        <button
          type="button"
          onClick={() => setIsRegister(false)}
          className={`flex-1 pb-3 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            !isRegister
              ? 'border-b-2 border-[#e67e22] text-[#e67e22] font-semibold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setIsRegister(true)}
          className={`flex-1 pb-3 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            isRegister
              ? 'border-b-2 border-[#e67e22] text-[#e67e22] font-semibold'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          Register
        </button>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-950/50 border border-red-500/30 rounded text-xs font-mono text-red-400 mb-4">
          [ERROR]: {state.error}
        </div>
      )}

      {!isRegister ? (
        <form action={loginFormAction} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Username or Email</label>
            <input
              type="text"
              name="username"
              required
              disabled={isPending}
              className="w-full px-5 py-2.5 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono transition-colors disabled:opacity-50"
              placeholder="test@test.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              disabled={isPending}
              className="w-full px-5 py-2.5 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono transition-colors disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-[#e67e22] hover:bg-[#d35400] text-white text-sm font-semibold rounded-full transition-colors mt-6 uppercase tracking-wider font-mono disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
      ) : (
        <form action={registerFormAction} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Operator Name</label>
            <input
              type="text"
              name="name"
              required
              disabled={isPending}
              className="w-full px-5 py-2.5 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono transition-colors disabled:opacity-50"
              placeholder="Alex Mercer"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              disabled={isPending}
              className="w-full px-5 py-2.5 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono transition-colors disabled:opacity-50"
              placeholder="alex@sovereign.io"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              disabled={isPending}
              className="w-full px-5 py-2.5 bg-background border border-border-color rounded-full text-sm text-text-main focus:outline-none focus:border-[#e67e22] font-mono transition-colors disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-[#e67e22] hover:bg-[#d35400] text-white text-sm font-semibold rounded-full transition-colors mt-6 uppercase tracking-wider font-mono disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Registering...' : 'Register Operator'}
          </button>
        </form>
      )}
    </div>
  );
}
