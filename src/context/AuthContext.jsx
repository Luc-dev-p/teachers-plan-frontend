import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export const AuthContext = createContext(null);

export const utiliserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('utiliserAuth doit être utilisé dans AuthContext');
  return context;
};

export default function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tp_token');
    const user = localStorage.getItem('tp_utilisateur');
    if (token && user) {
      try {
        api.defaults.headers.common['Authorization'] = `Porteur ${token}`;
        setUtilisateur(JSON.parse(user));
      } catch {
        localStorage.removeItem('tp_token');
        localStorage.removeItem('tp_utilisateur');
      }
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

  const mettreAJour = (donnees) => {
    const nouveau = { ...utilisateur, ...donnees };
    localStorage.setItem('tp_utilisateur', JSON.stringify(nouveau));
    setUtilisateur(nouveau);
  };

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, connexion, deconnexion, mettreAJour }}>
      {children}
    </AuthContext.Provider>
  );
}