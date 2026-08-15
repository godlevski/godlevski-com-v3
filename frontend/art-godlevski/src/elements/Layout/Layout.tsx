import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NAV_TABS, AppRoute, getAppRoute } from '../../routes';
import DustCanvas from '../DustCanvas/DustCanvas';

function NavItems({ onSelect }: { onSelect?: () => void }) {
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  function go(route: AppRoute) {
    navigate(getAppRoute(route));
    onSelect?.();
  }

  return (
    <>
      {NAV_TABS.map(({ route, label }) => (
        <button
          key={route}
          className={`nav-tab${pathname === getAppRoute(route) ? ' nav-tab--active' : ''}`}
          onClick={() => go(route)}
        >
          {label}
        </button>
      ))}
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <DustCanvas bgColor="#010d15" />
      <header className="site-header">
        <div className="site-brand">
          <span className="site-sub">Intraverses</span>
          <span className="site-motto">ongoing inquiry into human verses</span>
          <span className="site-title">a project by Dmitriy Godlevski</span>
        </div>

        <nav className="site-nav">
          <NavItems />
        </nav>
      </header>

      <div className={`menu-overlay${menuOpen ? ' menu-overlay--open' : ''}`}>
        <NavItems onSelect={() => setMenuOpen(false)} />
      </div>

      <button className="burger-btn" onClick={() => setMenuOpen(o => !o)}>
        {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
      </button>

      {children}
    </>
  );
}
