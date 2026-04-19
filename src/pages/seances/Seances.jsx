import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import Chargement from '../../components/ui/Chargement.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import Bouton from '../../components/ui/Bouton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Select from '../../components/ui/Select.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Plus, Search, Calendar, Pencil, Trash2, CheckCircle } from 'lucide-react';

export default function Seances() {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [seances, setSeances] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const parPage = 15;

  const fetch = async () => {
    setChargement(true);
    try {
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        api.get('/seances'),
        api.get('/enseignants'),
        api.get('/matieres'),
        api.get('/salles'),
        api.get('/classes'),
        api.get('/annees-academiques'),
      ]);
      setSeances(r1.data);
      setEnseignants(r2.data);
      setMatieres(r3.data);
      setSalles(r4.data);
      setClasses(r5.data);
      setAnnees(r6.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = seances.filter((s) => {
    if (recherche) {
      const t = recherche.toLowerCase();
      const nom = `${s.enseignant?.prenom || ''} ${s.enseignant?.nom || ''}`.toLowerCase();
      if (!nom.includes(t)) return false;
    }
    if (role === 'enseignant') return s.enseignant_id === utilisateur?.enseignant_id;
    return true;
  });
  const paginated = filtered.slice((page - 1) * parPage, page * parPage);

  const valider = async (id) => {
    try {
      await api.put(`/seances/${id}/valider`);
      setSeances((prev) => prev.map((s) => (s.id === id ? { ...s, statut: 'validee' } : s)));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette séance ?')) return;
    try {
      await api.delete(`/seances/${id}`);
      setSeances((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  const sauvegarder = async (donnees) => {
    try {
      if (edit) {
        const res = await api.put(`/seances/${edit.id}`, donnees);
        setSeances((prev) => prev.map((s) => (s.id === edit.id ? { ...s, ...res.data } : s)));
      } else {
        const res = await api.post('/seances', donnees);
        setSeances((prev) => [...prev, res.data]);
      }
      setModal(false);
      setEdit(null);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de sauvegarde');
    }
  };

  if (chargement) return <Chargement />;
  return (
    <div className="space-y-4">
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}

      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Séances de cours</h1>
          <span className="badge-info">{filtered.length}</span>
        </div>
        {(role !== 'enseignant') && (
          <Bouton onClick={() => { setEdit(null); setModal(true); }}><Plus size={16} /> Nouvelle séance</Bouton>
        )}
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} placeholder="Rechercher par enseignant..." className="input-field pl-9" />
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState message="Aucune séance trouvée" icone={Calendar} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Enseignant</th><th>Matière</th><th>Classe</th><th>Salle</th><th>Horaire</th><th>Type</th><th>Statut</th>{role !== 'enseignant' && <th className="text-right">Actions</th>}</tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr key={s.id}>
                    <td>{new Date(s.date_seance).toLocaleDateString('fr-FR')}</td>
                    <td className="font-medium">{s.enseignant?.prenom} {s.enseignant?.nom}</td>
                    <td>{s.matiere?.nom || '—'}</td>
                    <td className="text-slate-500">{s.classe?.nom || '—'}</td>
                    <td className="text-slate-500">{s.salle?.nom || '—'}</td>
                    <td>{s.heure_debut} - {s.heure_fin}</td>
                    <td><Badge variant={s.type_cours === 'CM' ? 'info' : s.type_cours === 'TP' ? 'succes' : 'warning'}>{s.type_cours}</Badge></td>
                    <td>
                      <Badge variant={s.statut === 'validee' ? 'succes' : s.statut === 'planifiee' ? 'warning' : s.statut === 'annulee' ? 'danger' : 'default'}>
                        {s.statut === 'validee' ? 'Validée' : s.statut === 'planifiee' ? 'Planifiée' : s.statut === 'annulee' ? 'Annulée' : s.statut}
                      </Badge>
                    </td>
                    {role !== 'enseignant' && (
                      <td className="text-right">
                        {s.statut !== 'validee' && (
                          <>
                            <button onClick={() => valider(s.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600" title="Valider"><CheckCircle size={15} /></button>
                            <button onClick={() => supprimer(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3">
            <Pagination page={page} total={filtered.length} parPage={parPage} onPageChange={setPage} />
          </div>
        </div>
      )}

      {modal && (
        <FormulaireSeance
          seance={edit}
          enseignants={enseignants}
          matieres={matieres}
          salles={salles}
          classes={classes}
          annees={annees}
          fermer={() => { setModal(false); setEdit(null); }}
          sauvegarder={sauvegarder}
        />
      )}
    </div>
  );
}

// Composant FormulaireSeance intégré
function FormulaireSeance({ seance, enseignants, matieres, salles, classes, annees, fermer, sauvegarder }) {
  const estEdit = !!seance;
  const [form, setForm] = useState({
    enseignant_id: seance?.enseignant_id || seance?.enseignantId || '',
    matiere_id: seance?.matiere_id || seance?.matiereId || '',
    salle_id: seance?.salle_id || seance?.salleId || '',
    classe_id: seance?.classe_id || seance?.classeId || '',
    date_seance: seance?.date_seance ? seance.date_seance.split('T')[0] : new Date().toISOString().split('T')[0],
    heure_debut: seance?.heure_debut || '08:00',
    heure_fin: seance?.heure_fin || '09:30',
    type_cours: seance?.type_cours || 'CM',
    annee_academique: seance?.annee_academique || seance?.anneeAcademique || annees?.[0]?.id || '',
  });
  const [erreur, setErreur] = useState('');
  const [enSauvegarde, setEnSauvegarde] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnSauvegarde(true);
    try {
      await sauvegarder(form);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setEnSauvegarde(false);
    }
  };

  return (
    <Modal ouvert={true} fermer={fermer} titre={estEdit ? 'Modifier la séance' : 'Nouvelle séance'}>
      {erreur && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{erreur}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Enseignant *" valeur={form.enseignant_id} onChange={(v) => setForm({ ...form, enseignant_id: v })} options={enseignants.map((e) => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))} />
          <Select label="Matière *" valeur={form.matiere_id} onChange={(v) => setForm({ ...form, matiere_id: v })} options={matieres.map((m) => ({ value: m.id, label: `${m.code} - ${m.nom}` }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Salle" valeur={form.salle_id} onChange={(v) => setForm({ ...form, salle_id: v })} options={salles.map((s) => ({ value: s.id, label: `${s.code} - ${s.nom}` }))} />
          <Select label="Classe *" valeur={form.classe_id} onChange={(v) => setForm({ ...form, classe_id: v })} options={classes.map((c) => ({ value: c.id, label: `${c.code} - ${c.nom}` }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Date *</label>
            <input type="date" value={form.date_seance} onChange={(e) => setForm({ ...form, date_seance: e.target.value })} required className="input-field" />
          </div>
          <Select label="Année académique *" valeur={form.annee_academique} onChange={(v) => setForm({ ...form, annee_academique: v })} options={annees.map((a) => ({ value: a.id, label: a.libelle }))} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-field">Début *</label>
            <input type="time" value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="label-field">Fin *</label>
            <input type="time" value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} required className="input-field" />
          </div>
          <Select label="Type" valeur={form.type_cours} onChange={(v) => setForm({ ...form, type_cours: v })} options={[{ value: 'CM', label: 'CM' }, { value: 'TD', label: 'TD' }, { value: 'TP', label: 'TP' }, { value: 'Projet', label: 'Projet' }]} />
        </div>
        <div className="flex gap-3 pt-2">
          <Bouton variante="secondaire" onClick={fermer} type="button">Annuler</Bouton>
          <Bouton type="submit" chargement={enSauvegarde}>{estEdit ? 'Mettre à jour' : 'Créer la séance'}</Bouton>
        </div>
      </form>
    </Modal>
  );
}