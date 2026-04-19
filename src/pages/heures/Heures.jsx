import { useState } from 'react';
import ListeHeures from './ListeHeures.jsx';
import ResumeHeures from './ResumeHeures.jsx';
import SaisieHeure from './SaisieHeure.jsx';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import Bouton from '../../components/ui/Bouton.jsx';
import { Plus, Clock, BarChart3, List } from 'lucide-react';

export default function Heures() {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [onglet, setOnglet] = useState('liste');
  const [recharger, setRecharger] = useState(0);

  const forcerRecharger = () => setRecharger((p) => p + 1);

  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Heures effectuées</h1>
        {(role === 'rh' || role === 'admin') && (
          <Bouton onClick={() => setOnglet('saisie')}>
            <Plus size={16} /> Saisir une séance
          </Bouton>
        )}
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setOnglet('liste')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${onglet === 'liste' ? 'tab-active' : 'tab-inactive border-transparent'}`}
          >
            <List size={16} /> Liste
          </button>
          <button
            onClick={() => setOnglet('resume')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${onglet === 'resume' ? 'tab-active' : 'tab-inactive border-transparent'}`}
          >
            <BarChart3 size={16} /> Résumé
          </button>
          {(role === 'rh' || role === 'admin') && (
            <button
              onClick={() => setOnglet('saisie')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${onglet === 'saisie' ? 'tab-active' : 'tab-inactive border-transparent'}`}
            >
              <Clock size={16} /> Saisie
            </button>
          )}
        </div>

        <div className="p-5">
          {onglet === 'liste' && <ListeHeures cle={recharger} />}
          {onglet === 'resume' && <ResumeHeures cle={recharger} />}
          {onglet === 'saisie' && (role === 'rh' || role === 'admin') && <SaisieHeure apresSauvegarde={forcerRecharger} />}
        </div>
      </div>
    </div>
  );
}