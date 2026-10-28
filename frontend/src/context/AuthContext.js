'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PERSONAS = {
  USER: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Elena Rostova',
    email: 'user@aetheris.com',
    role: 'USER',
    title: 'Content Strategist',
    companyId: '11111111-1111-1111-1111-111111111111',
    companyName: 'Aetheris Dynamics'
  },
  MANAGER: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Marcus Vance',
    email: 'manager@aetheris.com',
    role: 'MANAGER',
    title: 'Brand Compliance Director',
    companyId: '11111111-1111-1111-1111-111111111111',
    companyName: 'Aetheris Dynamics'
  },
  ADMIN: {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Dr. Sarah Lin',
    email: 'admin@aetheris.com',
    role: 'ADMIN',
    title: 'VP Governance & Standards',
    companyId: '11111111-1111-1111-1111-111111111111',
    companyName: 'Aetheris Dynamics'
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState('USER');
  const [user, setUser] = useState(PERSONAS.USER);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('inkloom_active_role');
    if (saved && PERSONAS[saved]) {
      setCurrentRole(saved);
      setUser(PERSONAS[saved]);
    }
  }, []);

  const switchRole = (roleKey) => {
    if (PERSONAS[roleKey]) {
      setCurrentRole(roleKey);
      setUser(PERSONAS[roleKey]);
      localStorage.setItem('inkloom_active_role', roleKey);
    }
  };

  const logout = () => {
    switchRole('USER');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        personas: PERSONAS,
        switchRole,
        logout,
        mounted
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
