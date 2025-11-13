import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import s from './Header.module.css';


/*  App Header (top navigation + user info)*/
export default function Header() {

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  // Handle user logout
  const onLogout = async () => {
    // Clear auth state and redirect to login page
    await logout();
    navigate('/login', { replace: true });
  };
  // --- Render header layout ---
  return (
    <header className={s.header}>
      <div className={s.inner}>
        {/* App title / brand link */}
        <Link to="/diary" className={s.brandLink}>Calorie Tracker</Link>
         {/* If user is logged in, show avatar + logout button */}
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
