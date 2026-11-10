import { NavLink, useNavigate } from 'react-router-dom';
import { CalendarCheck, LogOut } from './icons';
import { getUser, logout, initials } from './api';
import './attendease.css';

export default function Layout({ nav, title, subtitle, children }) {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="ae ae-layout">
      <aside className="ae-sidebar">
        <div className="ae-logo">
          <CalendarCheck size={34} />
          <span>AttendEase</span>
        </div>

        <nav className="ae-nav">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="ae-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="ae-main">
        <header className="ae-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="ae-avatar">{initials(user.name)[0]}</div>
        </header>
        {children}
      </main>
    </div>
  );
}
