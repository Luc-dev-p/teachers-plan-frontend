import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import api from './services/api.js';

import Connexion from './pages/auth/Connexion.jsx';
import TableauDeBord from './pages/dashboard/TableauDeBord.jsx';
import EmploiDuTemps from './pages/emploi-du-temps/EmploiDuTemps.jsx';
import Layout from './components/layout/Layout.jsx';

export default function App() {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tp_token');
    const user = localStorage.getItem('tp_utilisateur');
    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Porteur ${token}`;
      setUtilisateur(JSON.parse(user));
    }
    setChargement(false);
  }, []);

  const connexion = (token, user) => {
    localStorage.setItem('tp_token', token);
    localStorage.setItem('tp_utilisateur', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Porteur ${token}`;
    setUtilisateur(user);
  };

  const deconnexion = () => {
    localStorage.removeItem('tp_token');
    localStorage.removeItem('tp_utilisateur');
    delete api.defaults.headers.common['Authorization'];
    setUtilisateur(null);
  };

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-snow">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ utilisateur, connexion, deconnexion }}>
      <Routes>
        <Route path="/connexion" element={!utilisateur ? <Connexion /> : <Navigate to="/" />} />
        <Route path="/" element={utilisateur ? <Layout /> : <Navigate to="/connexion" />}>
          <Route index element={<TableauDeBord />} />
          <Route path="emploi-du-temps" element={<EmploiDuTemps />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}