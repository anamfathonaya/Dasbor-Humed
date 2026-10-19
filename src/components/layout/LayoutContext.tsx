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

export interface TeamMember {
  id: string;
  name: string;
  nickname: string;
  roleTitle: string;
  systemRole: UserRole;
  initials: string;
  avatarBg: string;
  skills: string[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'iskandar',
    name: 'Iskandar',
    nickname: 'Pak Iskandar',
    roleTitle: 'Humas & Ketua Bidang',
    systemRole: 'head',
    initials: 'IS',
    avatarBg: '#0284c7',
    skills: ['Kelembagaan & Pers', 'Rapat BPH', 'Strategic Planning', 'Leadership']
  },
  {
    id: 'anam',
    name: 'Anam',
    nickname: 'Anam',
    roleTitle: 'Creative Director & IT Support',
    systemRole: 'admin',
    initials: 'AN',
    avatarBg: '#7c3aed',
    skills: ['Konsep Kreatif', 'Sistem & Dasbor', 'Meta Ads & Pixel', 'Wordpress/Elementor']
  },
  {
    id: 'dimas',
    name: 'Dimas',
    nickname: 'Dimas',
    roleTitle: 'Content Creator / Scriptwriter',
    systemRole: 'staff',
    initials: 'DM',
    avatarBg: '#059669',
    skills: ['Riset & Naskah', 'Script Big Idea', 'Copywriting Carousel', 'V-Art']
  },
  {
    id: 'hilmiya',
    name: 'Hilmiya',
    nickname: 'Hilmiya',
    roleTitle: 'Graphic Designer',
    systemRole: 'staff',
    initials: 'HL',
    avatarBg: '#db2777',
    skills: ['Visual Statis', 'Desain Carousel', 'Merchandise & Tools', 'Plakat']
  },
  {
    id: 'jundi',
    name: 'Jundi',
    nickname: 'Jundi',
    roleTitle: 'Videografer & Editor',
    systemRole: 'staff',
    initials: 'JD',
    avatarBg: '#ea580c',
    skills: ['Produksi Video', 'Reels/Shorts/TOG', 'Operator Zoom/Livestream', 'Shooting']
  },
  {
    id: 'rijal',
    name: 'Rijal',
    nickname: 'Rijal',
    roleTitle: 'Social Media Specialist & Admin',
    systemRole: 'staff',
    initials: 'RJ',
    avatarBg: '#4f46e5',
    skills: ['Publishing Multi-Kanal', 'Moderasi Komunitas', 'Operator Zoom', 'Log Restriksi']
  }
];

export const ROLE_LABELS: Record<UserRole, string> = {
  head: 'Humas & Ketua Bidang (Iskandar)',
  admin: 'Creative Director & IT (Anam)',
  staff: 'Tim Pelaksana (Dimas/Hilmiya/Jundi/Rijal)',
  reviewer: 'Reviewer / BPH Lembaga'
};

export const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  head: {
    name: 'Iskandar',
    initials: 'IS',
    avatarUrl: null,
    role: 'head',
    roleLabel: 'Humas & Ketua Bidang'
  },
  admin: {
    name: 'Anam',
    initials: 'AN',
    avatarUrl: null,
    role: 'admin',
    roleLabel: 'Creative Director'
  },
  staff: {
    name: 'Dimas',
    initials: 'DM',
    avatarUrl: null,
    role: 'staff',
    roleLabel: 'Content Creator'
  },
  reviewer: {
    name: 'BPH Komnas Palestina',
    initials: 'BP',
    avatarUrl: null,
    role: 'reviewer',
    roleLabel: 'Reviewer Lembaga'
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('head');

  useEffect(() => {
    try {
      // 1. Baca tema (default ke dark sesuai desain Humas-Media Dashboard)
      const savedTheme = localStorage.getItem('humas-theme') as 'light' | 'dark' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
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
