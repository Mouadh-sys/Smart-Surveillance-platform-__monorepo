import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Edit, Search } from 'lucide-react';
import { personsApi } from '../api/personsApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { PersonModal } from '../components/PersonModal';

export default function Persons() {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchPersons = async () => {
    try {
      setLoading(true);
      const data = await personsApi.getPersons();
      setPersons(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this person?")) {
       try {
         await personsApi.deletePerson(id);
         fetchPersons();
       } catch (error) {
         console.error(error);
       }
    }
  };

  const handleOpenAddModal = () => {
    setEditingPerson(null);
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (person: any) => {
    setEditingPerson(person);
    setError('');
    setModalOpen(true);
  };

  const handleCreatePerson = async (personData: any, photoFile?: File | null) => {
    try {
      const createdPerson = await personsApi.createPerson(personData);
      let uploadError: unknown = null;
      try {
        if (photoFile && createdPerson?.id) {
          await personsApi.uploadPersonImages(createdPerson.id, [photoFile]);
        }
      } catch (uploadErr) {
        uploadError = uploadErr;
      }
      setError('');
      await fetchPersons();
      if (uploadError) {
        return Promise.reject(uploadError instanceof Error ? uploadError : new Error('Failed to upload person photo'));
      }
      return createdPerson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create person');
      throw err;
    }
  };

  const handleUpdatePerson = async (personData: any, _photoFile?: File | null) => {
    try {
      const updatedPerson = await personsApi.updatePerson(editingPerson.id, personData);
      setError('');
      await fetchPersons();
      return updatedPerson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update person');
      throw err;
    }
  };

  const handleModalSubmit = async (personData: any, photoFile?: File | null) => {
    if (editingPerson) {
      return await handleUpdatePerson(personData, photoFile);
    } else {
      return await handleCreatePerson(personData, photoFile);
    }
  };

  if (loading && persons.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded text-rose-500 text-xs uppercase font-bold tracking-widest">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" /> Persons Registry
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Manage expected individuals and their access statuses.</p>
        </div>
        <button onClick={handleOpenAddModal} className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
           <Plus className="w-3 h-3" />
           <span>Add Entity</span>
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
         <div className="p-3 border-b border-neutral-800 bg-neutral-800/30 flex justify-between items-center">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
               <input 
                 type="text" 
                 placeholder="Search registry..." 
                 className="bg-black border border-neutral-800 rounded pl-9 pr-4 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 w-full font-mono transition-colors focus:outline-none"
               />
             </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-800 bg-[#0d0d0f]">
                <tr>
                  <th className="px-4 py-2">Identity / Alias</th>
                  <th className="px-4 py-2">Role Classification</th>
                  <th className="px-4 py-2">Clearance Level</th>
                  <th className="px-4 py-2">Data Source Node</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-neutral-400 font-mono">
                 {persons.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-600 text-[10px] uppercase tracking-widest font-bold">No entities indexed in registry.</td></tr>
                 ) : persons.map((person) => (
                    <tr key={person.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                       <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                             <div className="h-7 w-7 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs mr-3">
                                {person.full_name?.charAt(0).toUpperCase()}
                             </div>
                             <div className="font-bold text-white uppercase">{person.full_name}</div>
                          </div>
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap text-neutral-500 uppercase">
                          {person.role || 'N/A'}
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={person.access_status} />
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap text-neutral-500">
                          {person.image_folder}
                       </td>
                       <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-3">
                             <button onClick={() => handleOpenEditModal(person)} className="text-neutral-500 hover:text-white transition-colors" title="Modify Record">
                                <Edit className="w-4 h-4" />
                             </button>
                             <button onClick={() => handleDelete(person.id)} className="text-rose-500 hover:text-rose-400 transition-colors" title="Purge Record">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>
         </div>
      </div>

      <PersonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingPerson}
        title={editingPerson ? `Edit: ${editingPerson.full_name}` : 'Add Person'}
      />
    </div>
  );
}
