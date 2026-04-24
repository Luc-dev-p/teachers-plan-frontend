import { utiliserSidebar } from '../../context/SidebarContext.jsx';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import { Menu, Bell, LogOut, UserCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { mobileOuvert, ouvrirMobile } = utiliserSidebar();
  const { utilisateur, deconnexion } = utiliserAuth();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Gauche */}
        <div className="flex items-center gap-3">
          <button
            onClick={ouvrirMobile}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700">
              Bienvenue, <span className="text-navy font-semibold">{utilisateur?.prenom}</span>
            </p>
            <p className="text-xs text-slate-400">
              {utilisateur?.role === 'admin' ? 'Administrateur' : utilisateur?.role === 'rh' ? 'Ressources Humaines' : 'Enseignant'}
            </p>
          </div>
        </div>

        {/* Droite */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Menu profil */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu(!menu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-sky flex items-center justify-center text-white text-sm font-bold">
                {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {utilisateur?.prenom} {utilisateur?.nom}
              </span>
            </button>

            {menu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-midnight">{utilisateur?.prenom} {utilisateur?.nom}</p>
                  <p className="text-xs text-slate-400">{utilisateur?.email}</p>
                </div>
                <a href="/profil" onClick={() => setMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <UserCircle size={16} /> Mon profil
                </a>
                <button
                  onClick={() => { deconnexion(); setMenu(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}