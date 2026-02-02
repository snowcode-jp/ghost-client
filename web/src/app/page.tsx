'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await api.getSetupStatus();
        if (status.needs_setup) {
          router.replace('/setup');
        } else {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Setup check failed:', error);
        router.replace('/login');
      }
    };

    checkSetup();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Ghost Security Monitor...</p>
      </div>
    </div>
  );
}
