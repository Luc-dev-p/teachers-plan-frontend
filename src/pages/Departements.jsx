import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Departements() {
  const { axios } = useAuth();
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', code: '', description: '' });

  const fetchDepartements = async () => {
    try {
      const res = await axios.get('/api/enseignants/departements');
      setDepartements(res.data);
    } catch (err) {
      toast.error('Erreur lors du chargement des départements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/enseignants/departements/${editing.id}`, form);
        toast.success('Département modifié avec succès');
      } else {
        await axios.post('/api/enseignants/departements', form);
        toast.success('Département créé avec succès');
      }
      setShowModal(false);
      setForm({ nom: '', code: '', description: '' });
      setEditing(null);
      fetchDepartements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  const handleEdit = (dept) => {
    setEditing(dept);
    setForm({ nom: dept.nom, code: dept.code, description: dept.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) return;
    try {
      await axios.delete(`/api/enseignants/departements/${id}`);
      toast.success('Département supprimé');
      fetchDepartements();
    } catch (err) {
      toast.error('Impossible de supprimer ce département');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: '', code: '', description: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2B46]">Départements</h1>
          <p className="text-gray-500 mt-1">Gestion des départements de l'établissement</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1E6091] hover:bg-[#164a73] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau département
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E6091]" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Code</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Nom</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Description</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Créé le</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Aucun département trouvé
                  </td>
                </tr>
              ) : (
                departements.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="bg-[#48A9C5]/10 text-[#1E6091] text-xs font-mono px-2 py-1 rounded">
                        {dept.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#0F2B46]">{dept.nom}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">
                      {dept.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(dept.cree_le).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-[#1E6091] hover:text-[#164a73] p-1 rounded hover:bg-[#1E6091]/5 transition-colors"
                        title="Modifier"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#0F2B46]">
                {editing ? 'Modifier le département' : 'Nouveau département'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none"
                  placeholder="Ex: INFO, GEA, MATH..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none"
                  placeholder="Ex: Informatique"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#48A9C5] focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Description optionnelle..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditing(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1E6091] hover:bg-[#164a73] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}