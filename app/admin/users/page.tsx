'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Search, Shield, Pencil, Ban, Check } from 'lucide-react';
import type { Profile, UserRole } from '@/lib/types';
import { formatDateShort, cn } from '@/lib/utils';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-gold/20 text-gold',
  editor: 'bg-blue-100 text-blue-700',
  author: 'bg-gray-100 text-gray-700',
};

export default function UsersPage() {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!hasRole('admin')) return;
    loadUsers();
  }, [hasRole]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load users');
    } else {
      setUsers((data || []) as Profile[]);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // Update profile (RLS allows admin to update)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (profileError) {
      toast.error('Failed to update role: ' + profileError.message);
      return;
    }

    // Update auth metadata via edge function would be needed for app_metadata
    // For now, update user_metadata which is visible to the client
    toast.success('Role updated. Note: app_metadata may require server-side update for full enforcement.');
    loadUsers();
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentActive })
      .eq('id', userId);
    if (error) {
      toast.error('Failed to update user');
    } else {
      toast.success(`User ${currentActive ? 'deactivated' : 'activated'}`);
      loadUsers();
    }
  };

  if (!hasRole('admin')) {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-sans">
          You need administrator access to manage users.
        </p>
      </div>
    );
  }

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground font-sans text-sm mt-1">
          {users.length} total users
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-sm text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold"
        />
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                Joined
              </th>
              <th className="text-right px-4 py-3 text-xs font-sans uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground font-sans text-sm">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground font-sans">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="font-serif text-sm font-bold text-gold">
                          {(user.full_name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-sans text-sm font-medium">
                          {user.full_name || 'Unnamed'}
                        </p>
                        {!user.is_active && (
                          <span className="text-xs text-destructive font-sans">Inactive</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm font-sans text-muted-foreground">{user.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className={cn(
                        'px-2.5 py-1 text-xs font-sans rounded-sm border-0 cursor-pointer',
                        ROLE_COLORS[user.role]
                      )}
                    >
                      <option value="author">Author</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm font-sans text-muted-foreground">
                      {formatDateShort(user.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className={cn(
                          'p-1.5 transition-colors',
                          user.is_active
                            ? 'text-muted-foreground hover:text-destructive'
                            : 'text-muted-foreground hover:text-green-600'
                        )}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
