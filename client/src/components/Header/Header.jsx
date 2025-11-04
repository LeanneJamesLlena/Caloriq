import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import s from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Link to="/diary" className={s.brandLink}>Calorie Tracker</Link>
        {user && (
          <div className={s.userWrap}>
            <div title={user.email} className={s.avatar}>
              {(user.email?.[0] || 'U').toUpperCase()}
            </div>
            <button onClick={onLogout} className="btn btn-outline">Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
