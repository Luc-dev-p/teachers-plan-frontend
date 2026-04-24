import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Users, CalendarDays, Clock, TrendingUp, RefreshCw } from 'lucide-react';

export default function TableauDeBord() {
  const [stats, setStats] = useState({ enseignants: 0, seances: 0, heures: 0 });
  const [recents, setRecents] = useState([]);
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    setChargement(true);
    try {
      const [resStats, resRecents] = await Promise.all([
        api.get('/dashboard/statistiques'),
        api.get('/dashboard/recents'),
      ]);
      setStats(resStats.data);
      setRecents(resRecents.data);
    } catch (err) {
      console.error('Erreur dashboard:', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const cartes = [
    { label: 'Enseignants', valeur: stats.enseignants, icon: Users, couleur: 'from-blue-500 to-blue-600', fond: 'bg-blue-50' },
    { label: 'Séances', valeur: stats.seances, icon: CalendarDays, couleur: 'from-emerald-500 to-emerald-600', fond: 'bg-emerald-50' },
    { label: 'Heures éq. TD', valeur: stats.heures, icon: Clock, couleur: 'from-amber-500 to-amber-600', fond: 'bg-amber-50' },
    { label: 'Activité récente', valeur: recents.length, icon: TrendingUp, couleur: 'from-purple-500 to-purple-600', fond: 'bg-purple-50' },
  ];

  const statutCouleur = (statut) => {
    if (statut === 'validee') return 'bg-emerald-100 text-emerald-700';
    if (statut === 'planifiee') return 'bg-blue-100 text-blue-700';
    if (statut === 'annulee') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-midnight">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de l'activité</p>
        </div>
        <button onClick={charger} disabled={chargement} className="btn-secondary gap-2">
          <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cartes.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-5 group hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{c.label}</p>
                  <p className="text-3xl font-bold text-midnight mt-1">
                    {c.label === 'Heures éq. TD' ? c.valeur.toFixed(1) : c.valeur}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.couleur} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Séances récentes */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-midnight">Séances récentes</h2>
        </div>
        <div className="table-container rounded-none border-0">
          {recents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CalendarDays className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500">Aucune séance enregistrée</p>
              <p className="text-sm text-slate-400 mt-1">Les séances apparaîtront ici une fois ajoutées</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Enseignant</th>
                  <th>Matière</th>
                  <th>Type</th>
                  <th>Heures</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recents.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.date}</td>
                    <td>{s.enseignant_prenom} {s.enseignant_nom}</td>
                    <td>{s.matiere_nom || '-'}</td>
                    <td>
                      <span className="badge bg-slate-100 text-slate-700">{s.type_seance}</span>
                    </td>
                    <td className="font-semibold">{s.nombre_heures}h</td>
                    <td>
                      <span className={`badge ${statutCouleur(s.statut)}`}>
                        {s.statut === 'validee' ? 'Validée' : s.statut === 'planifiee' ? 'Planifiée' : s.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}