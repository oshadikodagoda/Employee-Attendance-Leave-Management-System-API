import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Mail, Lock, Eye, EyeOff } from './icons';
import { api } from './api';
import './attendease.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      const isManager = ['manager', 'admin'].includes(String(user?.role).toLowerCase());
      navigate(isManager ? '/manager' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ae ae-login">
      <div className="ae-login-card">
        <section className="ae-login-brand">
          <CalendarCheck size={72} color="var(--ae-primary)" strokeWidth={1.8} />
          <h1>AttendEase</h1>
          <p>Track. Manage. Grow.</p>
        </section>

        <form className="ae-login-form" onSubmit={handleSubmit}>
          <h2>Welcome Back!</h2>
          <p className="ae-sub">Sign in to continue</p>

          <label className="ae-field">
            <Mail />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="ae-field">
            <Lock />
            <input
              type={show ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <Eye /> : <EyeOff />}
            </button>
          </label>

          {error && <p className="ae-error">{error}</p>}

          <button className="ae-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
