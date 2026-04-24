import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { CalendarDays, Plus, Edit2, Trash2, Search, RefreshCw, X, CheckCircle, Clock } from 'lucide-react';

export default function Seances() {
  const [seances, setSeances] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modal, setModal] = useState(false);
  const [edition, setEdition] = useState(null);
  const [soumission, setSoumission] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [formulaire, setFormulaire] = useState({
    enseignant_id: '',
    matiere_id: '',
    classe_id: '',
    salle_id: '',
    annee_academique_id: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    type_seance: 'TD',
    nombre_heures: '2',
    remarques: '',
  });

  const charger = async () => {
    setChargement(true);
    try {
      const [resSeances, resEns, resMat, resClasses, resSalles, resAnnees] = await Promise.all([
        api.get('/seances'),
        api.get('/enseignants'),
        api.get('/matieres'),
        api.get('/classes'),
        api.get('/salles'),
        api.get('/parametres/annees-academiques'),
      ]);
      setSeances(resSeances.data);
      setEnseignants(resEns.data);
      setMatieres(resMat.data);
      setClasses(resClasses.data);
      setSalles(resSalles.data);
      setAnnees(resAnnees.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const ouvrirCreation = () => {
    setEdition(null);
    const anneeActive = annees.find(a => a.actif);
    setFormulaire({
      enseignant_id: '', matiere_id: '', classe_id: '', salle_id: '',
      annee_academique_id: anneeActive?.id || '',
      date: '', heure_debut: '08:00', heure_fin: '10:00',
      type_seance: 'TD', nombre_heures: '2', remarques: '',
    });
    setModal(true);
  };

  const ouvrirEdition = (s) => {
    setEdition(s.id);
    setFormulaire({
      enseignant_id: s.enseignant_id,
      matiere_id: s.matiere_id,
      classe_id: s.classe_id,
      salle_id: s.salle_id,
      annee_academique_id: s.annee_academique_id,
      date: s.date,
      heure_debut: s.heure_debut,
      heure_fin: s.heure_fin,
      type_seance: s.type_seance,
      nombre_heures: String(s.nombre_heures),
      remarques: s.remarques || '',
    });
    setModal(true);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setSoumission(true);
    try {
      const data = { ...formulaire, nombre_heures: parseFloat(formulaire.nombre_heures) };
      if (edition) {
        await api.put(`/seances/${edition}`, data);
      } else {
        await api.post('/seances', data);
      }
      setModal(false);
      charger();
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setSoumission(false);
    }
  };

  const valider = async (id) => {
    if (!confirm('Valider cette séance ? Les heures seront calculées automatiquement.')) return;
    try {
      await api.post(`/seances/${id}/valider`, {});
      charger();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette séance ?')) return;
    try {
      await api.delete(`/seances/${id}`);
      charger();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const seancesFiltrees = seances.filter((s) =>
    (!filtreStatut || s.statut === filtreStatut)
  );

  const statutCouleur = (statut) => {
    if (statut === 'validee') return 'bg-emerald-100 text-emerald-700';
    if (statut === 'planifiee') return 'bg-blue-100 text-blue-700';
    if (statut === 'annulee') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700';
  };

  const typeCouleur = (type) => {
    if (type === 'CM') return 'bg-purple-100 text-purple-700';
    if (type === 'TD') return 'bg-sky-100 text-sky-700';
    if (type === 'TP') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-midnight flex items-center gap-3">
            <CalendarDays size={28} /> Séances de cours
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {seances.length} séance{seances.length > 1 ? 's' : ''} enregistrée{seances.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={ouvrirCreation} className="btn-primary gap-2">
          <Plus size={16} /> Nouvelle séance
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {['', 'planifiee', 'validee'].map((s) => (
            <button
              key={s}
              onClick={() => setFiltreStatut(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtreStatut === s
                  ? 'bg-navy text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === '' ? 'Toutes' : s === 'planifiee' ? 'Planifiées' : 'Validées'}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button onClick={charger} disabled={chargement} className="btn-secondary">
            <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {chargement ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-navy" size={24} />
        </div>
      ) : seancesFiltrees.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">Aucune séance trouvée</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Horaire</th>
                <th>Enseignant</th>
                <th>Matière</th>
                <th>Classe</th>
                <th>Salle</th>
                <th>Type</th>
                <th>Heures</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {seancesFiltrees.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.date}</td>
                  <td className="text-slate-500">{s.heure_debut} - {s.heure_fin}</td>
                  <td>{s.enseignant_prenom} {s.enseignant_nom}</td>
                  <td>{s.matiere_nom || '-'}</td>
                  <td>{s.classe_nom || '-'}</td>
                  <td>{s.salle_nom || '-'}</td>
                  <td><span className={`badge ${typeCouleur(s.type_seance)}`}>{s.type_seance}</span></td>
                  <td className="font-semibold">{s.nombre_heures}h</td>
                  <td><span className={`badge ${statutCouleur(s.statut)}`}>{s.statut === 'validee' ? 'Validée' : s.statut === 'planifiee' ? 'Planifiée' : s.statut}</span></td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {s.statut === 'planifiee' && (
                        <button onClick={() => valider(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600" title="Valider">
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button onClick={() => ouvrirEdition(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => supprimer(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-midnight">
                {edition ? 'Modifier la séance' : 'Nouvelle séance'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={soumettre} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label-field">Enseignant</label>
                  <select value={formulaire.enseignant_id} onChange={(e) => setFormulaire({ ...formulaire, enseignant_id: e.target.value })} className="select-field" required>
                    <option value="">-- Sélectionner --</option>
                    {enseignants.map((e) => (
                      <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">Matière</label>
                  <select value={formulaire.matiere_id} onChange={(e) => setFormulaire({ ...formulaire, matiere_id: e.target.value })} className="select-field" required>
                    <option value="">-- Sélectionner --</option>
                    {matieres.map((m) => (
                      <option key={m.id} value={m.id}>{m.code} - {m.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">Classe</label>
                  <select value={formulaire.classe_id} onChange={(e) => setFormulaire({ ...formulaire, classe_id: e.target.value })} className="select-field" required>
                    <option value="">-- Sélectionner --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label-field">Date</label>
                  <input type="date" value={formulaire.date} onChange={(e) => setFormulaire({ ...formulaire, date: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="label-field">Heure début</label>
                  <input type="time" value={formulaire.heure_debut} onChange={(e) => setFormulaire({ ...formulaire, heure_debut: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="label-field">Heure fin</label>
                  <input type="time" value={formulaire.heure_fin} onChange={(e) => setFormulaire({ ...formulaire, heure_fin: e.target.value })} className="input-field" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="label-field">Type de séance</label>
                  <select value={formulaire.type_seance} onChange={(e) => setFormulaire({ ...formulaire, type_seance: e.target.value })} className="select-field">
                    <option value="CM">CM</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">Nombre d'heures</label>
                  <input type="number" step="0.25" min="0.5" value={formulaire.nombre_heures} onChange={(e) => setFormulaire({ ...formulaire, nombre_heures: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="label-field">Salle</label>
                  <select value={formulaire.salle_id} onChange={(e) => setFormulaire({ ...formulaire, salle_id: e.target.value })} className="select-field">
                    <option value="">-- Sélectionner --</option>
                    {salles.map((s) => (
                      <option key={s.id} value={s.id}>{s.nom} ({s.capacite} places)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">Année académique</label>
                  <select value={formulaire.annee_academique_id} onChange={(e) => setFormulaire({ ...formulaire, annee_academique_id: e.target.value })} className="select-field" required>
                    <option value="">-- Sélectionner --</option>
                    {annees.map((a) => (
                      <option key={a.id} value={a.id}>{a.libelle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label-field">Remarques</label>
                <textarea value={formulaire.remarques} onChange={(e) => setFormulaire({ ...formulaire, remarques: e.target.value })} className="input-field" rows={2} placeholder="Notes optionnelles..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={soumission} className="btn-primary flex-1">
                  {soumission ? 'Enregistrement...' : edition ? 'Modifier' : 'Créer la séance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}