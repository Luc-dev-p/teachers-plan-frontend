import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Bouton from '../../components/ui/Bouton.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import Chargement from '../../components/ui/Chargement.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Select from '../../components/ui/Select.jsx';
import { FileDown, Download, Trash2, Search, Calendar } from 'lucide-react';

export default function Exports() {
  const [exports, setExports] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [form, setForm] = useState({ type: 'heures_enseignant', enseignant_id: '', mois: '', annee: new Date().getFullYear().toString() });
  const [page, setPage] = useState(1);
  const parPage = 10;

  useEffect(() => {
    Promise.all([api.get('/exports'), api.get('/enseignants')])
      .then(([r1, r2]) => { setExports(r1.data || []); setEnseignants(r2.data); })
      .catch(() => setExports([]))
      .finally(() => setChargement(false));
  }, []);

  const generer = async (e) => {
    e.preventDefault();
    setEnCours(true);
    setErreur('');
    try {
      const res = await api.post('/exports/generer', form);
      setExports((prev) => [res.data, ...prev]);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de génération');
    } finally {
      setEnCours(false);
    }
  };

  const telecharger = async (id) => {
    try {
      const res = await api.get(`/exports/${id}/telecharger`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setErreur('Erreur de téléchargement');
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cet export ?')) return;
    try {
      await api.delete(`/exports/${id}`);
      setExports((prev) => prev.filter((ex) => ex.id !== id));
    } catch {}
  };

  if (chargement) return <Chargement />;
  return (
    <div className="space-y-4">
      <h1 className="page-title">Exports</h1>
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}

      {/* Formulaire de génération */}
      <div className="card p-6">
        <h3 className="font-bold text-midnight mb-4 flex items-center gap-2"><FileDown size={18} /> Générer un export</h3>
        <form onSubmit={generer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="label-field">Type d'export</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-field">
              <option value="heures_enseignant">Heures par enseignant</option>
              <option value="heures_global">Heures globales</option>
              <option value="paiement">Bulletin de paie</option>
              <option value="presence">Feuille de présence</option>
            </select>
          </div>
          <Select label="Enseignant (optionnel)" valeur={form.enseignant_id} onChange={(v) => setForm({ ...form, enseignant_id: v })} options={enseignants.map((e) => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))} />
          <Select label="Mois" valeur={form.mois} onChange={(v) => setForm({ ...form, mois: v })} options={[{ value: '', label: 'Tous' }, { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' }, { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' }, { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' }, { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' }, { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' }, { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }]} />
          <Bouton type="submit" chargement={enCours}><FileDown size={16} /> Générer</Bouton>
        </form>
      </div>

      {/* Liste des exports */}
      {exports.length === 0 ? (
        <EmptyState message="Aucun export généré" icone={FileDown} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Format</th><th>Statut</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {exports.slice((page - 1) * parPage, page * parPage).map((ex) => (
                  <tr key={ex.id}>
                    <td>{new Date(ex.cree_le).toLocaleString('fr-FR')}</td>
                    <td className="font-medium">{ex.type?.replace(/_/g, ' ') || ex.type}</td>
                    <td><Badge variant="info">{ex.format || 'XLSX'}</Badge></td>
                    <td><Badge variant={ex.statut === 'pret' ? 'succes' : ex.statut === 'erreur' ? 'danger' : 'warning'}>{ex.statut === 'pret' ? 'Prêt' : ex.statut === 'erreur' ? 'Erreur' : 'En cours'}</Badge></td>
                    <td className="text-right">
                      {ex.statut === 'pret' && (
                        <button onClick={() => telecharger(ex.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600"><Download size={15} /></button>
                      )}
                      <button onClick={() => supprimer(ex.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3">
            <Pagination page={page} total={exports.length} parPage={parPage} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}