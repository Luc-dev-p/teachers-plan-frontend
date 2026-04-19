import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import CarteStat from '../../components/ui/CarteStat.jsx';
import Chargement from '../../components/ui/Chargement.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import { Users, BookOpen, Calendar, Clock, TrendingUp, DollarSign, BarChart3, AlertTriangle } from 'lucide-react';

export default function TableauDeBord() {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/statistiques');
        setStats(res.data);
      } catch (err) {
        setErreur(err.response?.data?.message || 'Erreur de chargement');
      } finally {
        setChargement(false);
      }
    };
    fetchStats();
  }, []);

  if (chargement) return <Chargement message="Chargement du tableau de bord..." />;
  if (erreur) return <Alerte type="erreur" message={erreur} />;

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="card p-6 bg-gradient-midnight text-white">
        <h1 className="text-2xl font-bold font-display">
          Bonjour, {utilisateur?.prenom} 👋
        </h1>
        <p className="text-slate-200 mt-1">
          {role === 'enseignant'
            ? 'Voici un résumé de vos heures d\'enseignement.'
            : role === 'rh'
            ? 'Voici un aperçu de la gestion des heures.'
            : 'Bienvenue dans votre tableau de bord administratif.'}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CarteStat titre="Enseignants" valeur={stats?.total_enseignants || 0} icone={Users} couleur="navy" />
        <CarteStat titre="Matières" valeur={stats?.total_matieres || 0} icone={BookOpen} couleur="sky" />
        <CarteStat titre="Séances" valeur={stats?.total_seances || 0} icone={Calendar} couleur="green" />
        <CarteStat titre="Heures total" valeur={`${stats?.total_heures || 0}h`} icone={Clock} couleur="purple" />
      </div>

      {/* Ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CarteStat titre="Heures équiv. TD" valeur={`${stats?.total_heures_equiv_td || 0}h`} icone={TrendingUp} couleur="yellow" />
        <CarteStat titre="Montant total" valeur={`${new Intl.NumberFormat('fr-FR').format(stats?.total_montant || 0)} FCFA`} icone={DollarSign} couleur="green" />
        <CarteStat titre="Séances à valider" valeur={stats?.seances_en_attente || 0} icone={AlertTriangle} couleur="red" />
      </div>

      {/* Dernières séances */}
      <div className="card">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-midnight font-display flex items-center gap-2">
            <BarChart3 size={18} /> Dernières séances enregistrées
          </h3>
        </div>
        <div className="table-container border-0 rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matière</th>
                <th>Enseignant</th>
                <th>Type</th>
                <th>Durée</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.dernieres_seances || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Aucune séance enregistrée
                  </td>
                </tr>
              ) : (
                stats.dernieres_seances.map((s, i) => (
                  <tr key={i}>
                    <td>{new Date(s.date_seance).toLocaleDateString('fr-FR')}</td>
                    <td className="font-medium">{s.matiere_nom || s.matiere}</td>
                    <td>{s.enseignant_nom || s.enseignant}</td>
                    <td>
                      <span className="badge-info">{s.type_cours}</span>
                    </td>
                    <td>{s.duree_heures}h</td>
                    <td>
                      <span className={`badge ${s.statut === 'validee' ? 'badge-success' : s.statut === 'planifiee' ? 'badge-warning' : 'badge-default'}`}>
                        {s.statut === 'validee' ? 'Validée' : s.statut === 'planifiee' ? 'Planifiée' : s.statut}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Répartition par type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold text-midnight font-display mb-4">Répartition par type de cours</h3>
          <div className="space-y-3">
            {[
              { type: 'CM', label: 'Cours Magistraux', couleur: 'bg-navy' },
              { type: 'TD', label: 'Travaux Dirigés', couleur: 'bg-sky' },
              { type: 'TP', label: 'Travaux Pratiques', couleur: 'bg-green-500' },
            ].map((item) => {
              const total = stats?.repartition?.reduce((a, b) => a + (b.count || 0), 0) || 1;
              const count = stats?.repartition?.find((r) => r.type === item.type)?.count || 0;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.couleur} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-midnight font-display mb-4">Top enseignants</h3>
          <div className="space-y-3">
            {(stats?.top_enseignants || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Aucune donnée</p>
            ) : (
              stats.top_enseignants.map((ens, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy text-xs font-bold">
                    {ens.nom?.[0]}{ens.prenom?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ens.prenom} {ens.nom}</p>
                    <p className="text-xs text-slate-500">{ens.heures}h équiv. TD</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}