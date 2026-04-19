import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Seances() {
  const { axios } = useAuth();
  const [seances, setSeances] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [salles, setSalles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    date_seance: '', heure_debut: '08:00', heure_fin: '09:30', duree_heures: '1.5',
    type_cours: 'CM', salle_id: '', classe_id: '', matiere_id: '', enseignant_id: '', annee_academique: '2024-2025'
  });

  const fetchData = async () => {
    try {
      const [resSeances, resEns, resSalles, resClasses, resMatieres] = await Promise.all([
        axios.get('/api/seances'),
        axios.get('/api/enseignants'),
        axios.get('/api/enseignants/salles'),
        axios.get('/api/enseignants/classes'),
        axios.get('/api/enseignants/matieres')
      ]);
      setSeances(resSeances.data);
      setEnseignants(resEns.data);
      setSalles(resSalles.data);
      setClasses(resClasses.data);
      setMatieres(resMatieres.data);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, duree_heures: parseFloat(form.duree_heures) || 1.5 };
      if (editing) {
        await axios.put(`/api/seances/${editing.id}`, payload);
        toast.success('Séance modifiée');
      } else {
        await axios.post('/api/seances', payload);
        toast.success('Séance créée');
      }
      resetAndClose();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({
      date_seance: s.date_seance?.split('T')[0] || '',
      heure_debut: s.heure_debut,
      heure_fin: s.heure_fin,
      duree_heures: s.duree_heures?.toString() || '1.5',
      type_cours: s.type_cours,
      salle_id: s.salle_id,
      classe_id: s.classe_id,
      matiere_id: s.matiere_id,
      enseignant_id: s.enseignant_id,
      annee_academique: s.annee_academique || '2024-2025'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette séance ?')) return;
    try {
      await axios.delete(`/api/seances/${id}`);
      toast.success('Séance supprimée');
      fetchData();
    } catch (err) {
      toast.error('Impossible de supprimer');
    }
  };

  const handleValider = async (id) => {
    if (!confirm('Valider cette séance ? Les heures effectuées seront calculées automatiquement.')) return;
    try {
      await axios.post(`/api/seances/${id}/valider`);
      toast.success('Séance validée avec succès ! Heures effectuées calculées.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const resetAndClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ date_seance: '', heure_debut: '08:00', heure_fin: '09:30', duree_heures: '1.5', type_cours: 'CM', salle_id: '', classe_id: '', matiere_id: '', enseignant_id: '', annee_academique: '2024-2025' });
  };

  const getEnsNom = (id) => { const e = enseignants.find(x => x.id === id); return e ? `${e.prenom} ${e.nom}` : '—'; };
  const getSalleNom = (id) => { const s = salles.find(x => x.id === id); return s ? s.nom : '—'; };
  const getClasseNom = (id) => { const c = classes.find(x => x.id === id); return c ? c.nom : '—'; };
  const getMatiereNom = (id) => { const m = matieres.find(x => x.id === id); return m ? m.nom : '—'; };

  const statutBadge = (statut) => {
    const map = {
      planifiee: 'bg-yellow-100 text-yellow-700',
      validee: 'bg-green-100 text-green-700',
      annulee: 'bg-red-100 text-red-700',
    };
    const labels = { planifiee: 'Planifiée', validee: 'Validée', annulee: 'Annulée' };
    return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[statut] || 'bg-gray-100 text-gray-700'}`}>{labels[statut] || statut}</span>;
  };

  const typeBadge = (type) => {
    const colors = { CM: 'bg-blue-100 text-blue-700', TD: 'bg-green-100 text-green-700', TP: 'bg-orange-100 text-orange-700' };
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>{type}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2B46]">Séances de cours</h1>
          <p className="text-gray-500 mt-1">Planification et suivi des séances</p>
        </div>
        <button onClick={() => { resetAndClose(); setShowModal(true); }} className="bg-[#1E6091] hover:bg-[#164a73] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nouvelle séance
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E6091]" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Horaire</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Enseignant</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Matière</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Classe</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Salle</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Durée</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {seances.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-12 text-gray-400">Aucune séance trouvée</td></tr>
                ) : (
                  seances.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm">{new Date(s.date_seance).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.heure_debut} - {s.heure_fin}</td>
                      <td className="px-4 py-3">{typeBadge(s.type_cours)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#0F2B46]">{getEnsNom(s.enseignant_id)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getMatiereNom(s.matiere_id)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getClasseNom(s.classe_id)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getSalleNom(s.salle_id)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.duree_heures}h</td>
                      <td className="px-4 py-3">{statutBadge(s.statut)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {s.statut === 'planifiee' && (
                            <button onClick={() => handleValider(s.id)} className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg transition-colors" title="Valider">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                          )}
                          <button onClick={() => handleEdit(s)} className="text-[#1E6091] hover:bg-[#1E6091]/5 p-1.5 rounded-lg transition-colors" title="Modifier">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Supprimer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#0F2B46]">{editing ? 'Modifier la séance' : 'Nouvelle séance'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.date_seance} onChange={(e) => setForm({ ...form, date_seance: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={form.type_cours} onChange={(e) => setForm({ ...form, type_cours: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required>
                    <option value="CM">CM</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début *</label>
                  <input type="time" value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin *</label>
                  <input type="time" value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (h)</label>
                  <input type="number" step="0.5" value={form.duree_heures} onChange={(e) => setForm({ ...form, duree_heures: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant *</label>
                <select value={form.enseignant_id} onChange={(e) => setForm({ ...form, enseignant_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required>
                  <option value="">-- Sélectionner --</option>
                  {enseignants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} ({e.matricule})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matière *</label>
                <select value={form.matiere_id} onChange={(e) => setForm({ ...form, matiere_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required>
                  <option value="">-- Sélectionner --</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.code})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                  <select value={form.classe_id} onChange={(e) => setForm({ ...form, classe_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required>
                    <option value="">-- Sélectionner --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salle *</label>
                  <select value={form.salle_id} onChange={(e) => setForm({ ...form, salle_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required>
                    <option value="">-- Sélectionner --</option>
                    {salles.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.code})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année académique *</label>
                <input type="text" value={form.annee_academique} onChange={(e) => setForm({ ...form, annee_academique: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" placeholder="2024-2025" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetAndClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 bg-[#1E6091] hover:bg-[#164a73] text-white px-4 py-2 rounded-lg transition-colors">{editing ? 'Modifier' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}