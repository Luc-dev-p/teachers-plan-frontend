import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [ouvert, setOuvert] = useState(true);

  const basculer = () => setOuvert((prev) => !prev);
  const fermer = () => setOuvert(false);
  const ouvrir = () => setOuvert(true);

  return (
    <SidebarContext.Provider value={{ ouvert, basculer, fermer, ouvrir }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function utiliserSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('utiliserSidebar doit être utilisé dans un SidebarProvider');
  }
  return context;
}

export default SidebarContext;