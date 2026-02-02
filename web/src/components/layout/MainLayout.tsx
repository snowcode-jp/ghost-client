'use client';

/**
 * Main Layout Component
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Check setup status first
        const status = await api.getSetupStatus();
        if (status.needs_setup) {
          router.replace('/setup');
          return;
        }

        // Check authentication
        await checkAuth();
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setCheckingSetup(false);
      }
    };

    init();
  }, [checkAuth, router]);

  useEffect(() => {
    if (!checkingSetup && !isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [checkingSetup, isLoading, isAuthenticated, router]);

  if (checkingSetup || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="ml-64 p-6">
        {children}
      </main>
    </div>
  );
};
