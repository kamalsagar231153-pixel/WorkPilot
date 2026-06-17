import { useEffect, useState, useCallback } from 'react';
import { usersApi } from '../services/users';
import { getApiError } from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Loading, ErrorState, EmptyState, Spinner } from '../components/States';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Icon } from '../components/Icon';

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

export default function Team() {
  const toast = useToast();
  const { claims } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setUsers(await usersApi.list());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="crumb">Administration</div>
          <h1>Team</h1>
          <p className="sub">Manage who has access to your organization.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          <Icon.Plus width={16} height={16} /> Invite member
        </button>
      </div>

      <div className="content">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : users.length === 0 ? (
          <EmptyState title="No members yet" hint="Invite someone to your workspace." />
        ) : (
          <div className="table-wrap rise">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === claims?.userId;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="cell-user">
                          <span className="avatar">{initials(u.name)}</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {u.name} {isSelf && <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>(you)</span>}
                            </div>
                            <div className="em">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn btn-icon btn-subtle btn-sm"
                            title="Edit"
                            onClick={() => setEditing(u)}
                          >
                            <Icon.Edit width={14} height={14} />
                          </button>
                          <button
                            className="btn btn-icon btn-subtle btn-sm"
                            title="Remove"
                            disabled={isSelf}
                            style={isSelf ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                            onClick={() => !isSelf && setDeleting(u)}
                          >
                            <Icon.Trash width={14} height={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <UserModal
          user={editing._id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={(isNew) => {
            setEditing(null);
            toast.success(isNew ? 'Member added' : 'Member updated');
            load();
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Remove member?"
          message={`${deleting.name} will lose access to this workspace.`}
          confirmLabel="Remove"
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await usersApi.remove(deleting._id);
              toast.success('Member removed');
              setDeleting(null);
              load();
            } catch (err) {
              toast.error(getApiError(err));
              setDeleting(null);
            }
          }}
        />
      )}
    </>
  );
}

function UserModal({ user, onClose, onSaved }) {
  const isNew = !user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'member',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name.trim()) return setError('Name is required.');
    if (isNew && (!form.email.trim() || form.password.length < 6))
      return setError('A valid email and a 6+ character password are required.');
    setBusy(true);
    setError('');
    try {
      if (isNew) {
        await usersApi.create(form);
      } else {
        await usersApi.update(user._id, { name: form.name, role: form.role });
      }
      onSaved(isNew);
    } catch (err) {
      setError(getApiError(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isNew ? 'Invite member' : 'Edit member'}
      subtitle={isNew ? 'Create an account inside your organization.' : 'Update this member.'}
      onClose={onClose}
    >
      <div className="modal-body">
        {error && (
          <div className="form-error">
            <Icon.Alert width={16} height={16} /> <span>{error}</span>
          </div>
        )}
        <div className="field">
          <label>Name</label>
          <input name="name" className="input" value={form.name} onChange={onChange} autoFocus />
        </div>
        {isNew && (
          <>
            <div className="field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                className="input"
                value={form.email}
                onChange={onChange}
                placeholder="member@company.com"
              />
            </div>
            <div className="field">
              <label>Temporary password</label>
              <input
                name="password"
                type="password"
                className="input"
                value={form.password}
                onChange={onChange}
                placeholder="At least 6 characters"
              />
            </div>
          </>
        )}
        <div className="field">
          <label>Role</label>
          <select name="role" className="select" value={form.role} onChange={onChange}>
            <option value="member">Member — manage tasks</option>
            <option value="admin">Admin — manage org & users</option>
          </select>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>
          {busy ? <Spinner /> : isNew ? 'Add member' : 'Save changes'}
        </button>
      </div>
    </Modal>
  );
}
