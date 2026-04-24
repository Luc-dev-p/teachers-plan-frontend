import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Users, Plus, Edit2, Trash2, Search, RefreshCw, X, Eye, Mail, Phone } from 'lucide-react';

export default function Enseignants() {
  const [enseignants, setEnseignants] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [modal, setModal] = useState(false);
  const [modalDetail, setModalDetail] = useState(null);
  const [edition, setEdition] = useState(null);
  const [soumission, setSoumission] = useState(false);
  const [formulaire, setFormulaire] = useState({
    matricule: '',
    utilisateur_id: '',
    departement_id: '',
    telephone: '',
    date_naissance: '',
    categorie: 'Vacataire',
    grade: '',
  });

  const charger = async () => {
    setChargement(true);
    try {
      const [resEns, resDep, resUtil] = await Promise.all([
        api.get('/enseignants'),
        api.get('/departements'),
        api.get('/utilisateurs'),
      ]);
      setEnseignants(resEns.data);
      setDepartements(resDep.data);
      setUtilisateurs(resUtil.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const ouvrirCreation = () => {
    setEdition(null);
    setFormulaire({
      matricule: '',
      utilisateur_id: '',
      departement_id: '',
      telephone: '',
      date_naissance: '',
      categorie: 'Vacataire',
      grade: '',
    });
    setModal(true);
  };

  const ouvrirEdition = (item) => {
    setEdition(item.id);
    setFormulaire({
      matricule: item.matricule || '',
      utilisateur_id: item.utilisateur_id || '',
      departement_id: item.departement_id || '',
      telephone: item.telephone || '',
      date_naissance: item.date_naissance || '',
      categorie: item.categorie || 'Vacataire',
      grade: item.grade || '',
    });
    setModal(true);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    setSoumission(true);
    try {
      if (edition) {
        await api.put(`/enseignants/${edition}`, formulaire);
      } else {
        await api.post('/enseignants', formulaire);
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
    if (!confirm('Supprimer cet enseignant ?')) return;
    try {
      await api.delete(`/enseignants/${id}`);
      charger();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const filtres = enseignants.filter((e) =>
    `${e.nom} ${e.prenom} ${e.email} ${e.matricule}`.toLowerCase().includes(recherche.toLowerCase())
  );

  const categorieCouleur = (cat) => {
    if (cat === 'Permanent') return 'bg-emerald-100 text-emerald-700';
    if (cat === 'Contractuel') return 'bg-amber-100 text-amber-700';
    return 'bg-sky-100 text-sky-700';
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-midnight flex items-center gap-3">
            <Users size={28} /> Enseignants
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {enseignants.length} enseignant{enseignants.length > 1 ? 's' : ''} enregistré{enseignants.length > 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={ouvrirCreation} className="btn-primary gap-2">
          <Plus size={16} /> Nouvel enseignant
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par nom, prénom, email..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={charger} disabled={chargement} className="btn-secondary">
          <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
        </button>
      </div>

      {chargement ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-navy" size={24} />
        </div>
      ) : filtres.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">Aucun enseignant trouvé</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Catégorie</th>
                <th>Département</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map((e) => (
                <tr key={e.id}>
                  <td className="font-mono text-xs text-slate-500">{e.matricule}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy to-sky flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </div>
                      <span className="font-medium text-midnight">{e.prenom} {e.nom}</span>
                    </div>
                  </td>
                  <td className="text-slate-500">{e.email}</td>
                  <td>
                    <span className={`badge ${categorieCouleur(e.categorie)}`}>{e.categorie}</span>
                  </td>
                  <td className="text-slate-500">{e.departement_nom || '-'}</td>
                  <td>
                    <span className={`badge ${e.statut === 'actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {e.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setModalDetail(e)} className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => ouvrirEdition(e)} className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => supprimer(e.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal création / édition */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-midnight">
                {edition ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={soumettre} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Matricule</label>
                  <input type="text" value={formulaire.matricule} onChange={(e) => setFormulaire({ ...formulaire, matricule: e.target.value })} className="input-field" placeholder="ENS-001" required />
                </div>
                <div>
                  <label className="label-field">Catégorie</label>
                  <select value={formulaire.categorie} onChange={(e) => setFormulaire({ ...formulaire, categorie: e.target.value })} className="select-field">
                    <option>Vacataire</option>
                    <option>Permanent</option>
                    <option>Contractuel</option>
                  </select>
                </div>
              </div>
              {!edition && (
                <div>
                  <label className="label-field">Utilisateur associé</label>
                  <select value={formulaire.utilisateur_id} onChange={(e) => setFormulaire({ ...formulaire, utilisateur_id: e.target.value })} className="select-field" required>
                    <option value="">-- Sélectionner --</option>
                    {utilisateurs.filter(u => u.role === 'enseignant').map((u) => (
                      <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Département</label>
                  <select value={formulaire.departement_id} onChange={(e) => setFormulaire({ ...formulaire, departement_id: e.target.value })} className="select-field">
                    <option value="">-- Sélectionner --</option>
                    {departements.map((d) => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">Grade</label>
                  <input type="text" value={formulaire.grade} onChange={(e) => setFormulaire({ ...formulaire, grade: e.target.value })} className="input-field" placeholder="Professeur, Maître..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Téléphone</label>
                  <input type="tel" value={formulaire.telephone} onChange={(e) => setFormulaire({ ...formulaire, telephone: e.target.value })} className="input-field" placeholder="+225 XX XX XX XX" />
                </div>
                <div>
                  <label className="label-field">Date de naissance</label>
                  <input type="date" value={formulaire.date_naissance} onChange={(e) => setFormulaire({ ...formulaire, date_naissance: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={soumission} className="btn-primary flex-1">
                  {soumission ? 'Enregistrement...' : edition ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détail */}
      {modalDetail && (
        <div className="modal-overlay" onClick={() => setModalDetail(null)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-midnight">Détails enseignant</h2>
              <button onClick={() => setModalDetail(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy to-sky flex items-center justify-center text-white text-xl font-bold">
                  {modalDetail.prenom?.[0]}{modalDetail.nom?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-midnight">{modalDetail.prenom} {modalDetail.nom}</h3>
                  <p className="text-sm text-slate-500">{modalDetail.matricule}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-slate-600">{modalDetail.email}</span>
                </div>
                {modalDetail.telephone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <span className="text-slate-600">{modalDetail.telephone}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <span className={`badge ${categorieCouleur(modalDetail.categorie)}`}>{modalDetail.categorie}</span>
                  {modalDetail.grade && <span className="badge bg-slate-100 text-slate-700">{modalDetail.grade}</span>}
                  {modalDetail.departement_nom && <span className="badge bg-blue-100 text-blue-700">{modalDetail.departement_nom}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}