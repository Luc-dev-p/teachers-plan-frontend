import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import Bouton from '../../components/ui/Bouton.jsx';

export default function FormulaireSeance({ fermer, recharger }) {
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [formulaire, setFormulaire] = useState({
    enseignant_id: '', matiere_id: '', classe_id: '', salle_id: '',
    annee_academique_id: '', date: '', heure_debut: '08:00', heure_fin: '10:00',
    type_seance: 'TD', nombre_heures: 2, remarques: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/enseignants').then(({ data }) => setEnseignants(data.donnees)),
      api.get('/matieres').then(({ data }) => setMatieres(data.donnees)),
      api.get('/enseignants/classes').then(({ data }) => setClasses(data.donnees)),
      api.get('/enseignants/salles').then(({ data }) => setSalles(data.donnees)),
    ]).catch(() => {});
  }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    try {
      await api.post('/seances', formulaire);
      toast.success('Séance créée');
      fermer();
      if (recharger) recharger();
    } catch (erreur) {
      toast.error(erreur.response?.data?.message || 'Erreur');
    }
  };

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <select value={formulaire.enseignant_id} onChange={(e) => setFormulaire({ ...formulaire, enseignant_id: e.target.value })} required
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm">
          <option value="">Enseignant *</option>
          {enseignants.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
        </select>
        <select value={formulaire.matiere_id} onChange={(e) => setFormulaire({ ...formulaire, matiere_id: e.target.value })} required
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm">
          <option value="">Matière *</option>
          {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </select>
        <select value={formulaire.classe_id} onChange={(e) => setFormulaire({ ...formulaire, classe_id: e.target.value })} required
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm">
          <option value="">Classe *</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <select value={formulaire.salle_id} onChange={(e) => setFormulaire({ ...formulaire, salle_id: e.target.value })} required
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm">
          <option value="">Salle *</option>
          {salles.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <input type="date" value={formulaire.date} onChange={(e) => setFormulaire({ ...formulaire, date: e.target.value })} required
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm" />
        <input type="time" value={formulaire.heure_debut} onChange={(e) => setFormulaire({ ...formulaire, heure_debut: e.target.value })} required
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm" />
        <input type="time" value={formulaire.heure_fin} onChange={(e) => setFormulaire({ ...formulaire, heure_fin: e.target.value })} required
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <select value={formulaire.type_seance} onChange={(e) => setFormulaire({ ...formulaire, type_seance: e.target.value })}
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm">
          <option value="CM">CM</option>
          <option value="TD">TD</option>
          <option value="TP">TP</option>
        </select>
        <input type="number" step="0.5" value={formulaire.nombre_heures} onChange={(e) => setFormulaire({ ...formulaire, nombre_heures: parseFloat(e.target.value) })}
          className="h-10 px-3 rounded-lg border border-slate-200 text-sm" placeholder="Nombre d'heures" />
      </div>
      <textarea value={formulaire.remarques} onChange={(e) => setFormulaire({ ...formulaire, remarques: e.target.value })}
        className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" placeholder="Remarques (optionnel)" />
      <div className="flex justify-end gap-3">
        <Bouton variant="secondaire" onClick={fermer}>Annuler</Bouton>
        <Bouton type="submit">Créer la séance</Bouton>
      </div>
    </form>
  );
}