import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../api/axios';
import { Icon } from '../components/Icon';
import { Spinner } from '../components/States';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Unable to sign in. Check your credentials.'));
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
          <h2>Where every team keeps its own world.</h2>
          <p>
            A multi-tenant workspace for projects and tasks. Your organization’s
            data stays yours — isolated, secure, and always in reach.
          </p>
        </div>
        <div className="auth-feats">
          <div className="auth-feat">
            <span className="tick">✓</span> Strict per-organization data isolation
          </div>
          <div className="auth-feat">
            <span className="tick">✓</span> Kanban boards for every project
          </div>
          <div className="auth-feat">
            <span className="tick">✓</span> Admin & member roles built in
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <form className="auth-form rise" onSubmit={onSubmit}>
          <span className="eyebrow">Welcome back</span>
          <h1>Sign in</h1>
          <p className="sub">Enter your details to access your workspace.</p>

          {error && (
            <div className="form-error">
              <Icon.Alert width={16} height={16} /> <span>{error}</span>
            </div>
          )}

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
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>
            {busy ? <Spinner /> : 'Sign in'}
          </button>

          <p className="auth-switch">
            New here? <Link to="/signup">Create a workspace</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
