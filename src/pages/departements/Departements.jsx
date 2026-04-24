import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Building2, Plus, Edit2, Trash2, Search, RefreshCw, X } from 'lucide-react';

export default function Departements() {
  const [departements, setDepartements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [modal, setModal] = useState(false);
  const [edition, setEdition] = useState(null);
  const [formulaire, setFormulaire] = useState({ code: '', nom: '' });
  const [soumission, setSoumission] = useState(false);

  const charger = async () => {
    setChargement(true);
    try {
      const res = await api.get('/departements');
      setDepartements(res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const ouvrirCreation = () => {
    setEdition(null);
    setFormulaire({ code: '', nom: '' });
    setModal(true);
  };

  const ouvrirEdition = (item) => {
    setEdition(item.id);
    setFormulaire({ code: item.code, nom: item.nom });
    setModal(true);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    if (!formulaire.code.trim() || !formulaire.nom.trim()) return;
    setSoumission(true);
    try {
      if (edition) {
        await api.put(`/departements/${edition}`, formulaire);
      } else {
        await api.post('/departements', formulaire);
      }
      setModal(false);
      charger();
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setSoumission(false);
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce département ?')) return;
    try {
      await api.delete(`/departements/${id}`);
      charger();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const filtres = departements.filter((d) =>
    d.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    d.code.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-midnight flex items-center gap-3">
            <Building2 size={28} /> Départements
          </h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les départements de l'université</p>
        </div>
        <button onClick={ouvrirCreation} className="btn-primary gap-2">
          <Plus size={16} /> Nouveau département
        </button>
      </div>

      {/* Barre recherche */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un département..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={charger} disabled={chargement} className="btn-secondary">
          <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Contenu */}
      {chargement ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-navy" size={24} />
        </div>
      ) : filtres.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">Aucun département trouvé</p>
          <p className="text-sm text-slate-400 mt-1">Commencez par ajouter un département</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtres.map((d) => (
            <div key={d.id} className="card p-5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {d.code?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-midnight">{d.nom}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Code: {d.code}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => ouvrirEdition(d)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => supprimer(d.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-midnight">
                {edition ? 'Modifier le département' : 'Nouveau département'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={soumettre} className="p-6 space-y-4">
              <div>
                <label className="label-field">Code</label>
                <input
                  type="text"
                  value={formulaire.code}
                  onChange={(e) => setFormulaire({ ...formulaire, code: e.target.value })}
                  className="input-field"
                  placeholder="Ex: INFO, MATH, GEA..."
                  required
                />
              </div>
              <div>
                <label className="label-field">Nom</label>
                <input
                  type="text"
                  value={formulaire.nom}
                  onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Informatique"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={soumission} className="btn-primary flex-1">
                  {soumission ? 'Enregistrement...' : edition ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}