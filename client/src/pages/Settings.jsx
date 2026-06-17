import { useEffect, useState } from 'react';
import { orgApi } from '../services/organizations';
import { getApiError } from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Loading, ErrorState, Spinner } from '../components/States';
import { Icon } from '../components/Icon';

export default function Settings() {
  const toast = useToast();
  const { setUser, user } = useAuth();

  const [org, setOrg] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const o = await orgApi.getMine();
      setOrg(o);
      setName(o.name);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!name.trim()) return setSaveErr('Organization name is required.');
    setBusy(true);
    setSaveErr('');
    try {
      const updated = await orgApi.updateMine({ name });
      setOrg(updated);
      // keep the sidebar org name in sync
      if (user) setUser({ ...user, organizationId: { ...(user.organizationId || {}), name: updated.name } });
      toast.success('Organization updated');
    } catch (err) {
      setSaveErr(getApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Administration</div>
          <h1>Settings</h1>
          <p className="sub">Manage your organization’s details.</p>
        </div>
      </div>

      <div className="content">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <div className="card rise" style={{ maxWidth: 520, padding: 28 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Organization</h3>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: 22 }}>
              This name is visible to everyone in your workspace.
            </p>

            {saveErr && (
              <div className="form-error">
                <Icon.Alert width={16} height={16} /> <span>{saveErr}</span>
              </div>
            )}

            <div className="field">
              <label>Organization name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex between" style={{ marginTop: 8 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-faint)' }}>
                Created {org && new Date(org.createdAt).toLocaleDateString()}
              </span>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={busy || name === org?.name}
              >
                {busy ? <Spinner /> : 'Save changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
