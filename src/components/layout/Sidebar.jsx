import { NavLink, useLocation } from 'react-router-dom';
import { utiliserSidebar } from '../../context/SidebarContext.jsx';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, Users, Building2, BookOpen, GraduationCap,
  CalendarDays, Clock, DollarSign, FileDown, Settings, UserCircle,
  ChevronLeft, ChevronRight, X, Layers
} from 'lucide-react';

const menuItems = [
  { chemin: '/', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['admin', 'rh', 'enseignant'] },
  { chemin: '/enseignants', label: 'Enseignants', icon: Users, roles: ['admin', 'rh'] },
  { chemin: '/departements', label: 'Départements', icon: Building2, roles: ['admin', 'rh'] },
  { chemin: '/filieres', label: 'Filières', icon: Layers, roles: ['admin', 'rh'] },
  { chemin: '/niveaux', label: 'Niveaux', icon: GraduationCap, roles: ['admin', 'rh'] },
  { chemin: '/classes', label: 'Classes', icon: BookOpen, roles: ['admin', 'rh'] },
  { chemin: '/salles', label: 'Salles', icon: Building2, roles: ['admin', 'rh'] },
  { chemin: '/matieres', label: 'Matières', icon: BookOpen, roles: ['admin', 'rh'] },
  { chemin: '/seances', label: 'Séances', icon: CalendarDays, roles: ['admin', 'rh', 'enseignant'] },
  { chemin: '/heures', label: 'Heures effectuées', icon: Clock, roles: ['admin', 'rh', 'enseignant'] },
  { chemin: '/emploi-du-temps', label: 'Emploi du temps', icon: CalendarDays, roles: ['admin', 'rh', 'enseignant'] },
  { chemin: '/exports', label: 'Exports', icon: FileDown, roles: ['admin', 'rh'] },
  { chemin: '/parametres', label: 'Paramètres', icon: Settings, roles: ['admin'] },
  { chemin: '/profil', label: 'Mon profil', icon: UserCircle, roles: ['admin', 'rh', 'enseignant'] },
];

export default function Sidebar() {
  const { ouvert, basculer, mobileOuvert, fermerMobile } = utiliserSidebar();
  const { utilisateur } = utiliserAuth();
  const location = useLocation();

  const itemsFiltres = menuItems.filter(
    (item) => utilisateur && item.roles.includes(utilisateur.role)
  );

  const lienClass = (actif) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      actif
        ? 'bg-white/15 text-white shadow-sm'
        : 'text-slate-400 hover:text-white hover:bg-white/10'
    }`;

  const contenuSidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky to-blue-500 flex items-center justify-center flex-shrink-0">
          <Clock size={20} className="text-white" />
        </div>
        {ouvert && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white whitespace-nowrap">Teacher's Plan</h1>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">Gestion des heures</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {itemsFiltres.map((item) => {
          const Icon = item.icon;
          const actif = item.chemin === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.chemin);

          return (
            <NavLink
              key={item.chemin}
              to={item.chemin}
              onClick={fermerMobile}
              className={lienClass(actif)}
              title={!ouvert ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {ouvert && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bouton replier (desktop) */}
      <div className="hidden lg:flex items-center justify-between px-3 py-3 border-t border-white/10">
        {ouvert && (
          <span className="text-xs text-slate-500 px-3">Replier</span>
        )}
        <button
          onClick={basculer}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-auto"
        >
          {ouvert ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Info utilisateur */}
      {ouvert && utilisateur && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-sky flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {utilisateur.prenom?.[0]}{utilisateur.nom?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{utilisateur.prenom} {utilisateur.nom}</p>
              <p className="text-[10px] text-slate-400 uppercase">{utilisateur.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay mobile */}
      {mobileOuvert && (
        <div
          className="sidebar-overlay fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={fermerMobile}
        />
      )}

      {/* Sidebar desktop */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-full bg-gradient-to-b from-midnight to-slate-900 z-40 sidebar-transition shadow-xl ${
          ouvert ? 'w-[272px]' : 'w-[76px]'
        }`}
      >
        {contenuSidebar}
      </aside>

      {/* Sidebar mobile */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-[280px] bg-gradient-to-b from-midnight to-slate-900 z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileOuvert ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Bouton fermer mobile */}
        <button
          onClick={fermerMobile}
          className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
        >
          <X size={20} />
        </button>
        {contenuSidebar}
      </aside>
    </>
  );
}