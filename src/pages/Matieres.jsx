import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Matieres() {
  const { axios } = useAuth();
  const [matieres, setMatieres] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', code: '', credit: '', coefficient: '1', type_cours: 'CM', filiere_id: '', description: '' });

  const fetchData = async () => {
    try {
      const [resMatieres, resFilieres] = await Promise.all([
        axios.get('/api/enseignants/matieres'),
        axios.get('/api/enseignants/filieres')
      ]);
      setMatieres(resMatieres.data);
      setFilieres(resFilieres.data);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, credit: parseInt(form.credit) || 0, coefficient: parseInt(form.coefficient) || 1 };
      if (editing) {
        await axios.put(`/api/enseignants/matieres/${editing.id}`, payload);
        toast.success('Matière modifiée');
      } else {
        await axios.post('/api/enseignants/matieres', payload);
        toast.success('Matière créée');
      }
      resetAndClose();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (m) => {
    setEditing(m);
    setForm({ nom: m.nom, code: m.code, credit: m.credit?.toString() || '', coefficient: m.coefficient?.toString() || '1', type_cours: m.type_cours || 'CM', filiere_id: m.filiere_id, description: m.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette matière ?')) return;
    try {
      await axios.delete(`/api/enseignants/matieres/${id}`);
      toast.success('Matière supprimée');
      fetchData();
    } catch (err) {
      toast.error('Impossible de supprimer');
    }
  };

  const resetAndClose = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ nom: '', code: '', credit: '', coefficient: '1', type_cours: 'CM', filiere_id: '', description: '' });
  };

  const getFiliereNom = (id) => { const f = filieres.find(x => x.id === id); return f ? f.nom : '—'; };

  const typeBadge = (type) => {
    const colors = { CM: 'bg-blue-100 text-blue-700', TD: 'bg-green-100 text-green-700', TP: 'bg-orange-100 text-orange-700' };
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>{type}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2B46]">Matières</h1>
          <p className="text-gray-500 mt-1">Gestion des matières enseignées</p>
        </div>
        <button onClick={() => { resetAndClose(); setShowModal(true); }} className="bg-[#1E6091] hover:bg-[#164a73] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nouvelle matière
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E6091]" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Code</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Nom</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Crédit</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Coeff</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Filière</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matieres.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucune matière trouvée</td></tr>
              ) : (
                matieres.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4"><span className="bg-[#48A9C5]/10 text-[#1E6091] text-xs font-mono px-2 py-1 rounded">{m.code}</span></td>
                    <td className="px-6 py-4 font-medium text-[#0F2B46]">{m.nom}</td>
                    <td className="px-6 py-4">{typeBadge(m.type_cours)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{m.credit}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{m.coefficient}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{getFiliereNom(m.filiere_id)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(m)} className="text-[#1E6091] hover:text-[#164a73] p-1 rounded hover:bg-[#1E6091]/5 transition-colors" title="Modifier">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors" title="Supprimer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#0F2B46]">{editing ? 'Modifier la matière' : 'Nouvelle matière'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" placeholder="Ex: PROG-101" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" placeholder="Ex: Programmation C" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crédit</label>
                  <input type="number" value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coefficient</label>
                  <input type="number" value={form.coefficient} onChange={(e) => setForm({ ...form, coefficient: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de cours *</label>
                <select value={form.type_cours} onChange={(e) => setForm({ ...form, type_cours: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required>
                  <option value="CM">CM (Cours Magistral)</option>
                  <option value="TD">TD (Travaux Dirigés)</option>
                  <option value="TP">TP (Travaux Pratiques)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filière *</label>
                <select value={form.filiere_id} onChange={(e) => setForm({ ...form, filiere_id: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none" required>
                  <option value="">-- Sélectionner --</option>
                  {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none resize-none" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetAndClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 bg-[#1E6091] hover:bg-[#164a73] text-white px-4 py-2 rounded-lg transition-colors">{editing ? 'Modifier' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}