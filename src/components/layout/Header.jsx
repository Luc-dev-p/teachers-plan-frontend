import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { utiliserSidebar } from '../../context/SidebarContext.jsx';
import { utiliserAuth } from '../../context/AuthContext.jsx';

const titres = {
  '/': 'Tableau de bord',
  '/enseignants': 'Enseignants',
  '/departements': 'Départements',
  '/filieres': 'Filières',
  '/niveaux': 'Niveaux',
  '/classes': 'Classes',
  '/salles': 'Salles',
  '/matieres': 'Matières',
  '/seances': 'Séances de cours',
  '/heures': 'Heures effectuées',
  '/emploi-du-temps': 'Emploi du temps',
  '/parametres': 'Paramètres',
  '/profil': 'Mon profil',
  '/exports': 'Exports',
};

export default function Header() {
  const location = useLocation();
  const { toggleMobile } = utiliserSidebar();
  const { utilisateur } = utiliserAuth();
  const titre = titres[location.pathname] || "Teacher's Plan";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
        <h2 className="font-display font-bold text-lg text-midnight">{titre}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:block relative">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-64 h-9 pl-9 pr-4 rounded-lg bg-slate-100 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-midnight flex items-center justify-center text-white text-xs font-bold">
            {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}