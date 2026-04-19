import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import Chargement from '../../components/ui/Chargement.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import Bouton from '../../components/ui/Bouton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Select from '../../components/ui/Select.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Plus, Search, Building2, Pencil, Trash2, Users } from 'lucide-react';

export default function Departements() {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [departements, setDepartements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ code: '', nom: '', description: '' });
  const [enSauvegarde, setEnSauvegarde] = useState(false);

  const fetch = async () => {
    setChargement(true);
    try {
      const res = await api.get('/departements');
      setDepartements(res.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = departements.filter((d) => {
    const t = recherche.toLowerCase();
    return d.nom?.toLowerCase().includes(t) || d.code?.toLowerCase().includes(t);
  });
  const parPage = 10;
  const paginated = filtered.slice((page - 1) * parPage, page * parPage);

  const ouvrir = (dep = null) => {
    setEdit(dep);
    setForm(dep ? { code: dep.code, nom: dep.nom, description: dep.description || '' } : { code: '', nom: '', description: '' });
    setModal(true);
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    setEnSauvegarde(true);
    setErreur('');
    try {
      if (edit) {
        const res = await api.put(`/departements/${edit.id}`, form);
        setDepartements((prev) => prev.map((d) => (d.id === edit.id ? { ...d, ...res.data } : d)));
      } else {
        const res = await api.post('/departements', form);
        setDepartements((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de sauvegarde');
    } finally {
      setEnSauvegarde(false);
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce département ?')) return;
    try {
      await api.delete(`/departements/${id}`);
      setDepartements((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de suppression');
    }
  };

  if (chargement) return <Chargement />;
  return (
    <div className="space-y-4">
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}

      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Départements</h1>
          <span className="badge-info">{filtered.length}</span>
        </div>
        {role !== 'enseignant' && (
          <Bouton onClick={() => ouvrir()}><Plus size={16} /> Nouveau</Bouton>
        )}
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
            placeholder="Rechercher un département..." className="input-field pl-9"
          />
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState message="Aucun département trouvé" icone={Building2} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr><th>Code</th><th>Nom</th><th>Description</th><th>Enseignants</th>{role !== 'enseignant' && <th className="text-right">Actions</th>}</tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr key={d.id}>
                    <td className="font-mono text-xs">{d.code}</td>
                    <td className="font-medium">{d.nom}</td>
                    <td className="text-slate-500 text-sm">{d.description || '—'}</td>
                    <td><span className="badge-info"><Users size={12} className="mr-1" />{d._count?.enseignants || d.nombre_enseignants || 0}</span></td>
                    {role !== 'enseignant' && (
                      <td className="text-right">
                        <button onClick={() => ouvrir(d)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={15} /></button>
                        <button onClick={() => supprimer(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
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
        <Modal ouvert={modal} fermer={() => setModal(false)} titre={edit ? 'Modifier le département' : 'Nouveau département'}>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div>
              <label className="label-field">Code *</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="input-field" placeholder="Ex: INFO" />
            </div>
            <div>
              <label className="label-field">Nom *</label>
              <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="input-field" placeholder="Ex: Informatique" />
            </div>
            <div>
              <label className="label-field">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Bouton variante="secondaire" onClick={() => setModal(false)} type="button">Annuler</Bouton>
              <Bouton type="submit" chargement={enSauvegarde}>{edit ? 'Mettre à jour' : 'Créer'}</Bouton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}