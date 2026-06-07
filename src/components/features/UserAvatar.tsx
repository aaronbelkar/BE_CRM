'use client';

import { useState, useEffect } from 'react';

export const presetAvatars = {
  silhouette: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  orange: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><radialGradient id="og" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23f39c12"/><stop offset="100%" stop-color="%23d35400"/></radialGradient><circle cx="12" cy="12" r="10" fill="url(%23og)"/></svg>`,
  teal: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><radialGradient id="tg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%231abc9c"/><stop offset="100%" stop-color="%2316a085"/></radialGradient><circle cx="12" cy="12" r="10" fill="url(%23tg)"/></svg>`,
  purple: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><radialGradient id="pg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%239b59b6"/><stop offset="100%" stop-color="%238e44ad"/></radialGradient><circle cx="12" cy="12" r="10" fill="url(%23pg)"/></svg>`,
  emerald: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><radialGradient id="eg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%232ecc71"/><stop offset="100%" stop-color="%2327ae60"/></radialGradient><circle cx="12" cy="12" r="10" fill="url(%23eg)"/></svg>`
};

export function UserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const loadAvatar = () => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.avatar) {
            if (presetAvatars[parsed.avatar as keyof typeof presetAvatars]) {
              setAvatarUrl(presetAvatars[parsed.avatar as keyof typeof presetAvatars]);
            } else {
              setAvatarUrl(parsed.avatar); // custom URL
            }
            return;
          }
        } catch (e) {}
      }
    }
    setAvatarUrl(presetAvatars.silhouette);
  };

  useEffect(() => {
    loadAvatar();

    const handleUpdate = () => {
      loadAvatar();
    };

    window.addEventListener('user-profile-updated', handleUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleUpdate);
    };
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new Event('open-my-account-modal'));
  };

  return (
    <button
      onClick={handleClick}
      className="w-8 h-8 rounded-full border border-border-color bg-surface hover:border-[#e67e22] transition-colors duration-200 overflow-hidden flex items-center justify-center cursor-pointer p-0"
      title="My Account"
    >
      <img
        src={avatarUrl || presetAvatars.silhouette}
        alt="User Avatar"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = presetAvatars.silhouette;
        }}
      />
    </button>
  );
}
