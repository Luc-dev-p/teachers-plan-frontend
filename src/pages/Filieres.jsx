import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { utiliserAuth } from '../context/AuthContext.jsx';
import Bouton from '../components/ui/Bouton.jsx';
import Modal from '../components/ui/Modal.jsx';
import Alerte from '../components/ui/Alerte.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Select from '../components/ui/Select.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Plus, Search, GraduationCap, Pencil, Trash2 } from 'lucide-react';

export default function Filieres() {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [filieres, setFilieres] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const parPage = 10;

  useEffect(() => {
    Promise.all([api.get('/filieres'), api.get('/departements')])
      .then(([r1, r2]) => { setFilieres(r1.data); setDepartements(r2.data); })
      .catch(() => setFilieres([]))
      .finally(() => setChargement(false));
  }, []);

  const filtered = filieres.filter((f) => {
    const t = recherche.toLowerCase();
    return f.nom?.toLowerCase().includes(t) || f.code?.toLowerCase().includes(t);
  });
  const paginated = filtered.slice((page - 1) * parPage, page * parPage);

  const ouvrir = (f = null) => {
    setEdit(f);
    setModal(true);
    setErreur('');
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const donnees = Object.fromEntries(fd);
    try {
      if (edit) {
        const res = await api.put(`/filieres/${edit.id}`, donnees);
        setFilieres((prev) => prev.map((f) => (f.id === edit.id ? { ...f, ...res.data } : f)));
      } else {
        const res = await api.post('/filieres', donnees);
        setFilieres((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette filière ?')) return;
    try {
      await api.delete(`/filieres/${id}`);
      setFilieres((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  if (chargement) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Filières</h1>
          <span className="badge-info">{filtered.length}</span>
        </div>
        {role !== 'enseignant' && <Bouton onClick={() => ouvrir()}><Plus size={16} /> Nouvelle filière</Bouton>}
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} placeholder="Rechercher..." className="input-field pl-9" />
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState message="Aucune filière" icone={GraduationCap} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead><tr><th>Code</th><th>Nom</th><th>Département</th><th>Description</th>{role !== 'enseignant' && <th className="text-right">Actions</th>}</tr></thead>
              <tbody>
                {paginated.map((f) => (
                  <tr key={f.id}>
                    <td className="font-mono text-xs">{f.code}</td>
                    <td className="font-medium">{f.nom}</td>
                    <td className="text-slate-500">{f.departement?.nom || '—'}</td>
                    <td className="text-slate-500 text-sm max-w-xs truncate">{f.description || '—'}</td>
                    {role !== 'enseignant' && (
                      <td className="text-right">
                        <button onClick={() => ouvrir(f)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={15} /></button>
                        <button onClick={() => supprimer(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3"><Pagination page={page} total={filtered.length} parPage={parPage} onPageChange={setPage} /></div>
        </div>
      )}

      {modal && (
        <Modal ouvert={modal} fermer={() => setModal(false)} titre={edit ? 'Modifier la filière' : 'Nouvelle filière'}>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Code *</label><input name="code" type="text" defaultValue={edit?.code || ''} required className="input-field" /></div>
              <div><label className="label-field">Nom *</label><input name="nom" type="text" defaultValue={edit?.nom || ''} required className="input-field" /></div>
            </div>
            <Select label="Département *" valeur={edit?.departement_id || edit?.departementId || ''} onChange={() => {}} options={departements.map((d) => ({ value: d.id, label: d.nom }))} />
            <div><label className="label-field">Description</label><textarea name="description" defaultValue={edit?.description || ''} className="input-field" rows={3} /></div>
            <div className="flex gap-3 pt-2">
              <Bouton variante="secondaire" onClick={() => setModal(false)} type="button">Annuler</Bouton>
              <Bouton type="submit">{edit ? 'Mettre à jour' : 'Créer'}</Bouton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}