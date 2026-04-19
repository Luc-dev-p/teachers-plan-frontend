import { useState } from 'react';
import { Users, Settings, Calculator, Upload, FileDown } from 'lucide-react';
import Equivalences from './Equivalences.jsx';
import TauxHoraires from './TauxHoraires.jsx';
import GestionUtilisateurs from './GestionUtilisateurs.jsx';
import ImportDonnees from './ImportDonnees.jsx';

const onglets = [
  { id: 'equivalences', label: 'Équivalences', icone: Calculator },
  { id: 'taux', label: 'Taux horaires', icone: Settings },
  { id: 'utilisateurs', label: 'Utilisateurs', icone: Users },
  { id: 'import', label: 'Import données', icone: Upload },
];

export default function Parametres() {
  const [onglet, setOnglet] = useState('equivalences');

  const contenu = {
    equivalences: <Equivalences />,
    taux: <TauxHoraires />,
    utilisateurs: <GestionUtilisateurs />,
    import: <ImportDonnees />,
  };

  return (
    <div className="space-y-4">
      <h1 className="page-title">Paramètres</h1>

      <div className="card">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {onglets.map((o) => (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                onglet === o.id ? 'tab-active' : 'tab-inactive border-transparent'
              }`}
            >
              <o.icone size={16} /> {o.label}
            </button>
          ))}
        </div>
        <div className="p-5">{contenu[onglet]}</div>
      </div>
    </div>
  );
}