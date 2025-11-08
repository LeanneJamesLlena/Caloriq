import { NavLink } from 'react-router-dom';
import s from './Footer.module.css';

// Bottom navigation for the app
export default function FooterNav() {

    return (
        <nav className={s.nav}>
        <NavLink to="/diary" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
            Diary
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
            History
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>
            Settings
        </NavLink>
        </nav>
    );
}
