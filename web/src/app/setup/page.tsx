'use client';

/**
 * Initial Setup Page
 *
 * 初回インストール時に管理者アカウントを作成
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await api.getSetupStatus();
        if (!status.needs_setup) {
          router.replace('/login');
          return;
        }
      } catch (error) {
        console.error('Setup check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSetup();
  }, [router]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username || formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.initialSetup({
        username: formData.username,
        password: formData.password,
        email: formData.email || undefined,
      });

      setSuccess(true);
      setStep(3);

      // Redirect to login after success
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Ghost Security Monitor</h1>
          <p className="text-gray-400 mt-2">Initial Setup</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                  }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-700'}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-gray-800 border-gray-700">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-white">Welcome to Ghost</CardTitle>
                <CardDescription className="text-gray-400">
                  Let&apos;s set up your security monitoring platform. First, we need to create an administrator account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-300 text-sm">
                  <p>Ghost Security Monitor provides:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>Real-time threat detection and alerting</li>
                    <li>AI-powered anomaly detection (UEBA)</li>
                    <li>Automated incident response (SOAR)</li>
                    <li>Compliance management and reporting</li>
                    <li>Network and endpoint monitoring</li>
                  </ul>
                </div>
                <Button
                  className="w-full mt-6"
                  onClick={() => setStep(2)}
                >
                  Get Started
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-white">Create Administrator Account</CardTitle>
                <CardDescription className="text-gray-400">
                  This account will have full access to all features and settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={validationErrors.username}
                    placeholder="admin"
                    autoComplete="username"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    label="Email (optional)"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={validationErrors.email}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={validationErrors.password}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={validationErrors.confirmPassword}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className="bg-gray-700 border-gray-600 text-white"
                  />

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="flex-1"
                    >
                      Create Account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {step === 3 && success && (
            <>
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-white text-center">Setup Complete!</CardTitle>
                <CardDescription className="text-gray-400 text-center">
                  Your administrator account has been created successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-sm mb-4">
                  You will be redirected to the login page in a few seconds...
                </p>
                <Button onClick={() => router.push('/login')}>
                  Go to Login
                </Button>
              </CardContent>
            </>
          )}
        </Card>

        {/* Version info */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Ghost Security Monitor v1.0.0
        </p>
      </div>
    </div>
  );
}
