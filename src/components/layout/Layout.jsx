import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-snow">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <footer className="h-10 border-t border-slate-200 bg-white flex items-center justify-center text-xs text-slate-400 shrink-0">
          Teacher's Plan &copy; {new Date().getFullYear()} — Planifiez. Suivez. Payez.
        </footer>
      </div>
    </div>
  );
}