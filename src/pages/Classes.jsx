import { useState, useEffect } from 'react';
import api from '../services/api.js';
import Bouton from '../components/ui/Bouton.jsx';
import Modal from '../components/ui/Modal.jsx';
import Select from '../components/ui/Select.jsx';
import Alerte from '../components/ui/Alerte.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Plus, School, Search, Pencil, Trash2 } from 'lucide-react';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const parPage = 10;

  useEffect(() => {
    Promise.all([api.get('/classes'), api.get('/filieres'), api.get('/niveaux')])
      .then(([r1, r2, r3]) => { setClasses(r1.data); setFilieres(r2.data); setNiveaux(r3.data); })
      .catch(() => setClasses([]))
      .finally(() => setChargement(false));
  }, []);

  const filtered = classes.filter((c) => {
    const t = recherche.toLowerCase();
    return c.nom?.toLowerCase().includes(t) || c.code?.toLowerCase().includes(t);
  });
  const paginated = filtered.slice((page - 1) * parPage, page * parPage);

  const ouvrir = (c = null) => { setEdit(c); setModal(true); setErreur(''); };

  const sauvegarder = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const donnees = Object.fromEntries(fd);
    try {
      if (edit) {
        const res = await api.put(`/classes/${edit.id}`, donnees);
        setClasses((prev) => prev.map((c) => (c.id === edit.id ? { ...c, ...res.data } : c)));
      } else {
        const res = await api.post('/classes', donnees);
        setClasses((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur'); }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette classe ?')) return;
    try { await api.delete(`/classes/${id}`); setClasses((prev) => prev.filter((c) => c.id !== id)); } catch {}
  };

  if (chargement) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}
      <div className="page-header">
        <div className="flex items-center gap-3"><h1 className="page-title">Classes</h1><span className="badge-info">{filtered.length}</span></div>
        <Bouton onClick={() => ouvrir()}><Plus size={16} /> Nouvelle classe</Bouton>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} placeholder="Rechercher..." className="input-field pl-9" />
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState message="Aucune classe" icone={School} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead><tr><th>Code</th><th>Nom</th><th>Filière</th><th>Niveau</th><th>Capacité</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {paginated.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono text-xs">{c.code}</td>
                    <td className="font-medium">{c.nom}</td>
                    <td className="text-slate-500">{c.filiere?.nom || '—'}</td>
                    <td><span className="badge-info">{c.niveau?.nom || '—'}</span></td>
                    <td>{c.capacite}</td>
                    <td className="text-right">
                      <button onClick={() => ouvrir(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={15} /></button>
                      <button onClick={() => supprimer(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3"><Pagination page={page} total={filtered.length} parPage={parPage} onPageChange={setPage} /></div>
        </div>
      )}

      {modal && (
        <Modal ouvert={modal} fermer={() => setModal(false)} titre={edit ? 'Modifier la classe' : 'Nouvelle classe'}>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Code *</label><input name="code" type="text" defaultValue={edit?.code || ''} required className="input-field" /></div>
              <div><label className="label-field">Nom *</label><input name="nom" type="text" defaultValue={edit?.nom || ''} required className="input-field" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Filière *" valeur={edit?.filiere_id || ''} onChange={() => {}} options={filieres.map((f) => ({ value: f.id, label: f.nom }))} />
              <Select label="Niveau *" valeur={edit?.niveau_id || ''} onChange={() => {}} options={niveaux.map((n) => ({ value: n.id, label: n.nom }))} />
            </div>
            <div><label className="label-field">Capacité</label><input name="capacite" type="number" defaultValue={edit?.capacite || 0} className="input-field" min={0} /></div>
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