import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { personsApi } from '../api/personsApi';

interface Person {
  id?: number;
  full_name: string;
  role?: string;
  access_status: string;
  image_folder?: string;
}

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (person: Person, photoFile?: File | null) => Promise<Person>;
  initialData?: Person;
  title?: string;
}

export function PersonModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Add Person'
}: PersonModalProps) {
  const [formData, setFormData] = useState<Person>({
    full_name: '',
    role: '',
    access_status: 'AUTHORIZED',
    image_folder: ''
  });
  const [newPersonPhoto, setNewPersonPhoto] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        full_name: '',
        role: '',
        access_status: 'AUTHORIZED',
        image_folder: ''
      });
    }
    setNewPersonPhoto(null);
    setSelectedFiles([]);
    setError('');
    setUploadError('');
    setUploadSuccess('');
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setUploadError('');
      setUploadSuccess('');
    }
  };

  const handleNewPersonPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setNewPersonPhoto(file);
    setError('');
  };

  const handleUploadImages = async () => {
    if (!initialData || !initialData.id) {
      setUploadError('Please save the person first before uploading images');
      return;
    }

    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one image');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      await personsApi.uploadPersonImages(initialData.id, selectedFiles);
      setUploadSuccess(`Successfully uploaded ${selectedFiles.length} image(s)`);
      setSelectedFiles([]);
      // Reset file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.full_name.trim()) {
        setError('Full name is required');
        setLoading(false);
        return;
      }

      await onSubmit(formData, !initialData?.id ? newPersonPhoto : null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save person');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800 sticky top-0 bg-neutral-900">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-500 text-xs uppercase font-bold tracking-widest">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g., John Doe"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Role or Description
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g., Manager, Security Personnel"
            />
          </div>

          {/* Access Status */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Access Status *
            </label>
            <select
              name="access_status"
              value={formData.access_status}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="AUTHORIZED">Authorized</option>
              <option value="NON_AUTHORIZED">Non-Authorized</option>
            </select>
          </div>

          {/* New person photo upload */}
          {!initialData?.id && (
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewPersonPhotoChange}
                className="block w-full text-[10px] font-mono text-neutral-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-widest file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-700 transition-colors focus:outline-none"
              />
              <p className="text-[9px] text-neutral-500 mt-1">
                Upload a face photo now or add training images later from the edit screen.
              </p>
              {newPersonPhoto && (
                <p className="text-[9px] text-neutral-400 mt-1 truncate">
                  Selected: {newPersonPhoto.name}
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
            >
              {loading || uploading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        {/* Image Upload Section (only if editing existing person) */}
        {initialData && initialData.id && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
              Face Images for Training
            </h3>

            {uploadError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-500 text-xs uppercase font-bold tracking-widest mb-3">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-500 text-xs uppercase font-bold tracking-widest mb-3">
                {uploadSuccess}
              </div>
            )}

            <div className="space-y-3">
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-[10px] font-mono text-neutral-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-widest file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-700 transition-colors focus:outline-none"
              />
              {selectedFiles.length > 0 && (
                <p className="text-[9px] text-neutral-500">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
              <button
                type="button"
                onClick={handleUploadImages}
                disabled={uploading || selectedFiles.length === 0}
                className="w-full px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <Upload className="w-3 h-3" />
                {uploading ? 'Uploading...' : 'Upload Images'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

