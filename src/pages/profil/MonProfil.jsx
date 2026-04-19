import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import Bouton from '../../components/ui/Bouton.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { User, Mail, Phone, BookOpen, Building2, Award, Shield, Camera } from 'lucide-react';

export default function MonProfil() {
  const { utilisateur, mettreAJour } = utiliserAuth();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);
  const [mdpModal, setMdpModal] = useState(false);

  useEffect(() => {
    if (utilisateur) {
      setForm({
        nom: utilisateur.nom || '',
        prenom: utilisateur.prenom || '',
        email: utilisateur.email || '',
        telephone: utilisateur.telephone || utilisateur.enseignant?.telephone || '',
      });
    }
  }, [utilisateur]);

  const sauvegarder = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    setSucces('');
    try {
      const res = await api.put('/profil', form);
      mettreAJour(res.data);
      setSucces('Profil mis à jour avec succès');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setChargement(false);
    }
  };

  const getLabelRole = (role) => {
    const labels = { admin: 'Administrateur', rh: 'Responsable RH', enseignant: 'Enseignant' };
    return labels[role] || role;
  };

  if (!utilisateur) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="page-title">Mon profil</h1>

      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}
      {succes && <Alerte type="succes" message={succes} fermer={() => setSucces('')} />}

      {/* Carte profil */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-midnight flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {utilisateur.prenom?.[0]}{utilisateur.nom?.[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-midnight font-display">{utilisateur.prenom} {utilisateur.nom}</h2>
            <p className="text-sm text-slate-500">{utilisateur.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge ${utilisateur.role === 'admin' ? 'badge-danger' : utilisateur.role === 'rh' ? 'badge-warning' : 'badge-info'}`}>
                <Shield size={12} className="mr-1" />{getLabelRole(utilisateur.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={sauvegarder} className="card p-6 space-y-4">
        <h3 className="font-bold text-midnight">Informations personnelles</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field flex items-center gap-2"><User size={14} /> Nom</label>
            <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="label-field flex items-center gap-2"><User size={14} /> Prénom</label>
            <input type="text" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required className="input-field" />
          </div>
        </div>
        <div>
          <label className="label-field flex items-center gap-2"><Mail size={14} /> Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field" />
        </div>
        <div>
          <label className="label-field flex items-center gap-2"><Phone size={14} /> Téléphone</label>
          <input type="text" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="input-field" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Bouton type="submit" chargement={chargement}>Enregistrer les modifications</Bouton>
          <Bouton variante="secondaire" onClick={() => setMdpModal(true)}>Modifier le mot de passe</Bouton>
        </div>
      </form>

      {/* Info enseignant */}
      {utilisateur.enseignant && (
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-midnight">Informations enseignant</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Matricule :</span> <span className="font-medium">{utilisateur.enseignant.matricule}</span></div>
            <div><span className="text-slate-500">Grade :</span> <span className="font-medium">{utilisateur.enseignant.grade || '—'}</span></div>
            <div><span className="text-slate-500">Spécialité :</span> <span className="font-medium">{utilisateur.enseignant.specialite || '—'}</span></div>
            <div><span className="text-slate-500">Département :</span> <span className="font-medium">{utilisateur.enseignant.departement?.nom || '—'}</span></div>
          </div>
        </div>
      )}

      {/* Modal mot de passe */}
      {mdpModal && <ModifierMotDePasse fermer={() => setMdpModal(false)} />}
    </div>
  );
}

function ModifierMotDePasse({ fermer }) {
  const [form, setForm] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const sauvegarder = async (e) => {
    e.preventDefault();
    if (form.nouveau !== form.confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.nouveau.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setChargement(true);
    setErreur('');
    try {
      await api.put('/profil/mot-de-passe', {
        ancien_mot_de_passe: form.ancien,
        nouveau_mot_de_passe: form.nouveau,
      });
      fermer();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setChargement(false);
    }
  };

  return (
    <Modal ouvert={true} fermer={fermer} titre="Modifier le mot de passe">
      {erreur && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{erreur}</div>}
      <form onSubmit={sauvegarder} className="space-y-4">
        <div>
          <label className="label-field">Ancien mot de passe</label>
          <input type="password" value={form.ancien} onChange={(e) => setForm({ ...form, ancien: e.target.value })} required className="input-field" />
        </div>
        <div>
          <label className="label-field">Nouveau mot de passe</label>
          <input type="password" value={form.nouveau} onChange={(e) => setForm({ ...form, nouveau: e.target.value })} required className="input-field" />
        </div>
        <div>
          <label className="label-field">Confirmer</label>
          <input type="password" value={form.confirmation} onChange={(e) => setForm({ ...form, confirmation: e.target.value })} required className="input-field" />
        </div>
        <div className="flex gap-3 pt-2">
          <Bouton variante="secondaire" onClick={fermer} type="button">Annuler</Bouton>
          <Bouton type="submit" chargement={chargement}>Changer le mot de passe</Bouton>
        </div>
      </form>
    </Modal>
  );
}