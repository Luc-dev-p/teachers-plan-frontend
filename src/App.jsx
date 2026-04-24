import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, utiliserAuth } from './context/AuthContext.jsx';
import { SidebarProvider } from './context/SidebarContext.jsx';
import api from './services/api.js';

import Layout from './components/layout/Layout.jsx';
import Connexion from './pages/auth/Connexion.jsx';
import MotDePasseOublie from './pages/auth/MotDePasseOublie.jsx';
import ReinitialiserMdp from './pages/auth/ReinitialiserMdp.jsx';
import TableauDeBord from './pages/dashboard/TableauDeBord.jsx';
import Enseignants from './pages/enseignants/Enseignants.jsx';
import Departements from './pages/departements/Departements.jsx';
import Filieres from './pages/Filieres.jsx';
import Niveaux from './pages/Niveaux.jsx';
import Classes from './pages/Classes.jsx';
import Salles from './pages/Salles.jsx';
import Matieres from './pages/matieres/Matieres.jsx';
import Seances from './pages/seances/Seances.jsx';
import Heures from './pages/heures/Heures.jsx';
import EmploiDuTemps from './pages/emploi-du-temps/EmploiDuTemps.jsx';
import Parametres from './pages/parametres/Parametres.jsx';
import Exports from './pages/exports/Exports.jsx';
import MonProfil from './pages/profil/MonProfil.jsx';

function RoutesPrivees() {
  const { utilisateur, chargement } = utiliserAuth();

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-snow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  const tokenLocal = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!utilisateur && !tokenLocal) return <Navigate to="/connexion" />;

  return (
    <SidebarProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TableauDeBord />} />
          <Route path="enseignants" element={<Enseignants />} />
          <Route path="departements" element={<Departements />} />
          <Route path="filieres" element={<Filieres />} />
          <Route path="niveaux" element={<Niveaux />} />
          <Route path="classes" element={<Classes />} />
          <Route path="salles" element={<Salles />} />
          <Route path="matieres" element={<Matieres />} />
          <Route path="seances" element={<Seances />} />
          <Route path="heures" element={<Heures />} />
          <Route path="emploi-du-temps" element={<EmploiDuTemps />} />
          <Route path="parametres" element={<Parametres />} />
          <Route path="exports" element={<Exports />} />
          <Route path="profil" element={<MonProfil />} />
        </Route>
      </Routes>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ReinitialiserMdp />} />
        <Route path="/*" element={<RoutesPrivees />} />
      </Routes>
    </AuthProvider>
  );
}