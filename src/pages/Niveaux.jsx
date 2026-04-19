import { useState, useEffect } from 'react';
import api from '../services/api.js';
import Bouton from '../components/ui/Bouton.jsx';
import Modal from '../components/ui/Modal.jsx';
import Alerte from '../components/ui/Alerte.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Plus, BookOpen, Pencil, Trash2 } from 'lucide-react';

export default function Niveaux() {
  const [niveaux, setNiveaux] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    api.get('/niveaux')
      .then((r) => setNiveaux(r.data))
      .catch(() => setNiveaux([]))
      .finally(() => setChargement(false));
  }, []);

  const ouvrir = (n = null) => { setEdit(n); setModal(true); setErreur(''); };

  const sauvegarder = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const donnees = Object.fromEntries(fd);
    try {
      if (edit) {
        const res = await api.put(`/niveaux/${edit.id}`, donnees);
        setNiveaux((prev) => prev.map((n) => (n.id === edit.id ? { ...n, ...res.data } : n)));
      } else {
        const res = await api.post('/niveaux', donnees);
        setNiveaux((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur'); }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try { await api.delete(`/niveaux/${id}`); setNiveaux((prev) => prev.filter((n) => n.id !== id)); } catch {}
  };

  if (chargement) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}
      <div className="page-header">
        <div className="flex items-center gap-3"><h1 className="page-title">Niveaux</h1><span className="badge-info">{niveaux.length}</span></div>
        <Bouton onClick={() => ouvrir()}><Plus size={16} /> Nouveau</Bouton>
      </div>

      {niveaux.length === 0 ? (
        <EmptyState message="Aucun niveau" icone={BookOpen} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead><tr><th>Code</th><th>Nom</th><th>Ordre</th><th>Description</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {niveaux.map((n) => (
                  <tr key={n.id}>
                    <td className="font-mono text-xs">{n.code}</td>
                    <td className="font-medium">{n.nom}</td>
                    <td><span className="badge-info">{n.ordre}</span></td>
                    <td className="text-slate-500 text-sm">{n.description || '—'}</td>
                    <td className="text-right">
                      <button onClick={() => ouvrir(n)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={15} /></button>
                      <button onClick={() => supprimer(n.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <Modal ouvert={modal} fermer={() => setModal(false)} titre={edit ? 'Modifier' : 'Nouveau niveau'}>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label-field">Code *</label><input name="code" type="text" defaultValue={edit?.code || ''} required className="input-field" /></div>
              <div><label className="label-field">Nom *</label><input name="nom" type="text" defaultValue={edit?.nom || ''} required className="input-field" /></div>
              <div><label className="label-field">Ordre</label><input name="ordre" type="number" defaultValue={edit?.ordre || 0} className="input-field" /></div>
            </div>
            <div><label className="label-field">Description</label><textarea name="description" defaultValue={edit?.description || ''} className="input-field" rows={2} /></div>
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