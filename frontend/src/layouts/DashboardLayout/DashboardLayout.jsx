import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import s from './DashboardLayout.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Overview', exact: true },
  { to: '/dashboard/heatmap', icon: '🗺️', label: 'Heat Map' },
  { to: '/dashboard/simulation', icon: '🧪', label: 'Simulation Lab' },
  { to: '/dashboard/assistant', icon: '🤖', label: 'AI Assistant' },
  { to: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
];

const PAGE_TITLES = {
  '/dashboard': 'Overview',
  '/dashboard/heatmap': 'Heat Map',
  '/dashboard/simulation': 'Simulation Lab',
  '/dashboard/assistant': 'AI Assistant',
  '/dashboard/settings': 'Settings',
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('gaia_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('gaia_token');
    localStorage.removeItem('gaia_user');
    navigate('/login');
  };

  const currentPage = PAGE_TITLES[location.pathname] || 'Dashboard';
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={s.layout}>
      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sidebarHeader}>
          <div className={s.sidebarLogo}>G</div>
          <span className={s.sidebarName}>GAIA</span>
          <span className={s.sidebarVersion}>v1.0</span>
        </div>

        <nav className={s.sidebarNav}>
          <div className={s.sidebarLabel}>Platform</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `${s.navItem} ${isActive ? s.navItemActive : ''}`
              }
            >
              <span className={s.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={s.sidebarFooter}>
          <div className={s.userCard} onClick={() => navigate('/dashboard/settings')}>
            <div className={s.userAvatar}>{initials}</div>
            <div>
              <div className={s.userName}>{user.name || 'User'}</div>
              <div className={s.userRole}>{(user.role || 'planner').replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={s.main}>
        <header className={s.topbar}>
          <div className={s.breadcrumb}>
            <span>Dashboard</span>
            <span>/</span>
            <span className={s.breadcrumbCurrent}>{currentPage}</span>
          </div>
          <div className={s.topbarActions}>
            <button className={s.topbarBtn} title="Notifications">🔔</button>
            <button className={s.logoutBtn} onClick={handleLogout}>Sign Out</button>
          </div>
        </header>

        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
