import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import s from './Login.module.css';

export default function Login() {

  const navigate = useNavigate();
    // get login, loading and error action from zustand store
  const { login, loading, error } = useAuthStore();
  // form input values
  const [form, setForm] = useState({ email: '', password: '' });
  // toggle password visibility
  const [showPass, setShowPass] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
   // Handle form submit -> call login() then redirect on success
  const onSubmit = async (e) => {
    e.preventDefault();
    const { ok } = await login(form);
    if (ok) navigate('/diary');
  };
  // Disable button when loading or fields are empty
  const disabled = loading || !form.email || !form.password;

  return (
    <div className="auth-screen">
      <div className="card auth-card">
        <div className="brand">
          <div className="brand-badge">CT</div>
          <span className="text-base" style={{ fontWeight: 600 }}>Calorie Tracker</span>
        </div>

        <h1 className={s.title}>Welcome back</h1>
        <p className={s.subtitle}>Log in to continue tracking.</p>

        {error && <div className="alert" style={{ marginTop: '12px' }}>{error}</div>}

        <form onSubmit={onSubmit} className={s.form}>
          <div className={s.row}>
            <label className={s.label}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={s.row}>
            <label className={`${s.label} ${s.passLabel}`}>
              <span>Password</span>
              <button type="button" onClick={() => setShowPass(v => !v)} className={s.toggle}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </label>
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div className={s.actions}>
            <button type="submit" className="btn btn-primary" disabled={disabled}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="text-muted" style={{ marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>
          No account?{' '}
          <Link to="/register" className={s.link}>Create one</Link>
        </p>
      </div>

      <p className="page-foot">© {new Date().getFullYear()} Calorie Tracker - Built by Leanne James Llena</p>
    </div>
  );
}
