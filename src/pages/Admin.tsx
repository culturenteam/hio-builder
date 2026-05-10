import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePage } from '../hooks/usePage';
import {
  getAdminUsers,
  updateUserTier,
  updateUserModuleOverrides,
  updateUserLocked,
  type AdminUserRow,
} from '../services/supabase';
import { ALL_MODULES, FREE_MODULES } from '../types/user';
import type { ModuleType } from '../types/module';
import styles from './Admin.module.css';

export function Admin() {
  const { signOut } = useAuth();
  const { settings } = usePage();
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (settings && !settings.is_admin) navigate('/');
  }, [settings, navigate]);

  useEffect(() => {
    getAdminUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  async function handleTierChange(userId: string, tier: 'free' | 'paid') {
    setSaving(userId);
    await updateUserTier(userId, tier);
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, tier } : u));
    setSaving(null);
  }

  async function handleLockToggle(userId: string, current: boolean) {
    setSaving(userId);
    await updateUserLocked(userId, !current);
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_locked: !current } : u));
    setSaving(null);
  }

  async function handleOverrideToggle(userId: string, module: ModuleType, currentOverrides: ModuleType[] | null) {
    const base = currentOverrides ?? [];
    const next = base.includes(module)
      ? base.filter(m => m !== module)
      : [...base, module];
    const overrides = next.length ? next : null;
    setSaving(userId + module);
    await updateUserModuleOverrides(userId, overrides);
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, module_overrides: overrides } : u));
    setSaving(null);
  }

  if (loading) return <div className={styles.state}>Loading users…</div>;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.logo}>hio</span>
            <span className={styles.adminBadge}>admin</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.backBtn} onClick={() => navigate('/')}>← Builder</button>
            <button className={styles.signOut} onClick={signOut}>Sign out</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inner}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Users</h1>
            <span className={styles.count}>{users.length} total</span>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>User</span>
              <span>Slug</span>
              <span>Tier</span>
              <span>Modules</span>
              <span>Status</span>
            </div>

            {users.map(user => (
              <div key={user.user_id} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.userInfo}>
                    <span className={styles.email}>{user.email}</span>
                    <span className={styles.meta}>{user.section_count} modules · joined {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>

                  <span className={styles.slug}>/{user.slug}</span>

                  <div className={styles.tierToggle}>
                    <button
                      className={`${styles.tierBtn} ${user.tier === 'free' ? styles.tierActive : ''}`}
                      onClick={() => handleTierChange(user.user_id, 'free')}
                      disabled={saving === user.user_id}
                    >Free</button>
                    <button
                      className={`${styles.tierBtn} ${user.tier === 'paid' ? styles.tierPaid : ''}`}
                      onClick={() => handleTierChange(user.user_id, 'paid')}
                      disabled={saving === user.user_id}
                    >Paid</button>
                  </div>

                  <button
                    className={styles.overrideToggle}
                    onClick={() => setExpandedUser(expandedUser === user.user_id ? null : user.user_id)}
                    disabled={user.tier === 'paid'}
                    title={user.tier === 'paid' ? 'Paid users have all modules' : 'Set per-module overrides'}
                  >
                    {user.tier === 'paid'
                      ? 'All'
                      : user.module_overrides?.length
                        ? `+${user.module_overrides.length} extra`
                        : 'Free only'}
                    {user.tier !== 'paid' && <span className={styles.chevron}>{expandedUser === user.user_id ? '▴' : '▾'}</span>}
                  </button>

                  <button
                    className={`${styles.lockBtn} ${user.is_locked ? styles.locked : ''}`}
                    onClick={() => handleLockToggle(user.user_id, user.is_locked)}
                    disabled={saving === user.user_id}
                  >
                    {user.is_locked ? 'Locked' : 'Active'}
                  </button>
                </div>

                {expandedUser === user.user_id && user.tier === 'free' && (
                  <div className={styles.overridePanel}>
                    <p className={styles.overrideLabel}>Extra modules for this user:</p>
                    <div className={styles.moduleGrid}>
                      {ALL_MODULES.filter(m => !FREE_MODULES.includes(m)).map(module => {
                        const active = user.module_overrides?.includes(module) ?? false;
                        const key = user.user_id + module;
                        return (
                          <button
                            key={module}
                            className={`${styles.moduleChip} ${active ? styles.chipActive : ''}`}
                            onClick={() => handleOverrideToggle(user.user_id, module, user.module_overrides)}
                            disabled={saving === key}
                          >
                            {module}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
