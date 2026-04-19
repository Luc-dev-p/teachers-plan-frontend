import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import ListeMatieres from './ListeMatieres.jsx';
import FormulaireMatiere from './FormulaireMatiere.jsx';
import Chargement from '../../components/ui/Chargement.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import Bouton from '../../components/ui/Bouton.jsx';
import { Plus, Search, BookOpen } from 'lucide-react';

export default function Matieres() {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [matieres, setMatieres] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const parPage = 10;

  const fetch = async () => {
    setChargement(true);
    try {
      const [resMat, resFil] = await Promise.all([api.get('/matieres'), api.get('/filieres')]);
      setMatieres(resMat.data);
      setFilieres(resFil.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = matieres.filter((m) => {
    const t = recherche.toLowerCase();
    return m.nom?.toLowerCase().includes(t) || m.code?.toLowerCase().includes(t);
  });
  const paginated = filtered.slice((page - 1) * parPage, page * parPage);

  const sauvegarder = async (donnees) => {
    try {
      if (edit) {
        const res = await api.put(`/matieres/${edit.id}`, donnees);
        setMatieres((prev) => prev.map((m) => (m.id === edit.id ? { ...m, ...res.data } : m)));
      } else {
        const res = await api.post('/matieres', donnees);
        setMatieres((prev) => [...prev, res.data]);
      }
      setModal(false);
      setEdit(null);
    } catch (err) {
      throw err;
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette matière ?')) return;
    try {
      await api.delete(`/matieres/${id}`);
      setMatieres((prev) => prev.filter((m) => m.id !== id));
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
          <h1 className="page-title">Matières</h1>
          <span className="badge-info">{filtered.length}</span>
        </div>
        {role !== 'enseignant' && <Bouton onClick={() => { setEdit(null); setModal(true); }}><Plus size={16} /> Nouvelle matière</Bouton>}
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} placeholder="Rechercher une matière..." className="input-field pl-9" />
        </div>
      </div>

      <ListeMatieres
        matieres={paginated}
        total={filtered.length}
        page={page}
        parPage={parPage}
        onPageChange={setPage}
        onModifier={(m) => { setEdit(m); setModal(true); }}
        onSupprimer={supprimer}
        peutModifier={role !== 'enseignant'}
      />

      {modal && (
        <FormulaireMatiere
          matiere={edit}
          filieres={filieres}
          fermer={() => { setModal(false); setEdit(null); }}
          sauvegarder={sauvegarder}
        />
      )}
    </div>
  );
}