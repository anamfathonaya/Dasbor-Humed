'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'head' | 'admin' | 'staff' | 'reviewer';

export interface UserProfile {
  name: string;
  initials: string;
  avatarUrl: string | null;
  role: UserRole;
  roleLabel: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  head: 'Kepala Humas',
  admin: 'Admin Teknis',
  staff: 'Staf Konten',
  reviewer: 'Reviewer / Mitra'
};

export const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  head: {
    name: 'Rani Maulida',
    initials: 'RM',
    avatarUrl: null,
    role: 'head',
    roleLabel: 'Kepala Humas'
  },
  admin: {
    name: 'Budi Santoso',
    initials: 'BS',
    avatarUrl: null,
    role: 'admin',
    roleLabel: 'Admin Teknis'
  },
  staff: {
    name: 'Dewi Lestari',
    initials: 'DL',
    avatarUrl: null,
    role: 'staff',
    roleLabel: 'Staf Konten'
  },
  reviewer: {
    name: 'Ahmad Fauzi',
    initials: 'AF',
    avatarUrl: null,
    role: 'reviewer',
    roleLabel: 'Reviewer / Mitra'
  }
};

interface LayoutContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isNavOpen: boolean;
  toggleNav: () => void;
  closeNav: () => void;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('head');

  useEffect(() => {
    try {
      // 1. Baca tema
      const savedTheme = localStorage.getItem('humas-theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }

      // 2. Baca peran dari cookie atau localStorage
      const match = document.cookie.match(/(?:^|;\s*)user_role=([^;]*)/);
      const cookieRole = match ? (decodeURIComponent(match[1]) as UserRole) : null;
      const savedRole = (localStorage.getItem('user_role') as UserRole | null) || cookieRole;
      if (savedRole && (savedRole === 'head' || savedRole === 'admin' || savedRole === 'staff' || savedRole === 'reviewer')) {
        setCurrentRole(savedRole);
      }
    } catch {}

    // 3. Listener untuk event peran eksternal
    const handleRoleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ role: UserRole }>;
      if (customEvent.detail?.role) {
        setCurrentRole(customEvent.detail.role);
      }
    };

    window.addEventListener('roleChanged', handleRoleChanged);
    return () => {
      window.removeEventListener('roleChanged', handleRoleChanged);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('humas-theme', next);
      } catch {}
      return next;
    });
  }, []);

  const toggleNav = useCallback(() => {
    setIsNavOpen((prev) => !prev);
  }, []);

  const closeNav = useCallback(() => {
    setIsNavOpen(false);
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    try {
      localStorage.setItem('user_role', role);
      document.cookie = `user_role=${role}; path=/; max-age=2592000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent('roleChanged', { detail: { role } }));
    } catch {}
  }, []);

  const hasAccess = useCallback(
    (allowedRoles: UserRole[]) => {
      return allowedRoles.includes(currentRole);
    },
    [currentRole]
  );

  const currentUser = DEFAULT_USERS[currentRole] || DEFAULT_USERS.head;

  return (
    <LayoutContext.Provider
      value={{
        theme,
        toggleTheme,
        isNavOpen,
        toggleNav,
        closeNav,
        currentRole,
        setRole,
        currentUser,
        hasAccess
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
