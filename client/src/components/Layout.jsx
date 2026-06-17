import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from './Icon';

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

export default function Layout() {
  const { user, organization, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const orgName = organization?.name || 'Your workspace';

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
        <div className="sidebar-brand">
          <span className="auth-mark">
            <span /> <span />
          </span>
          WorkPilot
        </div>

        <nav className="nav">
          <span className="nav-label">Workspace</span>
          <NavLink to="/" end className="nav-link">
            <Icon.Grid /> Projects
          </NavLink>

          {isAdmin && (
            <>
              <span className="nav-label">Administration</span>
              <NavLink to="/team" className="nav-link">
                <Icon.Users /> Team
              </NavLink>
              <NavLink to="/settings" className="nav-link">
                <Icon.Settings /> Settings
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <span className="avatar">{initials(user?.name)}</span>
            <div className="meta">
              <div className="nm">{user?.name}</div>
              <div className="org">{orgName}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="main">
        <button
          className="btn btn-icon btn-subtle mobile-menu"
          style={{ position: 'fixed', top: 16, left: 16, zIndex: 70 }}
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <Icon.Menu />
        </button>
        <Outlet />
      </div>
    </div>
  );
}
