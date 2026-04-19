import { useState, useEffect } from 'react';
import api from '../services/api.js';
import Bouton from '../components/ui/Bouton.jsx';
import Modal from '../components/ui/Modal.jsx';
import Alerte from '../components/ui/Alerte.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Plus, DoorOpen, Pencil, Trash2 } from 'lucide-react';

export default function Salles() {
  const [salles, setSalles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    api.get('/salles')
      .then((r) => setSalles(r.data))
      .catch(() => setSalles([]))
      .finally(() => setChargement(false));
  }, []);

  const ouvrir = (s = null) => { setEdit(s); setModal(true); setErreur(''); };

  const sauvegarder = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const donnees = Object.fromEntries(fd);
    try {
      if (edit) {
        const res = await api.put(`/salles/${edit.id}`, donnees);
        setSalles((prev) => prev.map((s) => (s.id === edit.id ? { ...s, ...res.data } : s)));
      } else {
        const res = await api.post('/salles', donnees);
        setSalles((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) { setErreur(err.response?.data?.message || 'Erreur'); }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette salle ?')) return;
    try { await api.delete(`/salles/${id}`); setSalles((prev) => prev.filter((s) => s.id !== id)); } catch {}
  };

  if (chargement) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent" /></div>;

  return (
    <div className="space-y-4">
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}
      <div className="page-header">
        <div className="flex items-center gap-3"><h1 className="page-title">Salles</h1><span className="badge-info">{salles.length}</span></div>
        <Bouton onClick={() => ouvrir()}><Plus size={16} /> Nouvelle salle</Bouton>
      </div>

      {salles.length === 0 ? (
        <EmptyState message="Aucune salle" icone={DoorOpen} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {salles.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-midnight">{s.nom}</h3>
                  <p className="text-xs font-mono text-slate-400">{s.code}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => ouvrir(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={14} /></button>
                  <button onClick={() => supprimer(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-500">
                <p>🪑 Capacité : <span className="font-medium text-slate-700">{s.capacite}</span></p>
                {s.type && <p>📋 Type : {s.type}</p>}
                {s.batiment && <p>🏢 Bâtiment : {s.batiment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal ouvert={modal} fermer={() => setModal(false)} titre={edit ? 'Modifier la salle' : 'Nouvelle salle'}>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Code *</label><input name="code" type="text" defaultValue={edit?.code || ''} required className="input-field" /></div>
              <div><label className="label-field">Nom *</label><input name="nom" type="text" defaultValue={edit?.nom || ''} required className="input-field" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Capacité</label><input name="capacite" type="number" defaultValue={edit?.capacite || 0} className="input-field" min={0} /></div>
              <div><label className="label-field">Type</label><input name="type" type="text" defaultValue={edit?.type || ''} className="input-field" placeholder="Amphi, TD, TP..." /></div>
            </div>
            <div><label className="label-field">Bâtiment</label><input name="batiment" type="text" defaultValue={edit?.batiment || ''} className="input-field" /></div>
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