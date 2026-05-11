import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Camera {
  id?: number;
  camera_code: string;
  name: string;
  source: string;
  location?: string;
  is_active?: boolean;
}

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (camera: Camera) => Promise<void>;
  initialData?: Camera;
  title?: string;
}

export function CameraModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Add Camera'
}: CameraModalProps) {
  const [formData, setFormData] = useState<Camera>({
    camera_code: '',
    name: '',
    source: '',
    location: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        camera_code: '',
        name: '',
        source: '',
        location: '',
        is_active: true
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.camera_code.trim()) {
        setError('Camera code is required');
        setLoading(false);
        return;
      }
      if (!formData.name.trim()) {
        setError('Camera name is required');
        setLoading(false);
        return;
      }
      if (!formData.source.trim()) {
        setError('Camera source is required');
        setLoading(false);
        return;
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save camera');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
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

          {/* Camera Code */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Camera Code *
            </label>
            <input
              type="text"
              name="camera_code"
              value={formData.camera_code}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g., CAM-001"
              disabled={!!initialData}
            />
          </div>

          {/* Camera Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Camera Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g., Main Entrance"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Camera Source *
            </label>
            <textarea
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              rows={2}
              placeholder="e.g., 0 for webcam, URL for IP camera, or file path"
            />
            <p className="text-[9px] text-neutral-500 mt-1">
              0 = laptop webcam, URL = IP camera, file path = video file
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g., Lobby 2nd Floor"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-black border border-neutral-800 text-indigo-500 focus:outline-none"
            />
            <label className="ml-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Active
            </label>
          </div>

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
              disabled={loading}
              className="flex-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


