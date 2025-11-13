import { NavLink } from 'react-router-dom';
import s from './Footer.module.css';

// Bottom navigation for the app
export default function FooterNav() {

    return (
        <nav className={s.nav}>
        {/* --- Link to Diary page --- */}
        <NavLink to="/diary" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
            Diary
        </NavLink>
        {/* --- Link to Weekly Progress page --- */}
        <NavLink to="/history" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
            Weekly Progress
        </NavLink>
        {/* --- Link to Settings page --- */}
        <NavLink to="/settings" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
            Settings
        </NavLink>
        </nav>
    );
}
