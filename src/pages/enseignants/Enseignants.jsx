import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import ListeEnseignants from './ListeEnseignants.jsx';
import FormulaireEnseignant from './FormulaireEnseignant.jsx';
import Chargement from '../../components/ui/Chargement.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import Bouton from '../../components/ui/Bouton.jsx';
import { Plus, Search } from 'lucide-react';

export default function Enseignants() {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [enseignants, setEnseignants] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [enseignantEdit, setEnseignantEdit] = useState(null);
  const parPage = 10;

  const fetchData = async () => {
    setChargement(true);
    setErreur('');
    try {
      const [resEns, resDep] = await Promise.all([
        api.get('/enseignants'),
        api.get('/departements'),
      ]);
      setEnseignants(resEns.data);
      setDepartements(resDep.data);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = (enseignants || []).filter((e) => {
    const term = recherche.toLowerCase();
    return (
      e.nom?.toLowerCase().includes(term) ||
      e.prenom?.toLowerCase().includes(term) ||
      e.matricule?.toLowerCase().includes(term) ||
      e.email?.toLowerCase().includes(term) ||
      e.specialite?.toLowerCase().includes(term)
    );
  });

  const paginated = filtered.slice((page - 1) * parPage, page * parPage);

  const handleAjouter = () => {
    setEnseignantEdit(null);
    setModalOuvert(true);
  };

  const handleModifier = (ens) => {
    setEnseignantEdit(ens);
    setModalOuvert(true);
  };

  const handleSupprimer = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) return;
    try {
      await api.delete(`/enseignants/${id}`);
      setEnseignants((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de suppression');
    }
  };

  const handleSauvegarder = async (donnees) => {
    try {
      if (enseignantEdit) {
        const res = await api.put(`/enseignants/${enseignantEdit.id}`, donnees);
        setEnseignants((prev) => prev.map((e) => (e.id === enseignantEdit.id ? { ...e, ...res.data } : e)));
      } else {
        const res = await api.post('/enseignants', donnees);
        setEnseignants((prev) => [...prev, res.data]);
      }
      setModalOuvert(false);
      setEnseignantEdit(null);
    } catch (err) {
      throw err;
    }
  };

  if (chargement) return <Chargement />;
  return (
    <div className="space-y-4">
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}

      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Enseignants</h1>
          <span className="badge-info">{filtered.length}</span>
        </div>
        {role !== 'enseignant' && (
          <Bouton onClick={handleAjouter}>
            <Plus size={16} /> Nouvel enseignant
          </Bouton>
        )}
      </div>

      {/* Recherche */}
      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, matricule, email, spécialité..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Liste */}
      <ListeEnseignants
        enseignants={paginated}
        total={filtered.length}
        page={page}
        parPage={parPage}
        onPageChange={setPage}
        onModifier={handleModifier}
        onSupprimer={handleSupprimer}
        peutModifier={role !== 'enseignant'}
      />

      {/* Formulaire modal */}
      {modalOuvert && (
        <FormulaireEnseignant
          enseignant={enseignantEdit}
          departements={departements}
          fermer={() => { setModalOuvert(false); setEnseignantEdit(null); }}
          sauvegarder={handleSauvegarder}
        />
      )}
    </div>
  );
}