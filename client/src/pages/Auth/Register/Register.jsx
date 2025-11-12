import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import s from './Register.module.css';

export default function Register() {
  
  const navigate = useNavigate();
    // get register, loading and error action from zustand store
  const { register, loading, error } = useAuthStore();
  // form input state
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  // toggle for password visibility
  const [showPass, setShowPass] = useState(false);
  // Handle input changes
  const onChange = (e) => {
    const { name, value } = e.target;
    // Keep what the user types, but trim email on the fly for convenience
    if (name === 'email') {
      setForm((f) => ({ ...f, [name]: value.trim() }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // validation logics
  const email = form.email.trim();
  const password = form.password;
  const passwordTrimmed = password.trim();
  const confirm = form.confirm;

  const emailValid = /\S+@\S+\.\S+/.test(email);
  // min length 6 (after trim)
  const passwordValid = passwordTrimmed.length >= 6; 
  const confirmValid = confirm === password && passwordValid;

  const disabled = loading || !emailValid || !passwordValid || !confirmValid;
   // Handle registration form submit
  const onSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;

    // Send trimmed email and trimmed password to backend
    const { ok } = await register({ email, password: passwordTrimmed });
    if (ok) navigate('/diary');
  };

  return (
    <div className="auth-screen">
      <div className="card auth-card">
        <div className="brand">
          <div className="brand-badge">CT</div>
          <span style={{ fontWeight: 600 }}>Calorie Tracker</span>
        </div>

        <h1 className={s.title}>Create your account</h1>
        <p className={s.subtitle}>Start tracking your calories in minutes.</p>

        {error && <div className="alert" style={{ marginTop: '12px' }}>{error}</div>}

        <form onSubmit={onSubmit} className={s.form} noValidate>
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
            {!emailValid && form.email !== '' && (
              <p className="text-danger" style={{ fontSize: '12px' }}>Enter a valid email.</p>
            )}
          </div>

          <div className={s.row}>
            <label className={`${s.label} ${s.passLabel}`}>
              <span>Password</span>
              <button type="button" onClick={() => setShowPass((v) => !v)} className={s.toggle}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </label>
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              className="input"
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
            {/* Inline help: show once user starts typing */}
            {form.password !== '' && !passwordValid && (
              <p className="text-danger" style={{ fontSize: '12px' }}>
                Password must be at least 6 characters (spaces at the ends don’t count).
              </p>
            )}
          </div>

          <div className={s.row}>
            <label className={s.label}>Confirm password</label>
            <input
              name="confirm"
              type={showPass ? 'text' : 'password'}
              value={form.confirm}
              onChange={onChange}
              autoComplete="new-password"
              className="input"
              placeholder="Re-enter password"
              required
            />
            {form.confirm !== '' && !confirmValid && (
              <p className="text-danger" style={{ fontSize: '12px' }}>Passwords don’t match.</p>
            )}
          </div>

          <div className={s.actions}>
            <button type="submit" className="btn btn-primary" disabled={disabled}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="text-muted" style={{ marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" className={s.link}>Sign in</Link>
        </p>
      </div>

      <p className="page-foot">© {new Date().getFullYear()} Calorie Tracker - Built by Leanne James Llena</p>
    </div>
  );
}
