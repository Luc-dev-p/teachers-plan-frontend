import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { utiliserSidebar } from '../../context/SidebarContext.jsx';

export default function Layout() {
  const { ouvert } = utiliserSidebar();

  return (
    <div className="min-h-screen bg-snow">
      <Sidebar />
      <div
        className="sidebar-transition min-h-screen flex flex-col"
        style={{
          marginLeft: ouvert ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)',
        }}
      >
        {/* Sur mobile, pas de marge */}
        <style>{`
          @media (max-width: 1023px) {
            div[style*="margin-left"] { margin-left: 0 !important; }
          }
        `}</style>
        <Header />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-3">
          <p className="text-xs text-slate-400 text-center">
            Teacher's Plan v2.0 — Université Nangui Abrogoua — © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}