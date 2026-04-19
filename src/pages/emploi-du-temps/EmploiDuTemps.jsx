import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import Chargement from '../../components/ui/Chargement.jsx';
import Select from '../../components/ui/Select.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const CRENEAUX = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function EmploiDuTemps() {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [seances, setSeances] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filtreEnseignant, setFiltreEnseignant] = useState(role === 'enseignant' ? (utilisateur?.enseignant_id || '') : '');
  const [filtreClasse, setFiltreClasse] = useState('');
  const [semaine, setSemaine] = useState(getSemaineCourante());
  const [chargement, setChargement] = useState(true);

  function getSemaineCourante() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const lun = new Date(now);
    lun.setDate(now.getDate() + diff);
    return lun.toISOString().split('T')[0];
  }

  useEffect(() => {
    const fetch = async () => {
      setChargement(true);
      try {
        const [r1, r2, r3] = await Promise.all([api.get('/seances'), api.get('/enseignants'), api.get('/classes')]);
        setSeances(r1.data);
        setEnseignants(r2.data);
        setClasses(r3.data);
      } catch {} finally {
        setChargement(false);
      }
    };
    fetch();
  }, []);

  const changeSemaine = (delta) => {
    const d = new Date(semaine);
    d.setDate(d.getDate() + delta * 7);
    setSemaine(d.toISOString().split('T')[0]);
  };

  const lunDate = new Date(semaine);
  const getJourDate = (idx) => {
    const d = new Date(lunDate);
    d.setDate(lunDate.getDate() + idx);
    return d.toISOString().split('T')[0];
  };

  const filtered = seances.filter((s) => {
    const dateSeance = s.date_seance ? s.date_seance.split('T')[0] : '';
    const dateObj = new Date(dateSeance);
    const samDate = new Date(lunDate);
    samDate.setDate(lunDate.getDate() + 6);
    if (dateObj < lunDate || dateObj > samDate) return false;
    if (filtreEnseignant && s.enseignant_id !== filtreEnseignant) return false;
    if (filtreClasse && s.classe_id !== filtreClasse) return false;
    if (role === 'enseignant') return s.enseignant_id === utilisateur?.enseignant_id;
    return true;
  });

  const getSeancesForCreneau = (jourIdx, heure) => {
    const date = getJourDate(jourIdx);
    return filtered.filter((s) => {
      const sDate = s.date_seance?.split('T')[0];
      return sDate === date && s.heure_debut <= heure && s.heure_fin > heure;
    });
  };

  if (chargement) return <Chargement />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <Select label="Enseignant" valeur={filtreEnseignant} onChange={setFiltreEnseignant} options={enseignants.map((e) => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))} />
        <Select label="Classe" valeur={filtreClasse} onChange={setFiltreClasse} options={classes.map((c) => ({ value: c.id, label: `${c.code} - ${c.nom}` }))} />
        <div className="flex items-center gap-2">
          <button onClick={() => changeSemaine(-1)} className="p-2 rounded-lg hover:bg-slate-100"><ChevronLeft size={18} /></button>
          <span className="text-sm font-medium px-3">Semaine du {new Date(semaine).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          <button onClick={() => changeSemaine(1)} className="p-2 rounded-lg hover:bg-slate-100"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 bg-slate-50 border border-slate-200 w-20 text-slate-500">Heure</th>
                {JOURS.map((j, i) => (
                  <th key={j} className="p-2 bg-slate-50 border border-slate-200 min-w-[140px]">
                    <div className="font-semibold text-slate-700">{j}</div>
                    <div className="text-[10px] text-slate-400">{new Date(getJourDate(i)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRENEAUX.map((heure) => (
                <tr key={heure}>
                  <td className="p-2 bg-slate-50 border border-slate-200 text-slate-500 font-medium text-center">{heure}</td>
                  {JOURS.map((_, jIdx) => {
                    const cellSeances = getSeancesForCreneau(jIdx, heure);
                    return (
                      <td key={jIdx} className="p-1 border border-slate-100 align-top min-h-[40px]">
                        {cellSeances.map((s) => (
                          <div
                            key={s.id}
                            className={`p-1.5 rounded text-[10px] mb-1 ${
                              s.type_cours === 'CM' ? 'bg-blue-50 border border-blue-200 text-blue-700'
                              : s.type_cours === 'TD' ? 'bg-amber-50 border border-amber-200 text-amber-700'
                              : 'bg-green-50 border border-green-200 text-green-700'
                            }`}
                          >
                            <div className="font-semibold">{s.matiere?.nom}</div>
                            <div>{s.enseignant?.prenom} {s.enseignant?.nom}</div>
                            <div>{s.heure_debut}-{s.heure_fin}</div>
                            <div>{s.salle?.nom}</div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <EmptyState message="Aucune séance pour cette période" icone={BarChart3} />
      )}
    </div>
  );
}