'use client';

/**
 * Login Page
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading, error, clearError, enableDemoMode } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const status = await api.getSetupStatus();
        if (status.needs_setup) {
          router.replace('/setup');
          return;
        }
      } catch (error) {
        console.error('Setup check error:', error);
        // APIエラーの場合もセットアップチェックを終了
      } finally {
        setCheckingSetup(false);
      }
    };

    init();
  }, [router]);

  useEffect(() => {
    if (!checkingSetup && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [checkingSetup, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.username || !formData.password) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.username, formData.password);
      router.push('/dashboard');
    } catch {
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoMode = () => {
    enableDemoMode();
    router.push('/dashboard');
  };

  if (checkingSetup || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Ghost Security Monitor</h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
                autoComplete="username"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="bg-gray-700 border-gray-600 text-white"
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
              >
                Sign In
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-800 px-2 text-gray-400">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleDemoMode}
                className="w-full"
              >
                Enter Demo Mode
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Version info */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Ghost Security Monitor v1.0.0
        </p>
      </div>
    </div>
  );
}
