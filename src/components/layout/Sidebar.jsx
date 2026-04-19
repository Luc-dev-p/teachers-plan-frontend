import { NavLink, useLocation } from 'react-router-dom';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, Users, Building2, BookOpen, GraduationCap,
  DoorOpen, School, Calendar, Clock, BarChart3, Settings,
  LogOut, FileDown, ChefHat, X
} from 'lucide-react';
import { utiliserSidebar } from '../../context/SidebarContext.jsx';

const menuPrincipal = [
  { chemin: '/', label: 'Tableau de bord', icone: LayoutDashboard },
  { chemin: '/enseignants', label: 'Enseignants', icone: Users },
];

const menuOrganisation = [
  { chemin: '/departements', label: 'Départements', icone: Building2 },
  { chemin: '/filieres', label: 'Filières', icone: GraduationCap },
  { chemin: '/niveaux', label: 'Niveaux', icone: BookOpen },
  { chemin: '/classes', label: 'Classes', icone: School },
  { chemin: '/salles', label: 'Salles', icone: DoorOpen },
  { chemin: '/matieres', label: 'Matières', icone: ChefHat },
];

const menuGestion = [
  { chemin: '/seances', label: 'Séances de cours', icone: Calendar },
  { chemin: '/heures', label: 'Heures effectuées', icone: Clock },
  { chemin: '/emploi-du-temps', label: 'Emploi du temps', icone: BarChart3 },
];

const menuAdmin = [
  { chemin: '/parametres', label: 'Paramètres', icone: Settings },
  { chemin: '/exports', label: 'Exports', icone: FileDown },
];

export default function Sidebar() {
  const { utilisateur, deconnexion } = utiliserAuth();
  const { mobileOuvert, fermerMobile } = utiliserSidebar();
  const location = useLocation();
  const role = utilisateur?.role || 'enseignant';

  const Lien = ({ chemin, label, icone: Icon }) => (
    <NavLink
      to={chemin}
      end={chemin === '/'}
      onClick={fermerMobile}
      className={() =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          location.pathname === chemin
            ? 'bg-white/10 text-sky'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  const Section = ({ titre, items }) => (
    <div className="mb-4">
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {titre}
      </p>
      {items.map((item) => (
        <Lien key={item.chemin} {...item} />
      ))}
    </div>
  );

  const contenu = (
    <aside className="w-64 bg-midnight flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-midnight flex items-center justify-center">
            <Clock size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-display font-bold text-sm">Teacher's Plan</h1>
            <p className="text-slate-500 text-[10px]">Planifiez. Suivez. Payez.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {role !== 'enseignant' && <Section titre="Principal" items={menuPrincipal} />}
        {role !== 'enseignant' && <Section titre="Organisation" items={menuOrganisation} />}
        {role === 'enseignant' && (
          <Section titre="Principal" items={[menuPrincipal[0], menuGestion[1]]} />
        )}
        {role !== 'enseignant' && <Section titre="Gestion" items={menuGestion} />}
        {role === 'admin' && <Section titre="Administration" items={menuAdmin} />}
        {(role === 'rh' || role === 'admin') && (
          <Section titre="Rapports" items={[menuAdmin[1]]} />
        )}
      </nav>

      {/* Profil + Déconnexion */}
      <div className="p-3 border-t border-white/10">
        <NavLink
          to="/profil"
          onClick={fermerMobile}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all mb-1"
        >
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
            {utilisateur?.prenom?.[0]}
            {utilisateur?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
            <p className="text-slate-500 text-[10px] capitalize">{role}</p>
          </div>
        </NavLink>
        <button
          onClick={deconnexion}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">{contenu}</div>

      {/* Mobile overlay */}
      {mobileOuvert && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={fermerMobile} />
          <div className="relative z-10 w-64 animate-slide-in-left">{contenu}</div>
        </div>
      )}
    </>
  );
}