'use client';

/**
 * User Management Page
 */

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, UserInfo } from '@/lib/api';
import { Plus, Trash2, Edit2, AlertCircle, Users, X, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

const AVAILABLE_ROLES = ['viewer', 'analyst', 'admin', 'super_admin'];

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);

  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    email: '',
    roles: ['viewer'],
  });
  const [editForm, setEditForm] = useState({
    email: '',
    roles: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.createUser({
        username: createForm.username,
        password: createForm.password,
        email: createForm.email || undefined,
        roles: createForm.roles,
      });
      setShowCreateModal(false);
      setCreateForm({ username: '', password: '', email: '', roles: ['viewer'] });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.updateUser(editingUser.id, {
        email: editForm.email || undefined,
        roles: editForm.roles,
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (id === currentUser?.id) {
      setError('You cannot delete your own account');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      await api.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const startEdit = (user: UserInfo) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || '',
      roles: user.roles,
    });
  };

  const toggleRole = (role: string, form: 'create' | 'edit') => {
    if (form === 'create') {
      if (createForm.roles.includes(role)) {
        setCreateForm({
          ...createForm,
          roles: createForm.roles.filter((r) => r !== role),
        });
      } else {
        setCreateForm({
          ...createForm,
          roles: [...createForm.roles, role],
        });
      }
    } else {
      if (editForm.roles.includes(role)) {
        setEditForm({
          ...editForm,
          roles: editForm.roles.filter((r) => r !== role),
        });
      } else {
        setEditForm({
          ...editForm,
          roles: [...editForm.roles, role],
        });
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>Add a new user account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="Username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="username"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
                <Input
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role, 'create')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          createForm.roles.includes(role)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    Create User
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <Card>
            <CardHeader>
              <CardTitle>Edit User: {editingUser.username}</CardTitle>
              <CardDescription>Update user information and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role, 'edit')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          editForm.roles.includes(role)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {user.username}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-gray-500">(you)</span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email || 'No email'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2 ml-10">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-0.5 text-xs rounded ${
                                role === 'super_admin'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                  : role === 'admin'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(user)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.username)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
