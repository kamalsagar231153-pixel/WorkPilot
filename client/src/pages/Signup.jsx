import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../api/axios';
import { Icon } from '../components/Icon';
import { Spinner } from '../components/States';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', orgName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Unable to create your workspace.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="auth-brand">
          <span className="auth-mark">
            <span />
            <span />
          </span>
          WorkPilot
        </div>
        <div className="auth-pitch">
          <h2>Start your team’s workspace in seconds.</h2>
          <p>
            Creating an account spins up a brand-new organization with you as its
            administrator. Invite your team and start shipping.
          </p>
        </div>
        <div className="auth-feats">
          <div className="auth-feat">
            <span className="tick">✓</span> You become the workspace admin
          </div>
          <div className="auth-feat">
            <span className="tick">✓</span> Add members and assign roles
          </div>
          <div className="auth-feat">
            <span className="tick">✓</span> Your data never mixes with others
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <form className="auth-form rise" onSubmit={onSubmit}>
          <span className="eyebrow">Get started</span>
          <h1>Create a workspace</h1>
          <p className="sub">A few details and you’re in.</p>

          {error && (
            <div className="form-error">
              <Icon.Alert width={16} height={16} /> <span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              className="input"
              placeholder="Alice Carter"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="orgName">Organization name</label>
            <input
              id="orgName"
              name="orgName"
              className="input"
              placeholder="Acme Corp"
              value={form.orgName}
              onChange={onChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@company.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? <Spinner /> : 'Create workspace'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
