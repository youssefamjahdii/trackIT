
import React, { useState } from 'react';
import { Project } from '../types';
import { COLORS } from '../constants';

interface ProjectCreateFormProps {
  onCreate: (project: Project) => void;
}

const ProjectCreateForm: React.FC<ProjectCreateFormProps> = ({ onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const newProject: Project = {
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      ...formData,
      updates: []
    };

    setTimeout(() => {
      onCreate(newProject);
      setSubmitting(false);
      setFormData({
        name: '',
        owner: '',
        description: '',
        startDate: '',
        endDate: ''
      });
      alert('New initiative provisioned.');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="bg-[#002855] p-10 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Initiate Initiative</h2>
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-1">Configure Strategic Roadmap</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Initiative Name</label>
            <input 
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Unique Designation"
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Lead Officer</label>
            <input 
              required
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              placeholder="Officer Name"
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Activation Date</label>
            <input 
              required
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Estimated Completion</label>
            <input 
              required
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Mission Scope</label>
          <textarea 
            required
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Define the primary mission and technical parameters..."
            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all resize-none"
          />
        </div>

        <button 
          disabled={submitting}
          type="submit"
          className="w-full bg-[#002855] hover:bg-slate-900 text-white font-extrabold uppercase tracking-widest text-xs py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50 active:scale-[0.98]"
        >
          {submitting ? 'Initializing Protocols...' : 'Commit Roadmap'}
        </button>
      </form>
    </div>
  );
};

export default ProjectCreateForm;
